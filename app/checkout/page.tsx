"use client";

import { useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useCartStore } from "@/store/cartStore";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const TAX_RATE = 0.08;

export default function CheckoutPage() {
  const subtotal = useCartStore((s) => s.getCartTotal());

  const amountCents = useMemo(() => {
    const subCents = Math.round(subtotal * 100);
    const taxCents = Math.round(subCents * TAX_RATE);
    return Math.max(50, subCents + taxCents);
  }, [subtotal]);

  const options: StripeElementsOptions = useMemo(
    () => ({
      mode: "payment",
      amount: amountCents,
      currency: "usd",
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#000000",
          colorBackground: "#ffffff",
          colorText: "#000000",
          fontFamily: "system-ui, sans-serif",
          borderRadius: "0px",
          spacingUnit: "4px",
        },
      },
    }),
    [amountCents]
  );

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
