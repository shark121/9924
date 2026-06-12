"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { useCartStore } from "@/store/cartStore";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

// Drive the UI off the *verified* PaymentIntent status, never the bare redirect.
// Stripe appends ?payment_intent_client_secret=… on return_url; some payment
// methods (and failures) land here without the money having actually moved.
type View = "loading" | "succeeded" | "processing" | "failed" | "error";

const COPY: Record<
  Exclude<View, "loading">,
  { eyebrow: string; heading: string; body: string; cta: string; href: string }
> = {
  succeeded: {
    eyebrow: "Order Confirmed",
    heading: "Thank you",
    body: "Your payment was successful. A receipt has been sent to your email. We'll be in touch as soon as your order ships.",
    cta: "Continue Shopping",
    href: "/store",
  },
  processing: {
    eyebrow: "Payment Processing",
    heading: "Almost there",
    body: "Your payment is processing. We'll email you a confirmation as soon as it clears. No need to pay again.",
    cta: "Continue Shopping",
    href: "/store",
  },
  failed: {
    eyebrow: "Payment Not Completed",
    heading: "Something went wrong",
    body: "Your payment wasn't completed and you have not been charged. Please try again with a different payment method.",
    cta: "Return to Checkout",
    href: "/checkout",
  },
  error: {
    eyebrow: "Status Unavailable",
    heading: "We couldn't confirm your payment",
    body: "We couldn't verify the payment status. If you were charged, you'll receive an email receipt; otherwise no payment was taken.",
    cta: "Return to Store",
    href: "/store",
  },
};

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);
  const [view, setView] = useState<View>("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
      );

      // No client secret → direct/manual visit; nothing to verify.
      if (!clientSecret) {
        if (active) setView("error");
        return;
      }

      try {
        const stripe = await stripePromise;
        if (!stripe) {
          if (active) setView("error");
          return;
        }
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(clientSecret);
        if (!active) return;

        if (error || !paymentIntent) {
          setView("error");
          return;
        }

        switch (paymentIntent.status) {
          case "succeeded":
            setView("succeeded");
            clearCart();
            // Fallback capture so order recording doesn't depend solely on the
            // Stripe webhook (which can be misconfigured/undelivered in prod).
            // Idempotent: recordOrder upserts on the PaymentIntent id, so a
            // webhook delivery for the same order is a harmless no-op.
            fetch("/api/orders/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
            }).catch(() => {});
            break;
          case "processing":
            // Submitted and irreversible from the customer's side — safe to clear.
            setView("processing");
            clearCart();
            break;
          case "requires_payment_method":
            // Confirmation failed; the customer needs to retry. Keep the cart.
            setView("failed");
            break;
          default:
            setView("error");
        }
      } catch {
        if (active) setView("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [clearCart]);

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-6">
        <span className="font-label text-[10px] tracking-[0.3em] uppercase text-neutral-400">
          Confirming your payment…
        </span>
      </div>
    );
  }

  const copy = COPY[view];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-8">
        <span className="font-label text-[10px] tracking-[0.3em] uppercase text-neutral-400">
          {copy.eyebrow}
        </span>
        <h1 className="font-headline text-4xl sm:text-5xl font-black uppercase tracking-tighter">
          {copy.heading}
        </h1>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          {copy.body}
        </p>
        <Link
          href={copy.href}
          className="inline-block bg-black text-white px-8 py-4 text-xs font-headline font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}
