import type { DatabaseSync } from "node:sqlite";
import type Stripe from "stripe";
import { getDb as getSharedDb, ensureColumn } from "@/lib/db";

// Persistent order store backed by SQLite (Node's built-in `node:sqlite`).
// Every successful order is written here from the Stripe webhook, capturing the
// amounts, line items, and full shipping address so we have a durable record
// independent of the Stripe dashboard. The admin UI adds fulfillment and refund
// tracking on top via the columns added by the migration below.

export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

let _ready = false;

function getDb(): DatabaseSync {
  const db = getSharedDb();
  if (_ready) return db;

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      payment_intent_id   TEXT PRIMARY KEY,
      created_at          TEXT NOT NULL,
      status              TEXT NOT NULL,
      email               TEXT,
      currency            TEXT NOT NULL,
      amount_cents        INTEGER NOT NULL,
      subtotal_cents      INTEGER,
      tax_cents           INTEGER,
      shipping_cents      INTEGER,
      shipping_service    TEXT,
      items               TEXT,
      ship_name           TEXT,
      ship_phone          TEXT,
      ship_line1          TEXT,
      ship_line2          TEXT,
      ship_city           TEXT,
      ship_state          TEXT,
      ship_postal_code    TEXT,
      ship_country        TEXT,
      raw                 TEXT NOT NULL
    )
  `);

  // Additive migration so databases created before the admin UI keep working.
  ensureColumn(db, "orders", "fulfillment_status",
    "fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled'");
  ensureColumn(db, "orders", "tracking_number", "tracking_number TEXT");
  ensureColumn(db, "orders", "tracking_carrier", "tracking_carrier TEXT");
  ensureColumn(db, "orders", "refund_status", "refund_status TEXT");
  ensureColumn(db, "orders", "refunded_cents",
    "refunded_cents INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "orders", "refund_id", "refund_id TEXT");
  ensureColumn(db, "orders", "updated_at", "updated_at TEXT");

  _ready = true;
  return db;
}

function toInt(value: string | undefined): number | null {
  if (value == null) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

export interface OrderRow {
  payment_intent_id: string;
  created_at: string;
  status: string;
  email: string | null;
  currency: string;
  amount_cents: number;
  subtotal_cents: number | null;
  tax_cents: number | null;
  shipping_cents: number | null;
  shipping_service: string | null;
  items: string | null;
  ship_name: string | null;
  ship_phone: string | null;
  ship_line1: string | null;
  ship_line2: string | null;
  ship_city: string | null;
  ship_state: string | null;
  ship_postal_code: string | null;
  ship_country: string | null;
  fulfillment_status: FulfillmentStatus;
  tracking_number: string | null;
  tracking_carrier: string | null;
  refund_status: string | null;
  refunded_cents: number;
  refund_id: string | null;
  updated_at: string | null;
}

const SELECT_COLS = `payment_intent_id, created_at, status, email, currency, amount_cents,
              subtotal_cents, tax_cents, shipping_cents, shipping_service, items,
              ship_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state,
              ship_postal_code, ship_country, fulfillment_status, tracking_number,
              tracking_carrier, refund_status, refunded_cents, refund_id, updated_at`;

export interface OrderFilter {
  q?: string; // matches email / payment intent id / ship name
  status?: string; // Stripe payment status
  fulfillment?: string; // FulfillmentStatus
}

/** Orders newest first, optionally filtered by search text / status. */
export function listOrders(filter?: OrderFilter): OrderRow[] {
  const where: string[] = [];
  const params: string[] = [];
  if (filter?.q) {
    where.push(
      "(email LIKE ? OR payment_intent_id LIKE ? OR ship_name LIKE ?)"
    );
    const like = `%${filter.q}%`;
    params.push(like, like, like);
  }
  if (filter?.status) {
    where.push("status = ?");
    params.push(filter.status);
  }
  if (filter?.fulfillment) {
    where.push("fulfillment_status = ?");
    params.push(filter.fulfillment);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return getDb()
    .prepare(
      `SELECT ${SELECT_COLS} FROM orders ${clause} ORDER BY created_at DESC`
    )
    .all(...params) as unknown as OrderRow[];
}

export function getOrder(paymentIntentId: string): OrderRow | null {
  const row = getDb()
    .prepare(`SELECT ${SELECT_COLS} FROM orders WHERE payment_intent_id = ?`)
    .get(paymentIntentId) as OrderRow | undefined;
  return row ?? null;
}

/** Update fulfillment status and optional tracking for an order. */
export function updateFulfillment(
  paymentIntentId: string,
  patch: {
    status: FulfillmentStatus;
    trackingNumber?: string | null;
    trackingCarrier?: string | null;
  }
): void {
  getDb()
    .prepare(
      `UPDATE orders SET
         fulfillment_status = ?, tracking_number = ?, tracking_carrier = ?,
         updated_at = ?
       WHERE payment_intent_id = ?`
    )
    .run(
      patch.status,
      patch.trackingNumber ?? null,
      patch.trackingCarrier ?? null,
      new Date().toISOString(),
      paymentIntentId
    );
}

/** Record a Stripe refund against an order. */
export function recordRefund(
  paymentIntentId: string,
  patch: { refundId: string; refundedCents: number; refundStatus: string }
): void {
  getDb()
    .prepare(
      `UPDATE orders SET
         refund_id = ?, refunded_cents = ?, refund_status = ?, updated_at = ?
       WHERE payment_intent_id = ?`
    )
    .run(
      patch.refundId,
      patch.refundedCents,
      patch.refundStatus,
      new Date().toISOString(),
      paymentIntentId
    );
}

/**
 * Persist a successful order from its Stripe PaymentIntent. Idempotent: Stripe
 * may deliver the same webhook more than once, so we upsert on the intent id
 * and refresh the status/amounts each time.
 */
export function recordOrder(pi: Stripe.PaymentIntent): void {
  const db = getDb();
  const shipping = pi.shipping;
  const address = shipping?.address;
  const meta = pi.metadata ?? {};

  db.prepare(
    `INSERT INTO orders (
       payment_intent_id, created_at, status, email, currency, amount_cents,
       subtotal_cents, tax_cents, shipping_cents, shipping_service, items,
       ship_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state,
       ship_postal_code, ship_country, raw
     ) VALUES (
       ?, ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?, ?,
       ?, ?, ?
     )
     ON CONFLICT(payment_intent_id) DO UPDATE SET
       status       = excluded.status,
       amount_cents = excluded.amount_cents,
       raw          = excluded.raw`
  ).run(
    pi.id,
    new Date(pi.created * 1000).toISOString(),
    pi.status,
    pi.receipt_email ?? null,
    pi.currency,
    pi.amount,
    toInt(meta.subtotal_cents),
    toInt(meta.tax_cents),
    toInt(meta.shipping_cents),
    meta.shipping_service ?? null,
    meta.items ?? null,
    shipping?.name ?? null,
    shipping?.phone ?? null,
    address?.line1 ?? null,
    address?.line2 ?? null,
    address?.city ?? null,
    address?.state ?? null,
    address?.postal_code ?? null,
    address?.country ?? null,
    JSON.stringify(pi)
  );
}
