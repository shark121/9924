import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";

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
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      // TODO: persist order to DB when one exists
      console.log("[stripe] paid", {
        id: pi.id,
        amount: pi.amount,
        email: pi.receipt_email,
        items: pi.metadata?.items,
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      console.warn("[stripe] failed", { id: pi.id, error: pi.last_payment_error?.message });
      break;
    }
  }

  return Response.json({ received: true });
}
