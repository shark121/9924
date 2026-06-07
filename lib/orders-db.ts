import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type Stripe from "stripe";

// Persistent order store backed by SQLite (Node's built-in `node:sqlite`).
// Every successful order is written here from the Stripe webhook, capturing the
// amounts, line items, and full shipping address so we have a durable record
// independent of the Stripe dashboard.

let _db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (_db) return _db;

  // Default to a gitignored `data/` dir at the project root; override with
  // ORDERS_DB_PATH (e.g. a mounted volume in production).
  const dbPath = process.env.ORDERS_DB_PATH || join(process.cwd(), "data", "orders.db");
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
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

  _db = db;
  return _db;
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
}

/** Every order, newest first. */
export function listOrders(): OrderRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT payment_intent_id, created_at, status, email, currency, amount_cents,
              subtotal_cents, tax_cents, shipping_cents, shipping_service, items,
              ship_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state,
              ship_postal_code, ship_country
         FROM orders
        ORDER BY created_at DESC`
    )
    .all() as unknown as OrderRow[];
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
