import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { products } from "@/lib/data";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = { productId: string; size: string; quantity: number };
type LineItem = NonNullable<
  Stripe.Checkout.SessionCreateParams["line_items"]
>[number];

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { items?: IncomingItem[] };

  if (!body.items?.length) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const lineItems: LineItem[] = [];

  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return Response.json(
        { error: `Unknown product: ${item.productId}` },
        { status: 400 }
      );
    }
    if (!product.sizes.includes(item.size)) {
      return Response.json(
        { error: `Invalid size for ${product.name}` },
        { status: 400 }
      );
    }
    const qty = Math.max(1, Math.floor(item.quantity));
    // Stripe product_data.images must be public absolute URLs — skip local paths.
    const images = product.images.filter((src) => /^https?:\/\//.test(src));

    lineItems.push({
      quantity: qty,
      price_data: {
        currency: "usd",
        // price is authoritative from the server, never the client
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: `${product.name} — ${item.size}`,
          images: images.length ? [images[0]] : undefined,
          metadata: { productId: product.id, sku: product.sku, size: item.size },
        },
      },
    });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    shipping_address_collection: { allowed_countries: ["US", "GB", "JP"] },
    phone_number_collection: { enabled: true },
    billing_address_collection: "auto",
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: "Standard",
          fixed_amount: { amount: 1000, currency: "usd" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: "Express",
          fixed_amount: { amount: 2500, currency: "usd" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ],
    metadata: {
      items: JSON.stringify(
        body.items.map((i) => ({ id: i.productId, size: i.size, qty: i.quantity }))
      ).slice(0, 500),
    },
  });

  return Response.json({ url: session.url });
}
