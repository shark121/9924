"use client";

import { useState } from "react";

// Common apparel sizes offered as one-click chips. An admin can still add a
// custom value (e.g. a numeric size) via the input below.
const CANONICAL = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const sublabelCls =
  "text-[10px] uppercase tracking-[0.14em] text-neutral-400";

function orderSizes(list: string[]): string[] {
  const extras = list.filter((s) => !CANONICAL.includes(s));
  return [...CANONICAL.filter((c) => list.includes(c)), ...extras];
}

export default function SizeEditor({
  initialSizes,
  initialUnavailable,
}: {
  initialSizes?: string[];
  initialUnavailable?: string[];
}) {
  // `offered` is the full size run; `unavailable` is the sold-out subset.
  const [offered, setOffered] = useState<string[]>(
    orderSizes(initialSizes?.length ? initialSizes : ["S", "M", "L", "XL"])
  );
  const [unavailable, setUnavailable] = useState<Set<string>>(
    new Set(
      (initialUnavailable ?? []).filter((s) => (initialSizes ?? []).includes(s))
    )
  );
  const [custom, setCustom] = useState("");

  // Chips to render in the "offered" palette: canonical set plus any custom
  // sizes already on the product.
  const palette = orderSizes([...new Set([...CANONICAL, ...offered])]);

  function toggleOffered(size: string) {
    setOffered((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : orderSizes([...prev, size])
    );
    // Removing a size from the run also clears any sold-out flag on it.
    setUnavailable((prev) => {
      if (!prev.has(size)) return prev;
      const next = new Set(prev);
      next.delete(size);
      return next;
    });
  }

  function toggleAvailable(size: string) {
    setUnavailable((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  function addCustom() {
    const v = custom.trim().replace(/,/g, "").toUpperCase();
    setCustom("");
    if (!v || offered.includes(v)) return;
    setOffered((prev) => orderSizes([...prev, v]));
  }

  const offeredOrdered = orderSizes(offered);
  const unavailableOrdered = offeredOrdered.filter((s) => unavailable.has(s));

  return (
    <div className="flex flex-col gap-5">
      {/* Hidden fields consumed by the product server action (comma-separated). */}
      <input type="hidden" name="sizes" value={offeredOrdered.join(",")} />
      <input
        type="hidden"
        name="unavailableSizes"
        value={unavailableOrdered.join(",")}
      />

      {/* 1 — Which sizes the product comes in (add / remove from the run). */}
      <div className="flex flex-col gap-2">
        <span className={sublabelCls}>Sizes this product comes in</span>
        <div className="flex flex-wrap gap-2">
          {palette.map((size) => {
            const isOffered = offered.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleOffered(size)}
                aria-pressed={isOffered}
                title={isOffered ? `Remove ${size}` : `Add ${size}`}
                className={`h-9 min-w-[3rem] rounded-md border px-2 text-sm transition-colors ${
                  isOffered
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-700"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add a custom size…"
            className="w-44 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="button"
            onClick={addCustom}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* 2 — Availability: mark an offered size sold out WITHOUT removing it. */}
      {offeredOrdered.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={sublabelCls}>Availability — tap to toggle</span>
          <div className="flex flex-wrap gap-2">
            {offeredOrdered.map((size) => {
              const soldOut = unavailable.has(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleAvailable(size)}
                  aria-pressed={!soldOut}
                  title={soldOut ? `Mark ${size} in stock` : `Mark ${size} sold out`}
                  className={`flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors ${
                    soldOut
                      ? "border-neutral-300 bg-neutral-100 text-neutral-400"
                      : "border-emerald-600/40 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span className={soldOut ? "line-through" : ""}>{size}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wider">
                    {soldOut ? "Sold out" : "In stock"}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-neutral-400">
            Sold-out sizes stay visible to shoppers (shown{" "}
            <span className="line-through">struck through</span> and disabled) —
            they just can&apos;t be ordered. To drop a size completely, turn it
            off in the row above.
          </p>
        </div>
      )}
    </div>
  );
}
