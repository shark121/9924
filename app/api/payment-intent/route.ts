import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { products } from "@/lib/data";

const TAX_RATE = 0.08;

type IncomingItem = { productId: string; size: string; quantity: number };

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    items?: IncomingItem[];
    email?: string;
  };

  if (!body.items?.length) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  let subtotalCents = 0;
  const productMap = new Map(products.map((p) => [p.id, p]));
  const lineMeta: { name: string; size: string; qty: number }[] = [];

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
    subtotalCents += Math.round(product.price * 100) * qty;
    lineMeta.push({ name: product.name, size: item.size, qty });
  }

  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  const intent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    receipt_email: body.email || undefined,
    metadata: {
      items: JSON.stringify(lineMeta).slice(0, 500),
      subtotal_cents: String(subtotalCents),
      tax_cents: String(taxCents),
    },
  });

  return Response.json({
    clientSecret: intent.client_secret,
    amount: totalCents,
  });
}
