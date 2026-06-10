"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="from" value={from} />
      <label className="flex flex-col gap-2">
        <span className="font-label text-xs uppercase tracking-[0.18em] text-neutral-400">
          Password
        </span>
        <input
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
