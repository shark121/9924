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
            className="group relative flex flex-1 flex-col items-center justify-end"
            title={`${d.label}: ${money(d.cents)}`}
          >
            <div
              className="w-full rounded-sm bg-neutral-800 transition group-hover:bg-neutral-900"
              style={{ height: `${Math.max(pct, 1.5)}%` }}
            />
            <span className="mt-1.5 text-[9px] text-neutral-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
