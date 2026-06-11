"use client";

import { useState } from "react";
import { X } from "lucide-react";

// Common apparel sizes offered as one-click chips. An admin can still add a
// custom value (e.g. a numeric size) via the input below.
const CANONICAL = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

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
    new Set((initialUnavailable ?? []).filter((s) => (initialSizes ?? []).includes(s)))
  );
  const [custom, setCustom] = useState("");

  // Chips to render: canonical set plus any custom sizes already on the product.
  const palette = orderSizes([...new Set([...CANONICAL, ...offered])]);

  function toggleOffered(size: string) {
    setOffered((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : orderSizes([...prev, size])
    );
    // Dropping a size from the run also clears any sold-out flag on it.
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
    <div className="flex flex-col gap-3">
      {/* Hidden fields consumed by the product server action (comma-separated). */}
      <input type="hidden" name="sizes" value={offeredOrdered.join(",")} />
      <input
        type="hidden"
        name="unavailableSizes"
        value={unavailableOrdered.join(",")}
      />

      <div className="flex flex-wrap gap-2">
        {palette.map((size) => {
          const isOffered = offered.includes(size);
          const soldOut = unavailable.has(size);

          if (!isOffered) {
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleOffered(size)}
                className="h-9 min-w-[3rem] rounded-md border border-dashed border-neutral-300 px-2 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700"
                title={`Add ${size}`}
              >
                {size}
              </button>
            );
          }

          return (
            <div
              key={size}
              className={`flex h-9 items-center gap-1 rounded-md border pl-2.5 pr-1 text-sm transition-colors ${
                soldOut
                  ? "border-neutral-300 bg-neutral-100 text-neutral-400"
                  : "border-neutral-900 bg-neutral-900 text-white"
              }`}
            >
              {/* Tap the label to flip in-stock / sold-out. */}
              <button
                type="button"
                onClick={() => toggleAvailable(size)}
                className="flex items-center gap-1.5"
                title={soldOut ? "Mark in stock" : "Mark sold out"}
              >
                <span className={soldOut ? "line-through" : ""}>{size}</span>
                {soldOut && (
                  <span className="text-[9px] uppercase tracking-wider">
                    Sold out
                  </span>
                )}
              </button>
              {/* Remove the size from the run entirely. */}
              <button
                type="button"
                onClick={() => toggleOffered(size)}
                aria-label={`Remove ${size}`}
                title={`Remove ${size} from this product`}
                className={`rounded p-0.5 transition-colors ${
                  soldOut
                    ? "text-neutral-400 hover:text-neutral-700"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <X size={13} />
              </button>
            </div>
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

      <p className="text-xs text-neutral-400">
        Click a size to add it to the run. Click an active size to mark it{" "}
        <span className="line-through">sold out</span> — it stays visible to
        shoppers but can&apos;t be ordered. Use{" "}
        <X size={11} className="inline align-[-1px]" /> to remove it completely.
      </p>
    </div>
  );
}
