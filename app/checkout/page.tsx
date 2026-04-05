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
      <header className="w-full px-12 py-8 bg-surface flex justify-center items-center">
        <Link href="/store">
          <h1 className="text-3xl font-bold tracking-tighter text-black font-headline hover:opacity-70 transition-opacity">
            MANIFESTO
          </h1>
        </Link>
      </header>

      <main className="max-w-[1440px] mx-auto px-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          {/* Left Column: Checkout Forms */}
          <div className="md:col-span-7 space-y-16">

            {/* Express Checkout */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-outline mb-6">
                Express Checkout
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-black text-white h-14 flex items-center justify-center hover:bg-primary-container transition-colors">
                  <span className="font-bold italic text-xl font-headline">
                    Apple Pay
                  </span>
                </button>
                <button className="bg-[#ffc439] text-[#2c2e2f] h-14 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <span className="font-bold italic text-xl font-headline">
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
            <section className="space-y-8">
              <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold uppercase tracking-tight font-headline">
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
            <section className="space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-tight font-headline">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8">
              <Link
                href="/store"
                className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors font-label"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to Bag
              </Link>
              <button className="bg-black text-on-primary px-12 py-5 text-sm font-bold uppercase tracking-widest hover:bg-primary-container active:scale-[0.99] transition-all font-headline">
                Continue to Shipping
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="md:col-span-5 sticky top-8">
            <div className="bg-surface-container-low p-8 lg:p-12 space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-tight font-headline">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-6">
                {items.length === 0 ? (
                  <p className="text-[10px] tracking-widest uppercase text-outline font-label">
                    NO_UNITS_IN_BAG
                  </p>
                ) : (
                  items.map((item) => {
                    const liveProduct = allProducts.find(p => p.id === item.product.id) ?? item.product;
                    return (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex items-center gap-6 group"
                    >
                      <div className="relative w-24 h-24 bg-surface-container-highest flex-shrink-0 overflow-hidden">
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
                      <div className="flex-grow">
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
              <div className="py-8 border-y border-outline-variant/20 flex gap-4">
                <input
                  type="text"
                  placeholder="DISCOUNT CODE"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-grow bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-xs focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider font-label"
                />
                <button className="bg-outline-variant/20 text-primary px-6 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-outline-variant/40 transition-colors font-label">
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
                <div className="flex justify-between pt-4 border-t border-outline-variant/20">
                  <span className="text-lg font-bold uppercase tracking-tight font-headline">
                    Total
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-outline tracking-widest mr-2 font-label">
                      USD
                    </span>
                    <span className="text-xl font-bold font-headline">
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
      <footer className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 mt-32 bg-surface-container-low text-black">
        <div className="text-[10px] font-label uppercase tracking-widest text-outline">
          © 2024 INDUSTRIAL ESSENTIALISM. ALL RIGHTS RESERVED.
        </div>
        <div className="flex gap-8 mt-8 md:mt-0">
          {["TERMS", "PRIVACY", "SHIPPING", "CONTACT"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[10px] font-label uppercase tracking-widest text-outline hover:text-black transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
