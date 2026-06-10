import Link from "next/link";
import { Download } from "lucide-react";
import { listOrders } from "@/lib/orders-db";
import { money, dateTime } from "../_lib/format";
import OrderFilters from "./OrderFilters";

export const dynamic = "force-dynamic";

const FULFILLMENT_STYLES: Record<string, string> = {
  unfulfilled: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-neutral-200 text-neutral-600",
};

export default async function OrdersPage(props: {
  searchParams: Promise<{ q?: string; status?: string; fulfillment?: string }>;
}) {
  const sp = await props.searchParams;
  const orders = listOrders({
    q: sp.q,
    status: sp.status,
    fulfillment: sp.fulfillment,
  });

  const exportQuery = new URLSearchParams();
  if (sp.q) exportQuery.set("q", sp.q);
  if (sp.fulfillment) exportQuery.set("fulfillment", sp.fulfillment);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-bold tracking-tight text-neutral-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/orders/export?format=csv&${exportQuery.toString()}`}
            className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Download size={15} /> CSV
          </Link>
          <Link
            href={`/admin/orders/export?format=json&${exportQuery.toString()}`}
            className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Download size={15} /> JSON
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <OrderFilters />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {orders.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.payment_intent_id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 text-neutral-500">
                    {dateTime(o.created_at)}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{o.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] ${
                        o.status === "succeeded"
                          ? "bg-green-100 text-green-800"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {o.status}
                    </span>
                    {o.refunded_cents > 0 && (
                      <span className="ml-1 inline-block rounded bg-red-100 px-2 py-0.5 text-[11px] text-red-700">
                        refunded
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] ${
                        FULFILLMENT_STYLES[o.fulfillment_status] ??
                        "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {o.fulfillment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {money(o.amount_cents, o.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
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
          <p className="px-4 py-10 text-center text-sm text-neutral-400">
            No orders match.
          </p>
        )}
      </div>
    </div>
  );
}
