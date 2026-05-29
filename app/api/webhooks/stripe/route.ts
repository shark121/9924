import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // payment_status is "paid" for card; may be "unpaid"/"no_payment_required"
      // for async methods — only fulfill when actually paid.
      if (session.payment_status === "paid") {
        // TODO: persist order to DB when one exists
        console.log("[stripe] checkout completed", {
          id: session.id,
          amount: session.amount_total,
          email: session.customer_details?.email,
          items: session.metadata?.items,
        });
      }
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      console.warn("[stripe] async payment failed", { id: session.id });
      break;
    }
  }

  return Response.json({ received: true });
}
