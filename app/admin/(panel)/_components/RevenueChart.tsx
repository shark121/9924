"use client";

import { money } from "../_lib/format";

export type ChartPoint = { label: string; cents: number };

// Lightweight CSS bar chart — avoids pulling in a charting dependency.
export default function RevenueChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.cents));
  const hasRevenue = data.some((d) => d.cents > 0);

  if (!hasRevenue) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="text-xs text-neutral-400">
          No revenue in the last {data.length} days.
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-40 flex-col">
      {/* Bar row: flex-1 of the fixed-height column gives it a definite height,
          so each bar (a DIRECT child) resolves its percentage height. */}
      <div className="flex flex-1 items-end gap-1.5">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-neutral-800 transition hover:bg-neutral-900"
            style={{ height: `${Math.max((d.cents / max) * 100, 1)}%` }}
            title={`${d.label}: ${money(d.cents)}`}
          />
        ))}
      </div>
      {/* Labels mirror the bar widths (same flex-1 + gap) so they line up. */}
      <div className="mt-1.5 flex gap-1.5">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[9px] text-neutral-400"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
