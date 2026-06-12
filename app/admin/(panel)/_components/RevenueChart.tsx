"use client";

import { money } from "../_lib/format";

export type ChartPoint = { label: string; cents: number };

// Lightweight inline-SVG bar chart — avoids pulling in a charting dependency.
export default function RevenueChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.cents));

  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((d, i) => {
        const pct = (d.cents / max) * 100;
        return (
          <div
            key={i}
            className="group relative flex h-full flex-1 flex-col"
            title={`${d.label}: ${money(d.cents)}`}
          >
            {/* Bar track: flex-1 gives it a definite height so the bar's
                percentage height resolves; items-end grows bars from the base. */}
            <div className="flex flex-1 items-end">
              <div
                className="w-full rounded-sm bg-neutral-800 transition group-hover:bg-neutral-900"
                style={{ height: `${Math.max(pct, 1.5)}%` }}
              />
            </div>
            <span className="mt-1.5 text-center text-[9px] text-neutral-400">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
