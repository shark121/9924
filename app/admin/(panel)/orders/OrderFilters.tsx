"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function OrderFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`/admin/orders?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="relative"
      >
        <Search
          size={15}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email, name, intent…"
          className="w-64 rounded-md border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-neutral-500"
        />
      </form>

      {(params.get("q") || params.get("status")) && (
        <button
          onClick={() => router.push("/admin/orders")}
          className="text-xs text-neutral-500 hover:text-neutral-900"
        >
          Clear
        </button>
      )}
    </div>
  );
}
