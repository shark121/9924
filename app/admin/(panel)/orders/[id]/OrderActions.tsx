"use client";

import { useActionState } from "react";
import {
  setFulfillmentAction,
  refundOrderAction,
  type ActionState,
} from "./actions";

const STATUSES = [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderActions({
  id,
  fulfillmentStatus,
  trackingNumber,
  trackingCarrier,
  remainingCents,
  currency,
}: {
  id: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  remainingCents: number;
  currency: string;
}) {
  const [fState, fAction, fPending] = useActionState<ActionState, FormData>(
    setFulfillmentAction,
    {}
  );
  const [rState, rAction, rPending] = useActionState<ActionState, FormData>(
    refundOrderAction,
    {}
  );

  const remaining = (remainingCents / 100).toFixed(2);
  const inputCls =
    "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500";

  return (
    <div className="flex flex-col gap-4">
      {/* Fulfillment + tracking */}
      <form
        action={fAction}
        className="rounded-xl border border-neutral-200 bg-white p-5"
      >
        <input type="hidden" name="id" value={id} />
        <h3 className="text-sm font-medium text-neutral-900">Fulfillment</h3>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              Status
            </span>
            <select
              name="status"
              defaultValue={fulfillmentStatus}
              className={inputCls}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                Carrier
              </span>
              <input
                name="tracking_carrier"
                defaultValue={trackingCarrier ?? ""}
                placeholder="USPS"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                Tracking #
              </span>
              <input
                name="tracking_number"
                defaultValue={trackingNumber ?? ""}
                placeholder="9400…"
                className={inputCls}
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={fPending}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {fPending ? "Saving…" : "Save"}
            </button>
            {fState.ok && (
              <span className="text-xs text-green-600">Saved.</span>
            )}
            {fState.error && (
              <span className="text-xs text-red-600">{fState.error}</span>
            )}
          </div>
        </div>
      </form>

      {/* Refund */}
      <form
        action={rAction}
        className="rounded-xl border border-neutral-200 bg-white p-5"
      >
        <input type="hidden" name="id" value={id} />
        <h3 className="text-sm font-medium text-neutral-900">Refund</h3>
        {remainingCents > 0 ? (
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                Amount ({currency.toUpperCase()}) — blank refunds remaining {remaining}
              </span>
              <input
                name="amount_usd"
                type="number"
                step="0.01"
                min="0"
                max={remaining}
                placeholder={remaining}
                className={inputCls}
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={rPending}
                className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                onClick={(e) => {
                  if (!confirm("Issue this refund via Stripe?")) e.preventDefault();
                }}
              >
                {rPending ? "Refunding…" : "Issue refund"}
              </button>
              {rState.ok && (
                <span className="text-xs text-green-600">Refund issued.</span>
              )}
              {rState.error && (
                <span className="text-xs text-red-600">{rState.error}</span>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-400">
            Fully refunded.
          </p>
        )}
      </form>
    </div>
  );
}
