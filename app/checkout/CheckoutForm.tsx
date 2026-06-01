"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useCartStore } from "@/store/cartStore";
import { products as allProducts } from "@/lib/data";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const inputClass =
  "w-full bg-surface-container-lowest border border-outline-variant/20 px-4 py-4 text-sm focus:border-primary focus:outline-none placeholder:text-outline uppercase tracking-wider transition-all font-label";

type Step = "shipping" | "payment";

type Rate = {
  token: string;
  name: string;
  provider: string;
  amountCents: number;
  currency: string;
  estimatedDays: number | null;
};

// Places country code -> our select label
const ISO_TO_LABEL: Record<string, string> = {
  US: "UNITED STATES",
  GB: "UNITED KINGDOM",
  JP: "JAPAN",
};

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getCartTotal } = useCartStore();

  // Mobile is a two-step flow (shipping → payment). On desktop both columns are
  // always visible, so `step` only gates mobile visibility.
  const [step, setStep] = useState<Step>("shipping");

  const [form, setForm] = useState({
    email: "",
    newsletter: false,
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "UNITED STATES",
    postal: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  // Live shipping rates from Shippo.
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  const addressSlotRef = useRef<HTMLDivElement>(null);
  const placesStarted = useRef(false);
  const [placesReady, setPlacesReady] = useState(false);

  const subtotal = getCartTotal();
  const taxRate = 0.08;
  const taxes = parseFloat((subtotal * taxRate).toFixed(2));
  const selectedRate = rates.find((r) => r.token === selectedToken) ?? null;
  const shippingCost = selectedRate ? selectedRate.amountCents / 100 : 0;
  const total = subtotal + taxes + shippingCost;

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

  const shippingPayload = () => ({
    firstName: form.firstName,
    lastName: form.lastName,
    address: form.address,
    apartment: form.apartment,
    city: form.city,
    state: form.state,
    country: form.country,
    postal: form.postal,
    phone: form.phone,
    email: form.email,
  });

  // ---- Google Places autocomplete on the address line --------------------
  // Uses the modern PlaceAutocompleteElement web component. The legacy
  // `Autocomplete` widget (deprecated March 2025) attached to our controlled
  // <input> and blurred it on attach — closing the mobile keyboard mid-word.
  // This element owns its own input inside a shadow root, so there's no focus
  // fight. Requires "Places API (New)" enabled on the GCP project.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const slot = addressSlotRef.current;
    if (!key || placesStarted.current || !slot) return;
    placesStarted.current = true;

    // Google reports key/referrer auth failures (e.g. RefererNotAllowedMapError)
    // asynchronously via this global — importLibrary() resolves regardless — so
    // without this hook the failure is completely silent in prod.
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure =
      () => {
        console.error(
          `Google Maps auth failed for ${window.location.origin}. Add this exact ` +
            `host to the API key's HTTP referrer restrictions (e.g. ` +
            `https://www.9924.store/*).`
        );
      };

    setOptions({ key, v: "weekly" });

    let el: google.maps.places.PlaceAutocompleteElement | null = null;

    importLibrary("places")
      .then((places) => {
        if (!addressSlotRef.current) return;

        el = new places.PlaceAutocompleteElement({
          includedRegionCodes: ["us", "gb", "jp"],
        });
        el.placeholder = "ADDRESS";
        el.className = "w-full";
        addressSlotRef.current.replaceChildren(el);
        setPlacesReady(true);

        // Mirror the element's text into form state as the user types so the
        // manual-entry path, validation, and shipping-rate lookups keep working
        // even when no suggestion is picked.
        el.addEventListener("input", () => {
          const value = el?.value ?? "";
          setForm((prev) => ({ ...prev, address: value }));
        });

        // Surface request failures (most commonly: Places API (New) disabled).
        el.addEventListener("gmp-error", () => {
          console.error(
            "Google Places request failed — confirm 'Places API (New)' is enabled on the project."
          );
        });

        el.addEventListener("gmp-select", async ({ placePrediction }) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ["addressComponents"] });
          const comps = place.addressComponents ?? [];
          const get = (type: string, short = false) => {
            const c = comps.find((x) => x.types.includes(type));
            if (!c) return "";
            return (short ? c.shortText : c.longText) ?? "";
          };
          const line1 = `${get("street_number")} ${get("route")}`.trim();
          const iso = get("country", true);
          setForm((prev) => ({
            ...prev,
            address: line1 || prev.address,
            city:
              get("locality") ||
              get("postal_town") ||
              get("sublocality_level_1") ||
              prev.city,
            state: get("administrative_area_level_1", true) || prev.state,
            postal: get("postal_code") || prev.postal,
            country: ISO_TO_LABEL[iso] ?? prev.country,
          }));
          // Collapse the box back to just the street line to match form state.
          if (el) el.value = line1 || el.value;
        });
      })
      .catch((err) => {
        // Autocomplete is a progressive enhancement — the manual fallback input
        // still works — but log so a broken key/library load isn't invisible.
        console.error("Google Places library failed to load", err);
      });

    return () => {
      el?.remove();
    };
  }, []);

  // ---- Fetch shipping rates when the address is complete ------------------
  useEffect(() => {
    const ready =
      form.address.trim() &&
      form.city.trim() &&
      form.postal.trim() &&
      form.country.trim();
    if (!ready || items.length === 0) {
      setRates([]);
      setSelectedToken(null);
      setRatesError(null);
      return;
    }
    const handle = setTimeout(async () => {
      setRatesLoading(true);
      setRatesError(null);
      try {
        const res = await fetch("/api/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: shippingPayload(),
            items: items.map((it) => ({
              productId: it.product.id,
              size: it.size,
              quantity: it.quantity,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setRates([]);
          setSelectedToken(null);
          setRatesError(data.error ?? "Could not load shipping rates.");
          return;
        }
        const next = data.rates as Rate[];
        setRates(next);
        // keep prior choice if still offered, else default to cheapest
        setSelectedToken((prev) =>
          next.some((r) => r.token === prev) ? prev : next[0]?.token ?? null
        );
      } catch {
        setRates([]);
        setSelectedToken(null);
        setRatesError("Network error fetching shipping.");
      } finally {
        setRatesLoading(false);
      }
    }, 700);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.address,
    form.city,
    form.state,
    form.postal,
    form.country,
    items,
  ]);

  // ---- Keep Stripe's amount in sync with the running total ----------------
  useEffect(() => {
    if (!elements) return;
    elements.update({ amount: Math.max(50, Math.round(total * 100)) });
  }, [elements, total]);

  // Validate the fields we own before showing/charging payment.
  const validateShipping = (): boolean => {
    const required: [string, string][] = [
      ["email", "email address"],
      ["firstName", "first name"],
      ["lastName", "last name"],
      ["address", "address"],
      ["city", "city"],
      ["postal", "postal code"],
    ];
    const missing = required.find(
      ([key]) => !form[key as keyof typeof form]?.toString().trim()
    );
    if (missing) {
      setShippingError(`Please enter your ${missing[1]}.`);
      return false;
    }
    setShippingError(null);
    return true;
  };

  const goToPayment = () => {
    if (!validateShipping()) return;
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;
    if (items.length === 0) {
      setPayError("Your cart is empty.");
      return;
    }
    if (!validateShipping()) {
      setStep("shipping");
      return;
    }
    if (!selectedToken) {
      setPayError("Please select a shipping option.");
      return;
    }

    setSubmitting(true);
    setPayError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setPayError(submitError.message ?? "Please check your payment details.");
      setSubmitting(false);
      return;
    }

    // Create the PaymentIntent server-side. Shipping address + the chosen rate
    // are re-priced there before confirmPayment hands off to Stripe.
    const res = await fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        shipping: shippingPayload(),
        shippingRateToken: selectedToken,
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
      setPayError(error ?? "Could not start payment.");
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
      },
    });

    if (error) {
      setPayError(error.message ?? "Payment failed.");
      setSubmitting(false);
    }
  };

  const leftVisible = step === "shipping" ? "block" : "hidden";
  const rightVisible = step === "payment" ? "block" : "hidden";

  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
      <header className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-8 bg-surface flex justify-start items-center">
        <Link
          href="/store"
          aria-label="9924"
          className="block hover:opacity-70 transition-opacity"
        >
          <Image
            src="/logos/9924 logo 1 -black@4x (1).png"
            alt="9924"
            width={200}
            height={80}
            className="h-auto w-auto max-w-[50px] sm:max-w-[60px] md:max-w-[70px]"
            priority
          />
        </Link>
      </header>

      {/* Mobile step indicator */}
      <div className="md:hidden px-4 sm:px-6 mb-2">
        <div className="flex items-center gap-3 text-[10px] tracking-widest uppercase font-label">
          <span className={step === "shipping" ? "text-primary" : "text-outline"}>
            1 · Shipping
          </span>
          <span className="flex-grow h-px bg-outline-variant/30" />
          <span className={step === "payment" ? "text-primary" : "text-outline"}>
            2 · Payment
          </span>
        </div>
      </div>

      <form onSubmit={handlePay}>
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 pb-20 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
            {/* LEFT — shipping (mobile step 1) */}
            <div
              className={`${leftVisible} md:block md:col-span-7 space-y-10 md:space-y-16`}
            >
              <section className="space-y-6 md:space-y-8">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="EMAIL ADDRESS"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
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
                    className={inputClass}
                  />
                  <input
                    name="lastName"
                    type="text"
                    required
                    placeholder="LAST NAME"
                    value={form.lastName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <div className="md:col-span-2">
                    {/* Manual fallback — used until/unless the Places element
                        mounts (e.g. library fails to load). Stays React-owned;
                        the element is mounted into the sibling slot below so the
                        two never fight over the same DOM node. */}
                    <input
                      name="address"
                      type="text"
                      required={!placesReady}
                      autoComplete="off"
                      placeholder="ADDRESS"
                      value={form.address}
                      onChange={handleChange}
                      className={`${inputClass} ${placesReady ? "hidden" : ""}`}
                    />
                    {/* Google PlaceAutocompleteElement mounts here */}
                    <div
                      ref={addressSlotRef}
                      className={placesReady ? "" : "hidden"}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      name="apartment"
                      type="text"
                      placeholder="APARTMENT, SUITE, ETC. (OPTIONAL)"
                      value={form.apartment}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <input
                    name="city"
                    type="text"
                    required
                    placeholder="CITY"
                    value={form.city}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <input
                    name="state"
                    type="text"
                    placeholder="STATE / PROVINCE"
                    value={form.state}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={`${inputClass} text-outline appearance-none`}
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
                    className={inputClass}
                  />
                  <div className="md:col-span-2">
                    <input
                      name="phone"
                      type="tel"
                      placeholder="PHONE (OPTIONAL)"
                      value={form.phone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {shippingError && (
                <p className="text-[11px] tracking-widest uppercase text-red-600 font-label">
                  {shippingError}
                </p>
              )}

              {/* Mobile: advance to payment */}
              <button
                type="button"
                onClick={goToPayment}
                className="md:hidden w-full bg-black text-on-primary px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary-container active:scale-[0.99] transition-all font-headline"
              >
                Continue to Payment
              </button>

              <Link
                href="/store"
                className="hidden md:flex items-center gap-2 text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors font-label"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to Bag
              </Link>
            </div>

            {/* RIGHT — payment + order summary (mobile step 2) */}
            <aside
              className={`${rightVisible} md:block md:col-span-5 md:sticky md:top-8 w-full space-y-8`}
            >
              <section className="space-y-6 md:space-y-8">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight font-headline">
                  Payment
                </h2>
                <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-6">
                  <PaymentElement options={{ layout: "tabs" }} />
                </div>
                {payError && (
                  <p className="text-[11px] tracking-widest uppercase text-red-600 font-label">
                    {payError}
                  </p>
                )}
              </section>

              <div className="bg-surface-container-low p-5 sm:p-8 space-y-6">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-tight font-headline">
                  Order Summary
                </h2>

                <div className="space-y-5">
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
                          className="flex items-center gap-4 group"
                        >
                          <div className="relative w-16 h-16 bg-surface-container-highest flex-shrink-0 overflow-hidden">
                            <Image
                              src={liveProduct.images[0]}
                              alt={liveProduct.name}
                              fill
                              className="object-contain grayscale p-2"
                              sizes="64px"
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

                {/* Shipping options (live carrier rates) */}
                <div className="space-y-3 pt-6 border-t border-outline-variant/20">
                  <p className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                    Shipping Method
                  </p>
                  {ratesLoading && (
                    <p className="text-[10px] tracking-widest uppercase text-outline font-label">
                      Calculating shipping…
                    </p>
                  )}
                  {!ratesLoading && ratesError && (
                    <p className="text-[10px] tracking-widest uppercase text-red-600 font-label">
                      {ratesError}
                    </p>
                  )}
                  {!ratesLoading && !ratesError && rates.length === 0 && (
                    <p className="text-[10px] tracking-widest uppercase text-outline font-label">
                      Enter your address to see shipping options.
                    </p>
                  )}
                  {!ratesLoading &&
                    rates.map((r) => {
                      const active = r.token === selectedToken;
                      return (
                        <button
                          key={r.token}
                          type="button"
                          onClick={() => setSelectedToken(r.token)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 border text-left transition-colors ${
                            active
                              ? "border-primary bg-surface-container-lowest"
                              : "border-outline-variant/20 hover:border-outline-variant/50"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block text-[11px] font-bold uppercase tracking-wider font-headline truncate">
                              {r.provider} · {r.name}
                            </span>
                            {r.estimatedDays != null && (
                              <span className="block text-[10px] text-outline tracking-widest uppercase font-label">
                                {r.estimatedDays} business day
                                {r.estimatedDays === 1 ? "" : "s"}
                              </span>
                            )}
                          </span>
                          <span className="text-sm font-bold font-headline shrink-0">
                            {money(r.amountCents)}
                          </span>
                        </button>
                      );
                    })}
                </div>

                <div className="space-y-4 pt-6 border-t border-outline-variant/20">
                  <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                    <span>Estimated Taxes</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] tracking-widest uppercase text-on-surface-variant font-label">
                    <span>Shipping</span>
                    <span>{selectedRate ? `$${shippingCost.toFixed(2)}` : "—"}</span>
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

                <button
                  type="submit"
                  disabled={
                    !stripe ||
                    submitting ||
                    items.length === 0 ||
                    !selectedToken ||
                    ratesLoading
                  }
                  className="w-full bg-black text-on-primary px-8 py-4 md:py-5 text-sm font-bold uppercase tracking-widest hover:bg-primary-container active:scale-[0.99] transition-all font-headline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing…" : `Pay $${total.toFixed(2)}`}
                </button>

                {/* Mobile: back to shipping */}
                <button
                  type="button"
                  onClick={() => {
                    setStep("shipping");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="md:hidden w-full flex items-center justify-center gap-2 text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors font-label"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Edit shipping
                </button>
              </div>
            </aside>
          </div>
        </main>
      </form>
    </div>
  );
}
