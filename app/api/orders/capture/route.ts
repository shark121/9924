import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { recordOrder } from "@/lib/orders-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fallback order capture, called from the checkout success page once Stripe has
// confirmed the PaymentIntent succeeded. Order recording must NOT depend solely
// on the `payment_intent.succeeded` webhook: in production a misconfigured
// endpoint, wrong STRIPE_WEBHOOK_SECRET, or wrong event type silently means no
// order is ever written. This path re-verifies the intent server-side and
// records it. Safe to run alongside the webhook — recordOrder upserts on the
// PaymentIntent id, so whichever arrives second is a no-op.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    paymentIntentId?: string;
  };
  const id = body.paymentIntentId;
  if (!id || typeof id !== "string") {
    return Response.json({ error: "Missing paymentIntentId" }, { status: 400 });
  }

  // Re-fetch from Stripe rather than trusting the client: only a genuine,
  // succeeded PaymentIntent in our account can ever be recorded.
  let pi;
  try {
    pi = await getStripe().paymentIntents.retrieve(id);
  } catch {
    return Response.json({ error: "Unknown payment" }, { status: 404 });
  }

  if (pi.status !== "succeeded") {
    return Response.json({ recorded: false, status: pi.status });
  }

  try {
    await recordOrder(pi);
  } catch (err) {
    console.error("[capture] failed to persist order", pi.id, err);
    return Response.json({ error: "Could not record order" }, { status: 500 });
  }

  return Response.json({ recorded: true });
}
