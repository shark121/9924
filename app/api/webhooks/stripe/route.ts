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
        recordOrder(pi);
      } catch (err) {
        // Don't fail the webhook (Stripe would retry) if persistence hiccups —
        // log it so the order can be recovered from the Stripe dashboard.
        console.error("[stripe] failed to persist order", pi.id, err);
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
