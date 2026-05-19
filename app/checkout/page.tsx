"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { products as allProducts } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CheckoutPage() {
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

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-8 bg-surface flex justify-center items-center">
        <Link href="/store">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-black font-headline hover:opacity-70 transition-opacity">
            MANIFESTO
          </h1>
        </Link>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 pb-20 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          {/* Left Column: Checkout Forms */}
          <div className="md:col-span-7 space-y-10 md:space-y-16 order-2 md:order-1">

            {/* Express Checkout */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-outline mb-6">
                Express Checkout
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button className="bg-black text-white h-12 md:h-14 flex items-center justify-center hover:bg-primary-container transition-colors">
                  <span className="font-bold italic text-base md:text-xl font-headline">
                    Apple Pay
                  </span>
                </button>
                <button className="bg-[#ffc439] text-[#2c2e2f] h-12 md:h-14 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <span className="font-bold italic text-base md:text-xl font-headline">
                    PayPal
                  </span>
                </button>
              </div>
              <div className="relative flex py-8 items-center">
                <div className="flex-grow border-t border-outline-variant/30" />
                <span className="flex-shrink mx-4 text-[10px] tracking-widest text-outline uppercase font-label">
                  OR
                </span>
                <div className="flex-grow border-t border-outline-variant/30" />
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-6 md:space-y-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                  Contact Information
                </h2>
                <span className="text-[10px] tracking-widest uppercase text-outline font-label">
                  Already have an account?{" "}
                  <a
                    href="#"
                    className="text-primary underline underline-offset-4"
                  >
                    Log in
                  </a>
                </span>
              </div>
              <div className="space-y-4">
                <input
                  name="email"
                  type="email"
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

            {/* Shipping Address */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <input
                  name="firstName"
                  type="text"
                  placeholder="FIRST NAME"
                  value={form.firstName}
                  onChange={handleChange}
                  className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                />
                <input
                  name="lastName"
                  type="text"
                  placeholder="LAST NAME"
                  value={form.lastName}
                  onChange={handleChange}
                  className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                />
                <div className="md:col-span-2">
                  <input
                    name="address"
                    type="text"
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
                  <option>COUNTRY / REGION</option>
                  <option>UNITED STATES</option>
                  <option>UNITED KINGDOM</option>
                  <option>JAPAN</option>
                </select>
                <input
                  name="postal"
                  type="text"
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

            {/* Navigation Actions */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 md:gap-8 pt-4 md:pt-8">
              <Link
                href="/store"
                className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors font-label"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to Bag
              </Link>
              <button className="w-full md:w-auto bg-black text-on-primary px-8 md:px-12 py-4 md:py-5 text-sm font-bold uppercase tracking-widest hover:bg-primary-container active:scale-[0.99] transition-all font-headline">
                Continue to Shipping
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="md:col-span-5 md:sticky md:top-8 order-1 md:order-2 w-full">
            <div className="bg-surface-container-low p-5 sm:p-8 lg:p-12 space-y-6 md:space-y-8">
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-5 md:space-y-6">
                {items.length === 0 ? (
                  <p className="text-[10px] tracking-widest uppercase text-outline font-label">
                    COMING SOON
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

              {/* Discount Code */}
              <div className="py-6 md:py-8 border-y border-outline-variant/20 flex gap-3 md:gap-4">
                <input
                  type="text"
                  placeholder="DISCOUNT CODE"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-grow min-w-0 bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-xs focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                />
                <button className="bg-outline-variant/20 text-primary px-4 md:px-6 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-outline-variant/40 transition-colors font-label">
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
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

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 w-full px-4 sm:px-6 md:px-12 py-10 md:py-16 mt-16 md:mt-32 bg-surface-container-low text-black text-center md:text-left">
        <div className="text-[10px] font-label uppercase tracking-widest text-outline">
          © 2026 INDUSTRIAL ESSENTIALISM. ALL RIGHTS RESERVED.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {["TERMS", "PRIVACY", "SHIPPING", "CONTACT"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[10px] font-label uppercase tracking-widest text-outline hover:text-black transition-colors"
            >
              {link}
            </a>
          ))}
          <a
            href="https://www.instagram.com/9924brand?igsh=MTZlbWhmamc5aHQycA%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-outline hover:text-black transition-colors"
          >
            <svg viewBox="0 0 32 32" className="w-4 h-4" aria-hidden>
              <path fill="currentColor" d="M23,0H9C4,0,0,4,0,9v6v8c0,5,4,9,9,9h14c5,0,9-4,9-9v-8V9C32,4,28,0,23,0z" />
              <circle fill="none" stroke="#f3f3f3" strokeWidth="2" cx="16" cy="16" r="8" />
              <circle fill="#f3f3f3" cx="25" cy="6" r="2" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@9924brand?_r=1&_t=ZT-96JrYwR4vaY"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-outline hover:text-black transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path fill="currentColor" d="M19.4 6.7v2.7c-1.8 0-3.5-.6-4.8-1.5v7c0 3.5-2.8 6.3-6.3 6.3-1.4 0-2.6-.4-3.6-1.2 1.2 1.3 2.9 2 4.7 2 3.5 0 6.4-2.8 6.4-6.4V8.7c1.4 1 3 1.5 4.8 1.5v-3.4c-.4 0-.7 0-1 0z" />
              <path fill="currentColor" d="M14.6 14.8V7.8c1.4 1 3 1.5 4.8 1.5V6.7c-1-.2-1.9-.8-2.6-1.6-.7-.7-1.5-1.8-1.7-3.1H12.2v13.8c-.1 1.5-1.3 2.7-2.9 2.7-1 0-1.8-.5-2.4-1.2-.9-.5-1.5-1.5-1.5-2.6 0-1.6 1.3-2.9 2.9-2.9.3 0 .6.1.9.2V9.4c-3.4.1-6.2 2.9-6.2 6.3 0 1.7.6 3.2 1.7 4.3 1 .7 2.2 1.1 3.6 1.1 3.5 0 6.3-2.8 6.3-6.3z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
