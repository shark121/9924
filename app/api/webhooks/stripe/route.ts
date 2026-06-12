import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { recordOrder } from "@/lib/orders-db";
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
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      try {
        await recordOrder(pi);
      } catch (err) {
        // Surface the failure with a non-2xx so Stripe retries (it redelivers
        // for up to ~3 days). recordOrder upserts on the intent id, so retries
        // and the success-page fallback are both safe. Swallowing this and
        // returning 200 silently drops the order — it never appears in admin.
        console.error("[stripe] failed to persist order", pi.id, err);
        return new Response("Failed to persist order", { status: 500 });
      }
      console.log("[stripe] paid", {
        id: pi.id,
        amount: pi.amount,
        email: pi.receipt_email,
        shipping: pi.shipping,
        items: pi.metadata?.items,
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      console.warn("[stripe] failed", {
        id: pi.id,
        error: pi.last_payment_error?.message,
      });
      break;
    }
  }

  return Response.json({ received: true });
}
