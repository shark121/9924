import { products } from "@/lib/data";

// Shippo multi-carrier rates API. Token is server-only; never expose to client.
const SHIPPO_TOKEN = process.env.SHIPPO_API_TOKEN;
const SHIPPO_BASE = "https://api.goshippo.com";

// Human-readable form labels -> ISO 3166-1 alpha-2 (what carriers/Stripe expect).
export const COUNTRY_CODE: Record<string, string> = {
  "UNITED STATES": "US",
  "UNITED KINGDOM": "GB",
  JAPAN: "JP",
};

export type IncomingItem = { productId: string; size: string; quantity: number };

export type ShippingAddressInput = {
  firstName?: string;
  lastName?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  postal?: string;
  phone?: string;
  email?: string;
};

export type NormalizedRate = {
  // servicelevel token (e.g. "usps_priority") — stable across requests, so we
  // trust this from the client as the *selection*, then re-price server-side.
  token: string;
  name: string; // e.g. "Priority Mail"
  provider: string; // e.g. "USPS"
  amountCents: number;
  currency: string;
  estimatedDays: number | null;
};

// Flat-rate fallback used when the carrier API returns no quotes for an
// address. Better to offer a fixed price and complete the sale than to dead-end
// the customer with "no options found". Stable token so the payment-intent
// re-price (getRateByToken) resolves to the same rate. Tune via env.
const FLAT_FALLBACK_CENTS = Math.round(
  Number(process.env.SHIP_FLAT_FALLBACK_USD ?? "15") * 100
);
const FLAT_FALLBACK_RATE: NormalizedRate = {
  token: "flat_standard",
  name: "Standard Shipping",
  provider: "Standard",
  amountCents: FLAT_FALLBACK_CENTS,
  currency: "USD",
  estimatedDays: null,
};

// Jerseys are light and similar; a flat per-item estimate inside one poly mailer
// is plenty for a rate quote. Tune via env without touching code.
const PER_ITEM_WEIGHT_KG = Number(process.env.SHIP_ITEM_WEIGHT_KG ?? "0.4");
const PARCEL = {
  length: process.env.SHIP_PARCEL_L ?? "33",
  width: process.env.SHIP_PARCEL_W ?? "25",
  height: process.env.SHIP_PARCEL_H ?? "6",
  distance_unit: "cm",
  mass_unit: "kg",
};

function originAddress() {
  return {
    name: process.env.SHIP_FROM_NAME ?? "9924",
    street1: process.env.SHIP_FROM_STREET1 ?? "20 W 34th St",
    city: process.env.SHIP_FROM_CITY ?? "New York",
    state: process.env.SHIP_FROM_STATE ?? "NY",
    zip: process.env.SHIP_FROM_ZIP ?? "10001",
    country: process.env.SHIP_FROM_COUNTRY ?? "US",
    phone: process.env.SHIP_FROM_PHONE ?? "",
  };
}

export function totalQuantity(items: IncomingItem[]): number {
  return items.reduce((n, it) => n + Math.max(1, Math.floor(it.quantity)), 0);
}

// Validate items against the catalog. Throws a user-safe string on bad input.
export function assertValidItems(items: IncomingItem[]): void {
  const map = new Map(products.map((p) => [p.id, p]));
  for (const it of items) {
    const p = map.get(it.productId);
    if (!p) throw `Unknown product: ${it.productId}`;
    if (!p.sizes.includes(it.size)) throw `Invalid size for ${p.name}`;
  }
}

function toAddressTo(s: ShippingAddressInput) {
  return {
    name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Customer",
    street1: s.address ?? "",
    street2: s.apartment || undefined,
    city: s.city ?? "",
    state: s.state ?? "",
    zip: s.postal ?? "",
    country: COUNTRY_CODE[s.country ?? ""] ?? "US",
    phone: s.phone || undefined,
    email: s.email || undefined,
  };
}

// Fetch live rate quotes for a destination + cart. Returns cheapest-first.
export async function getRates(
  to: ShippingAddressInput,
  items: IncomingItem[]
): Promise<NormalizedRate[]> {
  if (!SHIPPO_TOKEN) throw "SHIPPO_API_TOKEN is not set";

  const qty = Math.max(1, totalQuantity(items));
  const parcel = { ...PARCEL, weight: (qty * PER_ITEM_WEIGHT_KG).toFixed(2) };

  const res = await fetch(`${SHIPPO_BASE}/shipments`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${SHIPPO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address_from: originAddress(),
      address_to: toAddressTo(to),
      parcels: [parcel],
      async: false,
    }),
  });

  if (!res.ok) throw `Shipping provider error (${res.status})`;

  const data = (await res.json()) as {
    rates?: Array<{
      amount: string;
      currency: string;
      provider: string;
      estimated_days: number | null;
      servicelevel?: { name?: string; token?: string };
    }>;
  };

  const normalized = (data.rates ?? [])
    .filter((r) => r.servicelevel?.token)
    .map<NormalizedRate>((r) => ({
      token: r.servicelevel!.token!,
      name: r.servicelevel!.name ?? "Shipping",
      provider: r.provider,
      amountCents: Math.round(parseFloat(r.amount) * 100),
      currency: (r.currency ?? "USD").toUpperCase(),
      estimatedDays: r.estimated_days ?? null,
    }))
    .sort((a, b) => a.amountCents - b.amountCents);

  // No carrier quotes for this destination — fall back to the flat rate so the
  // customer can still check out.
  return normalized.length ? normalized : [FLAT_FALLBACK_RATE];
}

// Re-price a previously selected service server-side (authoritative).
export async function getRateByToken(
  to: ShippingAddressInput,
  items: IncomingItem[],
  token: string
): Promise<NormalizedRate | null> {
  const rates = await getRates(to, items);
  return rates.find((r) => r.token === token) ?? null;
}
