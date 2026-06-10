import type Stripe from "stripe";
import { query } from "@/lib/db";

// Persistent order store backed by Neon Postgres. Every successful order is
// written here from the Stripe webhook, capturing amounts, line items, and the
// full shipping address so we have a durable record independent of Stripe. The
// admin UI adds fulfillment and refund tracking via the columns below.

export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

let _ready: Promise<void> | null = null;

function ensure(): Promise<void> {
  if (!_ready) {
    _ready = query(`
      CREATE TABLE IF NOT EXISTS orders (
        payment_intent_id   text PRIMARY KEY,
        created_at          text NOT NULL,
        status              text NOT NULL,
        email               text,
        currency            text NOT NULL,
        amount_cents        integer NOT NULL,
        subtotal_cents      integer,
        tax_cents           integer,
        shipping_cents      integer,
        shipping_service    text,
        items               text,
        ship_name           text,
        ship_phone          text,
        ship_line1          text,
        ship_line2          text,
        ship_city           text,
        ship_state          text,
        ship_postal_code    text,
        ship_country        text,
        raw                 text NOT NULL,
        fulfillment_status  text NOT NULL DEFAULT 'unfulfilled',
        tracking_number     text,
        tracking_carrier    text,
        refund_status       text,
        refunded_cents      integer NOT NULL DEFAULT 0,
        refund_id           text,
        updated_at          text
      )
    `).then(() => undefined);
  }
  return _ready;
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
export async function listOrders(filter?: OrderFilter): Promise<OrderRow[]> {
  await ensure();
  const where: string[] = [];
  const params: string[] = [];
  let n = 1;
  if (filter?.q) {
    where.push(
      `(email ILIKE $${n} OR payment_intent_id ILIKE $${n} OR ship_name ILIKE $${n})`
    );
    params.push(`%${filter.q}%`);
    n++;
  }
  if (filter?.status) {
    where.push(`status = $${n++}`);
    params.push(filter.status);
  }
  if (filter?.fulfillment) {
    where.push(`fulfillment_status = $${n++}`);
    params.push(filter.fulfillment);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return query<OrderRow>(
    `SELECT ${SELECT_COLS} FROM orders ${clause} ORDER BY created_at DESC`,
    params
  );
}

export async function getOrder(
  paymentIntentId: string
): Promise<OrderRow | null> {
  await ensure();
  const rows = await query<OrderRow>(
    `SELECT ${SELECT_COLS} FROM orders WHERE payment_intent_id = $1`,
    [paymentIntentId]
  );
  return rows[0] ?? null;
}

/** Update fulfillment status and optional tracking for an order. */
export async function updateFulfillment(
  paymentIntentId: string,
  patch: {
    status: FulfillmentStatus;
    trackingNumber?: string | null;
    trackingCarrier?: string | null;
  }
): Promise<void> {
  await ensure();
  await query(
    `UPDATE orders SET
       fulfillment_status = $1, tracking_number = $2, tracking_carrier = $3,
       updated_at = $4
     WHERE payment_intent_id = $5`,
    [
      patch.status,
      patch.trackingNumber ?? null,
      patch.trackingCarrier ?? null,
      new Date().toISOString(),
      paymentIntentId,
    ]
  );
}

/** Record a Stripe refund against an order. */
export async function recordRefund(
  paymentIntentId: string,
  patch: { refundId: string; refundedCents: number; refundStatus: string }
): Promise<void> {
  await ensure();
  await query(
    `UPDATE orders SET
       refund_id = $1, refunded_cents = $2, refund_status = $3, updated_at = $4
     WHERE payment_intent_id = $5`,
    [
      patch.refundId,
      patch.refundedCents,
      patch.refundStatus,
      new Date().toISOString(),
      paymentIntentId,
    ]
  );
}

/**
 * Persist a successful order from its Stripe PaymentIntent. Idempotent: Stripe
 * may deliver the same webhook more than once, so we upsert on the intent id
 * and refresh the status/amounts each time.
 */
export async function recordOrder(pi: Stripe.PaymentIntent): Promise<void> {
  await ensure();
  const shipping = pi.shipping;
  const address = shipping?.address;
  const meta = pi.metadata ?? {};

  await query(
    `INSERT INTO orders (
       payment_intent_id, created_at, status, email, currency, amount_cents,
       subtotal_cents, tax_cents, shipping_cents, shipping_service, items,
       ship_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state,
       ship_postal_code, ship_country, raw
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
     )
     ON CONFLICT (payment_intent_id) DO UPDATE SET
       status       = EXCLUDED.status,
       amount_cents = EXCLUDED.amount_cents,
       raw          = EXCLUDED.raw`,
    [
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
      JSON.stringify(pi),
    ]
  );
}
