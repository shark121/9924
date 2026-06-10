import { type NextRequest } from "next/server";
import { getSession } from "@/lib/admin-session";
import { listOrders, type OrderRow } from "@/lib/orders-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS: (keyof OrderRow)[] = [
  "created_at",
  "payment_intent_id",
  "status",
  "fulfillment_status",
  "email",
  "currency",
  "amount_cents",
  "subtotal_cents",
  "tax_cents",
  "shipping_cents",
  "shipping_service",
  "refunded_cents",
  "refund_status",
  "tracking_carrier",
  "tracking_number",
  "ship_name",
  "ship_phone",
  "ship_line1",
  "ship_line2",
  "ship_city",
  "ship_state",
  "ship_postal_code",
  "ship_country",
  "items",
];

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orders = listOrders({
    q: searchParams.get("q") ?? undefined,
    fulfillment: searchParams.get("fulfillment") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  if (searchParams.get("format") === "json") {
    return Response.json({ count: orders.length, orders });
  }

  const header = COLUMNS.join(",");
  const rows = orders.map((o) =>
    COLUMNS.map((c) => csvCell(o[c])).join(",")
  );
  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="orders.csv"`,
    },
  });
}
