"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateShippingAction,
  type SettingsState,
} from "./actions";

const inputCls =
  "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500";
const labelCls = "text-[10px] uppercase tracking-[0.14em] text-neutral-400";

function Status({ state }: { state: SettingsState }) {
  if (state.ok) return <span className="text-xs text-green-600">Saved.</span>;
  if (state.error)
    return <span className="text-xs text-red-600">{state.error}</span>;
  return null;
}

export function PasswordForm({ hasOverride }: { hasOverride: boolean }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    changePasswordAction,
    {}
  );

  return (
    <form
      action={action}
      className="rounded-xl border border-neutral-200 bg-white p-5"
    >
      <h2 className="text-sm font-medium text-neutral-900">Admin password</h2>
      <p className="mt-1 text-xs text-neutral-500">
        {hasOverride
          ? "A custom password is set (overrides ADMIN_PASSWORD)."
          : "Currently using ADMIN_PASSWORD from the environment."}
      </p>
      <div className="mt-4 flex max-w-sm flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Current password</span>
          <input name="current" type="password" autoComplete="current-password" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>New password</span>
          <input name="next" type="password" autoComplete="new-password" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Confirm new password</span>
          <input name="confirm" type="password" autoComplete="new-password" className={inputCls} />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Update password"}
          </button>
          <Status state={state} />
        </div>
      </div>
    </form>
  );
}

export function ShippingForm({
  intlFlatUsd,
  originCountry,
}: {
  intlFlatUsd: number;
  originCountry: string;
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateShippingAction,
    {}
  );

  return (
    <form
      action={action}
      className="rounded-xl border border-neutral-200 bg-white p-5"
    >
      <h2 className="text-sm font-medium text-neutral-900">Shipping policy</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Domestic (origin country) ships free; everywhere else pays the flat rate.
      </p>
      <div className="mt-4 grid max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Intl flat (USD)</span>
          <input
            name="intl_flat_usd"
            type="number"
            step="0.01"
            min="0"
            defaultValue={intlFlatUsd}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Origin country</span>
          <input
            name="origin_country"
            maxLength={2}
            defaultValue={originCountry}
            className={`${inputCls} uppercase`}
          />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save policy"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}
