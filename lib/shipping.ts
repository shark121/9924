import { listProducts } from "@/lib/products-db";
import { getSetting } from "@/lib/settings-db";
import { COUNTRIES } from "@/lib/countries";

// Shippo multi-carrier rates API. Token is server-only; never expose to client.
const SHIPPO_TOKEN = process.env.SHIPPO_API_TOKEN;
const SHIPPO_BASE = "https://api.goshippo.com";

// Human-readable form labels -> ISO 3166-1 alpha-2 (what carriers/Stripe expect).
// Built from the shared country list so the <select>, this map, and the address
// autocomplete can never drift apart. Keys are upper-cased names.
export const COUNTRY_CODE: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.name.toUpperCase(), c.code])
);

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

// Shipping policy: free to the origin country (domestic), one flat fee for
// everyone else (international). Live carrier quotes are still fetched, but only
// for service names and delivery estimates — the amount charged follows this
// policy, not the carrier's number. Values are read per-call so the admin
// Settings page can change them (DB override) without a redeploy, falling back
// to env, then to defaults.
export async function getShippingPolicy(): Promise<{
  intlFlatCents: number;
  originCountry: string;
}> {
  const [intlSetting, originSetting] = await Promise.all([
    getSetting("ship_intl_flat_usd"),
    getSetting("ship_from_country"),
  ]);
  const intlFlatUsd = Number(
    intlSetting ?? process.env.SHIP_INTL_FLAT_USD ?? "30"
  );
  const originCountry = (
    originSetting ?? process.env.SHIP_FROM_COUNTRY ?? "US"
  ).toUpperCase();
  return {
    intlFlatCents: Math.round((Number.isFinite(intlFlatUsd) ? intlFlatUsd : 30) * 100),
    originCountry,
  };
}

// 0 for domestic, the flat international fee for everywhere else.
async function shippingCentsFor(country: string): Promise<number> {
  const { intlFlatCents, originCountry } = await getShippingPolicy();
  return country.toUpperCase() === originCountry ? 0 : intlFlatCents;
}

// A guaranteed selectable option when no carrier quote comes back, so checkout
// never dead-ends. Priced by the same policy as the live rates (caller resolves
// the policy once and passes the cents). Stable token so the payment-intent
// re-price (getRateByToken) resolves to the same rate.
function flatFallbackRate(amountCents: number): NormalizedRate {
  return {
    token: "flat_standard",
    name: "Standard Shipping",
    provider: "Standard",
    amountCents,
    currency: "USD",
    estimatedDays: null,
  };
}

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
export async function assertValidItems(items: IncomingItem[]): Promise<void> {
  // Include archived products so a cart formed before a product was archived can
  // still complete checkout.
  const map = new Map(
    (await listProducts({ includeArchived: true })).map((p) => [p.id, p])
  );
  for (const it of items) {
    const p = map.get(it.productId);
    if (!p) throw `Unknown product: ${it.productId}`;
    if (!p.sizes.includes(it.size)) throw `Invalid size for ${p.name}`;
    if (p.unavailableSizes.includes(it.size))
      throw `${p.name} (${it.size}) is sold out`;
  }
}

// Coerce any input-field value to a clean, trimmed string. The form fields are
// controlled <input>s (always strings), but a programmatic caller, a number, or
// null/undefined shouldn't leak a non-string into the Shippo body.
function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

// Map a free-form country value to the ISO 3166-1 alpha-2 code Shippo expects.
// Tolerant of case/whitespace and already-ISO input, so "united states",
// " UNITED STATES", and "US" all resolve. Returns "" (not a silent "US"
// default) when unknown so callers can see a real geocoding failure instead of
// shipping a foreign address to the US.
const COUNTRY_BY_ISO = new Set(Object.values(COUNTRY_CODE));
function toCountryCode(raw: unknown): string {
  const v = str(raw).toUpperCase();
  if (!v) return "";
  if (COUNTRY_CODE[v]) return COUNTRY_CODE[v]; // label -> ISO
  if (COUNTRY_BY_ISO.has(v)) return v; // already an ISO code we support
  return "";
}

function toAddressTo(s: ShippingAddressInput) {
  return {
    name: `${str(s.firstName)} ${str(s.lastName)}`.trim() || "Customer",
    street1: str(s.address),
    street2: str(s.apartment) || undefined,
    city: str(s.city),
    state: str(s.state),
    zip: str(s.postal),
    country: toCountryCode(s.country),
    phone: str(s.phone) || undefined,
    email: str(s.email) || undefined,
  };
}

