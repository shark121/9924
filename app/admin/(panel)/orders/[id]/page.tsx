import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrder } from "@/lib/orders-db";
import { money, dateTime } from "../../_lib/format";
import OrderActions from "./OrderActions";

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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right text-neutral-900">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const order = await getOrder(id);
  if (!order) notFound();

  const items = parseItems(order.items);
  const address = [
    order.ship_line1,
    order.ship_line2,
    [order.ship_city, order.ship_state, order.ship_postal_code]
      .filter(Boolean)
      .join(", "),
    order.ship_country,
  ].filter(Boolean);

  const remaining = order.amount_cents - (order.refunded_cents ?? 0);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={15} /> Orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-headline text-xl font-bold tracking-tight text-neutral-900">
          Order
        </h1>
        <span className="font-mono text-xs text-neutral-500">
          {order.payment_intent_id}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {dateTime(order.created_at)}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: details */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-2 text-sm font-medium text-neutral-900">Items</h3>
            {items.length ? (
              <ul className="flex flex-col gap-1.5">
                {items.map((it, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-neutral-700">
                      {it.qty}× {it.name}{" "}
                      <span className="text-neutral-400">({it.size})</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">No line items recorded.</p>
            )}
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <Row
                label="Subtotal"
                value={money(order.subtotal_cents, order.currency)}
              />
              <Row label="Tax" value={money(order.tax_cents, order.currency)} />
              <Row
                label={`Shipping${order.shipping_service ? ` · ${order.shipping_service}` : ""}`}
                value={money(order.shipping_cents, order.currency)}
              />
              <div className="mt-1 border-t border-neutral-100 pt-2">
                <Row
                  label="Total"
                  value={
                    <strong>{money(order.amount_cents, order.currency)}</strong>
                  }
                />
                {order.refunded_cents > 0 && (
                  <Row
                    label="Refunded"
                    value={
                      <span className="text-red-600">
                        −{money(order.refunded_cents, order.currency)}
                      </span>
                    }
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h3 className="mb-2 text-sm font-medium text-neutral-900">
                Customer
              </h3>
              <p className="text-sm text-neutral-700">{order.email ?? "—"}</p>
              {order.ship_phone && (
                <p className="text-sm text-neutral-500">{order.ship_phone}</p>
              )}
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h3 className="mb-2 text-sm font-medium text-neutral-900">
                Ship to
              </h3>
              <p className="text-sm text-neutral-700">{order.ship_name ?? "—"}</p>
              {address.map((line, i) => (
                <p key={i} className="text-sm text-neutral-500">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div>
          <OrderActions
            id={order.payment_intent_id}
            fulfillmentStatus={order.fulfillment_status}
            trackingNumber={order.tracking_number}
            trackingCarrier={order.tracking_carrier}
            remainingCents={remaining}
            currency={order.currency}
          />
        </div>
      </div>
    </div>
  );
}
