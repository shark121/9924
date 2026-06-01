import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { products } from "@/lib/data";
import {
  assertValidItems,
  getRateByToken,
  COUNTRY_CODE,
  type IncomingItem,
  type ShippingAddressInput,
} from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAX_RATE = 0.08;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    items?: IncomingItem[];
    email?: string;
    shipping?: ShippingAddressInput;
    shippingRateToken?: string;
  };

  if (!body.items?.length) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    assertValidItems(body.items);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 400 });
  }

  // Price the cart server-side — never trust client amounts.
  let subtotalCents = 0;
  const productMap = new Map(products.map((p) => [p.id, p]));
  const lineMeta: { name: string; size: string; qty: number }[] = [];
  for (const item of body.items) {
    const product = productMap.get(item.productId)!;
    const qty = Math.max(1, Math.floor(item.quantity));
    subtotalCents += Math.round(product.price * 100) * qty;
    lineMeta.push({ name: product.name, size: item.size, qty });
  }
  const taxCents = Math.round(subtotalCents * TAX_RATE);

  const s = body.shipping;
  if (!s?.address) {
    return Response.json({ error: "Shipping address required" }, { status: 400 });
  }
  if (!body.shippingRateToken) {
    return Response.json({ error: "Select a shipping option" }, { status: 400 });
  }

  // Re-fetch the chosen rate server-side so the shipping charge can't be forged.
  let rate;
  try {
    rate = await getRateByToken({ ...s, email: body.email }, body.items, body.shippingRateToken);
  } catch (e) {
    return Response.json(
      { error: typeof e === "string" ? e : "Shipping lookup failed" },
      { status: 400 }
    );
  }
  if (!rate) {
    return Response.json(
      { error: "Selected shipping option is no longer available" },
      { status: 409 }
    );
  }

  const shippingCents = rate.amountCents;
  const totalCents = subtotalCents + taxCents + shippingCents;

  // Record shipping onto the PaymentIntent before payment is confirmed.
  const shipping = {
    name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Customer",
    phone: s.phone || undefined,
    address: {
      line1: s.address,
      line2: s.apartment || undefined,
      city: s.city,
      state: s.state || undefined,
      postal_code: s.postal,
      country: COUNTRY_CODE[s.country ?? ""] ?? "US",
    },
  };

  const intent = await getStripe().paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    receipt_email: body.email || undefined,
    shipping,
    metadata: {
      items: JSON.stringify(lineMeta).slice(0, 500),
      subtotal_cents: String(subtotalCents),
      tax_cents: String(taxCents),
      shipping_cents: String(shippingCents),
      shipping_service: `${rate.provider} ${rate.name}`.slice(0, 100),
    },
  });

  return Response.json({ clientSecret: intent.client_secret, amount: totalCents });
}
