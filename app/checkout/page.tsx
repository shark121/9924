"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { products as allProducts } from "@/lib/data";

export default function CheckoutPage() {
  const { items, getCartTotal } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // The cart is persisted in localStorage and only available after hydration.
  // Gate cart-dependent UI until mounted so the first client render matches SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = getCartTotal();
  const total = subtotal;

  const handleCheckout = async () => {
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({
            productId: it.product.id,
            size: it.size,
            quantity: it.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: "Server error" }));
        setErrorMsg(error ?? "Could not start checkout.");
        setSubmitting(false);
        return;
      }

      const { url } = (await res.json()) as { url: string | null };
      if (!url) {
        setErrorMsg("Could not start checkout.");
        setSubmitting(false);
        return;
      }
      // hand off to Stripe's hosted checkout
      window.location.href = url;
    } catch {
      setErrorMsg("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const Header = (
    <header className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-8 bg-surface flex justify-center items-center">
      <Link href="/store">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-black font-headline hover:opacity-70 transition-opacity">
          9924
        </h1>
      </Link>
    </header>
  );

  if (!mounted) {
    return (
      <div className="bg-surface text-on-surface font-body min-h-screen">
        {Header}
        <main className="max-w-[680px] mx-auto px-4 sm:px-6 md:px-12 pb-20 md:pb-32">
          <div className="bg-surface-container-low p-5 sm:p-8 lg:p-12">
            <p className="text-[10px] tracking-widest uppercase text-outline font-label">
              Loading your bag…
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
      {Header}

      <main className="max-w-[680px] mx-auto px-4 sm:px-6 md:px-12 pb-20 md:pb-32">
        <div className="bg-surface-container-low p-5 sm:p-8 lg:p-12 space-y-6 md:space-y-8">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
            Order Summary
          </h2>

          <div className="space-y-5 md:space-y-6">
            {items.length === 0 ? (
              <p className="text-[10px] tracking-widest uppercase text-outline font-label">
                YOUR BAG IS EMPTY
              </p>
            ) : (
              items.map((item) => {
                const liveProduct =
                  allProducts.find((p) => p.id === item.product.id) ??
                  item.product;
                return (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex items-center gap-4 md:gap-6 group"
                  >
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-surface-container-highest flex-shrink-0 overflow-hidden">
                      <Image
                        src={liveProduct.images[0]}
                        alt={liveProduct.name}
                        fill
                        className="object-contain grayscale p-2"
                        sizes="96px"
                      />
                      <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] w-5 h-5 flex items-center justify-center font-bold font-label z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-sm font-bold uppercase tracking-tight font-headline">
                        {item.product.name}
                      </h3>
                      <p className="text-[10px] text-outline tracking-widest mt-1 font-label uppercase">
                        SIZE: {item.size}
                      </p>
                    </div>
                    <span className="text-sm font-bold font-headline shrink-0">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-outline-variant/20">
            <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-outline-variant/20">
              <span className="text-base md:text-lg font-bold uppercase tracking-tight font-headline">
                Total
              </span>
              <div className="text-right">
                <span className="text-[10px] text-outline tracking-widest mr-2 font-label">
                  USD
                </span>
                <span className="text-lg md:text-xl font-bold font-headline">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] tracking-widest uppercase text-red-600 font-label">
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={submitting || items.length === 0}
            className="w-full bg-black text-on-primary px-8 py-4 md:py-5 text-sm font-bold uppercase tracking-widest hover:bg-primary-container active:scale-[0.99] transition-all font-headline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Redirecting…" : "Proceed to Secure Payment"}
          </button>

          <p className="text-[10px] text-outline tracking-widest uppercase font-label text-center">
            Shipping &amp; payment details collected securely by Stripe
          </p>

          <Link
            href="/store"
            className="flex items-center justify-center gap-2 text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors font-label"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Bag
          </Link>
        </div>
      </main>
    </div>
  );
}
