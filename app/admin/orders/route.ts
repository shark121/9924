import { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { listOrders, type OrderRow } from "@/lib/orders-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Password-protected order viewer. Browse to /admin/orders and the browser will
// prompt for credentials (HTTP Basic Auth). Any username works; the password
// must match ADMIN_PASSWORD.

function unauthorized(message = "Authentication required") {
  return new Response(message, {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="9924 orders", charset="UTF-8"' },
  });
}

function passwordMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal lengths; the length check itself is not secret.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new Response("ADMIN_PASSWORD is not set on the server.", { status: 500 });
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  // Basic auth payload is "user:password"; we ignore the username.
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const password = decoded.slice(decoded.indexOf(":") + 1);
  if (!passwordMatches(password, expected)) return unauthorized("Invalid credentials");

  let orders: OrderRow[];
  try {
    orders = listOrders();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Failed to read orders: ${message}`, { status: 500 });
  }

  // Allow ?format=json for programmatic access / export.
  if (new URL(request.url).searchParams.get("format") === "json") {
    return Response.json({ count: orders.length, orders });
  }

  return new Response(renderHtml(orders), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(cents: number | null, currency: string): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function items(raw: string | null): string {
  if (!raw) return "—";
  try {
    const parsed = JSON.parse(raw) as { name: string; size: string; qty: number }[];
    return parsed.map((i) => `${i.qty}× ${i.name} (${i.size})`).join("<br>");
  } catch {
    return esc(raw);
  }
}

function renderHtml(orders: OrderRow[]): string {
  const rows = orders
    .map((o) => {
      const addr = [
        o.ship_line1,
        o.ship_line2,
        [o.ship_city, o.ship_state, o.ship_postal_code].filter(Boolean).join(", "),
        o.ship_country,
      ]
        .filter(Boolean)
        .map(esc)
        .join("<br>");
      return `<tr>
        <td><time>${esc(o.created_at)}</time></td>
        <td><span class="status ${esc(o.status)}">${esc(o.status)}</span></td>
        <td class="mono">${esc(o.payment_intent_id)}</td>
        <td>${esc(o.email)}</td>
        <td>${items(o.items)}</td>
        <td>
          <strong>${esc(o.ship_name)}</strong><br>${addr}
          ${o.ship_phone ? `<br><span class="muted">${esc(o.ship_phone)}</span>` : ""}
        </td>
        <td class="num">${esc(o.shipping_service)}<br>${money(o.shipping_cents, o.currency)}</td>
        <td class="num">
          <span class="muted">sub ${money(o.subtotal_cents, o.currency)}</span><br>
          <span class="muted">tax ${money(o.tax_cents, o.currency)}</span><br>
          <strong>${money(o.amount_cents, o.currency)}</strong>
        </td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>9924 — Orders</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.5 system-ui, sans-serif; background: #0b0b0c; color: #e7e7e9; padding: 2rem; }
  h1 { font-size: 1.1rem; letter-spacing: .25em; text-transform: uppercase; margin: 0 0 .25rem; }
  .meta { color: #8a8a90; margin-bottom: 1.5rem; font-size: .8rem; }
  .meta a { color: #8a8a90; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: .65rem .75rem; vertical-align: top; border-bottom: 1px solid #232327; }
  th { font-size: .65rem; letter-spacing: .12em; text-transform: uppercase; color: #8a8a90; position: sticky; top: 0; background: #0b0b0c; }
  tr:hover td { background: #141416; }
  .mono { font-family: ui-monospace, monospace; font-size: .75rem; color: #b6b6bb; }
  .num { white-space: nowrap; }
  .muted { color: #8a8a90; font-size: .8rem; }
  .status { font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; padding: .1rem .4rem; border-radius: 3px; background: #232327; }
  .status.succeeded { background: #14391f; color: #6ee7a0; }
  .empty { color: #8a8a90; padding: 3rem 0; }
</style>
</head>
<body>
  <h1>9924 Orders</h1>
  <p class="meta">${orders.length} order${orders.length === 1 ? "" : "s"} · <a href="?format=json">JSON export</a></p>
  ${
    orders.length === 0
      ? `<p class="empty">No orders yet.</p>`
      : `<table>
    <thead><tr>
      <th>Date</th><th>Status</th><th>Payment Intent</th><th>Email</th>
      <th>Items</th><th>Ship To</th><th>Shipping</th><th>Totals</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`
  }
</body>
</html>`;
}