// Server-only diagnostics about a rate lookup. Kept for the application logs;
// never returned to the client. Never contains the API token or any secret.
export type ShippoDebug = {
  tokenPresent: boolean;
  destination: {
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  httpStatus: number | null; // Shippo HTTP status, null if the call never ran
  rateCount: number; // usable rates after normalization
  usedFallback: boolean; // true => the $15 flat rate was substituted
  messages: string[]; // Shippo `messages` + any local reason for fallback
  error?: string; // network/HTTP error reaching Shippo
};

// Fetch live rate quotes for a destination + cart, plus diagnostics. Rates are
// cheapest-first. `getRates` below is the thin back-compat wrapper.
export async function getRatesWithDebug(
  to: ShippingAddressInput,
  items: IncomingItem[]
): Promise<{ rates: NormalizedRate[]; debug: ShippoDebug }> {
  const addressTo = toAddressTo(to);
  const debug: ShippoDebug = {
    tokenPresent: !!SHIPPO_TOKEN,
    destination: {
      street1: addressTo.street1,
      city: addressTo.city,
      state: addressTo.state,
      zip: addressTo.zip,
      country: addressTo.country,
    },
    httpStatus: null,
    rateCount: 0,
    usedFallback: false,
    messages: [],
  };

  // Resolve the shipping policy once for this request.
  const policyCents = await shippingCentsFor(addressTo.country);

  // No token configured — don't dead-end checkout; use the flat fallback.
  if (!SHIPPO_TOKEN) {
    const msg = "SHIPPO_API_TOKEN not set on the server — using flat fallback.";
    console.warn(`[shipping] ${msg}`);
    debug.usedFallback = true;
    debug.messages.push(msg);
    return { rates: [flatFallbackRate(policyCents)], debug };
  }

  const qty = Math.max(1, totalQuantity(items));
  const parcel = { ...PARCEL, weight: (qty * PER_ITEM_WEIGHT_KG).toFixed(2) };

  console.log(
    `[shipping] rate request -> ${addressTo.street1 || "(no street)"}, ` +
      `${addressTo.city || "(no city)"} ${addressTo.state || "-"} ` +
      `${addressTo.zip || "(no zip)"} ${addressTo.country || "(no country)"}`
  );
  if (!addressTo.country) {
    const msg = `country "${String(to.country)}" did not map to a supported ISO code — Shippo will reject this as an invalid destination.`;
    console.warn(`[shipping] ${msg}`);
    debug.messages.push(msg);
  }

  let res: Response;
  try {
    res = await fetch(`${SHIPPO_BASE}/shipments`, {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${SHIPPO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: originAddress(),
        address_to: addressTo,
        parcels: [parcel],
        async: false,
      }),
    });
  } catch (e) {
    // Network/DNS error reaching Shippo — fall back rather than fail the sale.
    console.error("[shipping] could not reach Shippo:", e);
    debug.usedFallback = true;
    debug.error = `Could not reach Shippo: ${
      e instanceof Error ? e.message : String(e)
    }`;
    debug.messages.push(debug.error);
    return { rates: [flatFallbackRate(policyCents)], debug };
  }

  debug.httpStatus = res.status;

  if (!res.ok) {
    // 401 (bad token), 4xx (rejected address), 5xx — surface the real reason
    // but still let the customer check out at the flat rate.
    const detail = await res.text().catch(() => "");
    console.error(`[shipping] Shippo ${res.status}: ${detail.slice(0, 300)}`);
    debug.usedFallback = true;
    debug.error = `Shippo HTTP ${res.status}: ${detail.slice(0, 300)}`;
    debug.messages.push(debug.error);
    return { rates: [flatFallbackRate(policyCents)], debug };
  }

  const data = (await res.json()) as {
    rates?: Array<{
      amount: string;
      currency: string;
      provider: string;
      estimated_days: number | null;
      servicelevel?: { name?: string; token?: string };
    }>;
    // Shippo returns 200 even when a carrier can't quote, explaining why in
    // `messages` (e.g. "out of service area", "carrier account doesn't support
    // …"). Surface these — without them an empty rate set is a silent mystery.
    messages?: Array<{ source?: string; code?: string; text?: string }>;
  };

  // Capture Shippo's own messages even on success — they explain partial
  // carrier failures too.
  debug.messages.push(
    ...(data.messages ?? [])
      .map((m) => `${m.source ?? "Shippo"}: ${m.text ?? ""}`.trim())
      .filter(Boolean)
  );

  const normalized = (data.rates ?? [])
    .filter((r) => r.servicelevel?.token)
    .map<NormalizedRate>((r) => ({
      token: r.servicelevel!.token!,
      name: r.servicelevel!.name ?? "Shipping",
      provider: r.provider,
      // Ignore the carrier's quoted amount; charge by policy (free domestic,
      // flat international) based on the destination country.
      amountCents: policyCents,
      currency: (r.currency ?? "USD").toUpperCase(),
      estimatedDays: r.estimated_days ?? null,
    }))
    .sort((a, b) => a.amountCents - b.amountCents);
  debug.rateCount = normalized.length;

  if (normalized.length) {
    console.log(
      `[shipping] Shippo returned ${normalized.length} rate(s); cheapest ` +
        `${normalized[0].provider} ${normalized[0].name} ` +
        `$${(normalized[0].amountCents / 100).toFixed(2)}`
    );
    return { rates: normalized, debug };
  }

  // No carrier quotes for this destination — fall back to the flat rate so the
  // customer can still check out, but record why so this isn't a black box.
  debug.usedFallback = true;
  console.warn(
    "[shipping] Shippo returned 0 usable rates — using flat fallback. " +
      `Destination: ${JSON.stringify(debug.destination)}.` +
      (debug.messages.length ? ` Messages: ${debug.messages.join(" | ")}` : "")
  );
  return { rates: [flatFallbackRate(policyCents)], debug };
}

// Fetch live rate quotes for a destination + cart. Returns cheapest-first.
export async function getRates(
  to: ShippingAddressInput,
  items: IncomingItem[]
): Promise<NormalizedRate[]> {
  return (await getRatesWithDebug(to, items)).rates;
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
