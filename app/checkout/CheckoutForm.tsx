"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { products as allProducts } from "@/lib/data";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getCartTotal } = useCartStore();

  const [form, setForm] = useState({
    email: "",
    newsletter: false,
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    country: "UNITED STATES",
    postal: "",
    phone: "",
  });
  const [discountCode, setDiscountCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = getCartTotal();
  const taxRate = 0.08;
  const taxes = parseFloat((subtotal * taxRate).toFixed(2));
  const total = subtotal + taxes;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;
    if (items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMsg(submitError.message ?? "Please check your payment details.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        items: items.map((it) => ({
          productId: it.product.id,
          size: it.size,
          quantity: it.quantity,
        })),
      }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Server error" }));
      setErrorMsg(error ?? "Could not start payment.");
      setSubmitting(false);
      return;
    }

    const { clientSecret } = (await res.json()) as { clientSecret: string };

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: form.email || undefined,
        shipping: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone || undefined,
          address: {
            line1: form.address,
            line2: form.apartment || undefined,
            city: form.city,
            postal_code: form.postal,
            country: form.country === "UNITED STATES" ? "US" : form.country,
          },
        },
      },
    });

    if (error) {
      setErrorMsg(error.message ?? "Payment failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
      <header className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-8 bg-surface flex justify-center items-center">
        <Link href="/store">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-black font-headline hover:opacity-70 transition-opacity">
            9924
          </h1>
        </Link>
      </header>

      <form onSubmit={handlePay}>
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 pb-20 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
            <div className="md:col-span-7 space-y-10 md:space-y-16 order-2 md:order-1">
              <section className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                  <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                    Contact Information
                  </h2>
                </div>
                <div className="space-y-4">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="EMAIL ADDRESS"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider transition-all font-label"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      id="news"
                      name="newsletter"
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={handleChange}
                      className="w-4 h-4 border-outline-variant/20 text-primary focus:ring-0 accent-black"
                    />
                    <label
                      htmlFor="news"
                      className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label cursor-pointer"
                    >
                      Email me with news and offers
                    </label>
                  </div>
                </div>
              </section>

              <section className="space-y-6 md:space-y-8">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <input
                    name="firstName"
                    type="text"
                    required
                    placeholder="FIRST NAME"
                    value={form.firstName}
                    onChange={handleChange}
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                  />
                  <input
                    name="lastName"
                    type="text"
                    required
                    placeholder="LAST NAME"
                    value={form.lastName}
                    onChange={handleChange}
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                  />
                  <div className="md:col-span-2">
                    <input
                      name="address"
                      type="text"
                      required
                      placeholder="ADDRESS"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      name="apartment"
                      type="text"
                      placeholder="APARTMENT, SUITE, ETC. (OPTIONAL)"
                      value={form.apartment}
                      onChange={handleChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                    />
                  </div>
                  <input
                    name="city"
                    type="text"
                    required
                    placeholder="CITY"
                    value={form.city}
                    onChange={handleChange}
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                  />
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none text-outline uppercase tracking-wider appearance-none font-label"
                  >
                    <option>UNITED STATES</option>
                    <option>UNITED KINGDOM</option>
                    <option>JAPAN</option>
                  </select>
                  <input
                    name="postal"
                    type="text"
                    required
                    placeholder="POSTAL CODE"
                    value={form.postal}
                    onChange={handleChange}
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                  />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="PHONE (OPTIONAL)"
                    value={form.phone}
                    onChange={handleChange}
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                  />
                </div>
              </section>

              <section className="space-y-6 md:space-y-8">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                  Payment
                </h2>
                <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-6">
                  <PaymentElement options={{ layout: "tabs" }} />
                </div>
                {errorMsg && (
                  <p className="text-[11px] tracking-widest uppercase text-red-600 font-label">
                    {errorMsg}
                  </p>
                )}
              </section>

              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 md:gap-8 pt-4 md:pt-8">
                <Link
                  href="/store"
                  className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors font-label"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Return to Bag
                </Link>
                <button
                  type="submit"
                  disabled={!stripe || submitting || items.length === 0}
                  className="w-full md:w-auto bg-black text-on-primary px-8 md:px-12 py-4 md:py-5 text-sm font-bold uppercase tracking-widest hover:bg-primary-container active:scale-[0.99] transition-all font-headline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing…" : `Pay $${total.toFixed(2)}`}
                </button>
              </div>
            </div>

            <aside className="md:col-span-5 md:sticky md:top-8 order-1 md:order-2 w-full">
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
                      const liveProduct = allProducts.find(p => p.id === item.product.id) ?? item.product;
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

                <div className="py-6 md:py-8 border-y border-outline-variant/20 flex gap-3 md:gap-4">
                  <input
                    type="text"
                    placeholder="DISCOUNT CODE"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-grow min-w-0 bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-xs focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                  />
                  <button
                    type="button"
                    className="bg-outline-variant/20 text-primary px-4 md:px-6 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-outline-variant/40 transition-colors font-label"
                  >
                    Apply
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                    <span>Estimated Taxes</span>
                    <span>${taxes.toFixed(2)}</span>
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
              </div>
            </aside>
          </div>
        </main>
      </form>
    </div>
  );
}
