import Link from "next/link";
import { listOrders } from "@/lib/orders-db";
import { listProducts } from "@/lib/products-db";
import { money, dateTime } from "./_lib/format";
import RevenueChart, { type ChartPoint } from "./_components/RevenueChart";

export const dynamic = "force-dynamic";

type LineItem = { name: string; size: string; qty: number };

function parseItems(raw: string | null): LineItem[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </div>
      <div className="mt-2 font-headline text-2xl font-bold text-neutral-900">
        {value}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const orders = listOrders();
  const products = listProducts({ includeArchived: true });

  const succeeded = orders.filter((o) => o.status === "succeeded");
  const netRevenue = succeeded.reduce(
    (sum, o) => sum + (o.amount_cents - (o.refunded_cents ?? 0)),
    0
  );
  const orderCount = succeeded.length;
  const aov = orderCount ? Math.round(netRevenue / orderCount) : 0;
  const unfulfilled = orders.filter(
    (o) => o.status === "succeeded" && o.fulfillment_status === "unfulfilled"
  ).length;

  // Last 14 days of net revenue (succeeded orders), bucketed by day.
  const DAYS = 14;
  const buckets = new Map<string, number>();
  const today = new Date();
  const order: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
    order.push(key);
  }
  for (const o of succeeded) {
    const key = (o.created_at ?? "").slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key)! + (o.amount_cents - (o.refunded_cents ?? 0)));
    }
  }
  const chart: ChartPoint[] = order.map((key) => ({
    label: key.slice(5).replace("-", "/"),
    cents: buckets.get(key) ?? 0,
  }));

  // Top products by quantity sold across succeeded orders.
  const qtyByName = new Map<string, number>();
  for (const o of succeeded) {
    for (const it of parseItems(o.items)) {
      qtyByName.set(it.name, (qtyByName.get(it.name) ?? 0) + (it.qty ?? 0));
    }
  }
  const topProducts = [...qtyByName.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recent = orders.slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-headline text-xl font-bold tracking-tight text-neutral-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-neutral-500">Store overview</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Net revenue" value={money(netRevenue)} />
        <StatCard label="Orders" value={String(orderCount)} />
        <StatCard label="Avg. order" value={money(aov)} />
        <StatCard label="Unfulfilled" value={String(unfulfilled)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            Revenue · last {DAYS} days
          </div>
          <RevenueChart data={chart} />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            Top products
          </div>
          {topProducts.length ? (
            <ul className="flex flex-col gap-3">
              {topProducts.map(([name, qty]) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate text-neutral-700">{name}</span>
                  <span className="shrink-0 font-medium text-neutral-900">
                    {qty} sold
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-400">No sales yet.</p>
          )}
          <p className="mt-4 text-[10px] text-neutral-400">
            {products.length} product{products.length === 1 ? "" : "s"} in catalog
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h2 className="text-sm font-medium text-neutral-900">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-neutral-500 hover:text-neutral-900"
          >
            View all →
          </Link>
        </div>
        {recent.length ? (
          <table className="w-full text-sm">
            <tbody>
              {recent.map((o) => (
                <tr
                  key={o.payment_intent_id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-5 py-3 text-neutral-500">
                    {dateTime(o.created_at)}
                  </td>
                  <td className="px-5 py-3 text-neutral-700">{o.email ?? "—"}</td>
                  <td className="px-5 py-3 text-neutral-500">
                    {o.fulfillment_status}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-neutral-900">
                    {money(o.amount_cents, o.currency)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.payment_intent_id}`}
                      className="text-xs text-neutral-500 hover:text-neutral-900"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-8 text-sm text-neutral-400">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
