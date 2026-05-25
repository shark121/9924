"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-8">
        <span className="font-label text-[10px] tracking-[0.3em] uppercase text-neutral-400">
          Order Confirmed
        </span>
        <h1 className="font-headline text-4xl sm:text-5xl font-black uppercase tracking-tighter">
          Thank you
        </h1>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Your payment was successful. A receipt has been sent to your email.
          We&rsquo;ll be in touch as soon as your order ships.
        </p>
        <Link
          href="/store"
          className="inline-block bg-black text-white px-8 py-4 text-xs font-headline font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
