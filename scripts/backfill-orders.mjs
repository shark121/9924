// Backfills the orders table from Stripe. Order rows are normally written by the
// `payment_intent.succeeded` webhook (and the checkout success-page fallback). If
// the webhook was misconfigured/undelivered in production, completed purchases
// exist in Stripe but never landed in the database — so the admin dashboard shows
// $0 revenue and an empty orders list. This pulls recent succeeded PaymentIntents
// and upserts them, mirroring recordOrder() in lib/orders-db.ts.
//
// Idempotent: upserts on payment_intent_id, so it's safe to run repeatedly and
// safe alongside the live webhook.
//
// Usage:
//   node scripts/backfill-orders.mjs            (last 30 days)
//   node scripts/backfill-orders.mjs 90         (last 90 days)
//
// Reads STRIPE_SECRET_KEY and DATABASE_URL from the environment or .env.local.
// Run with the LIVE key against the production database to recover prod orders.

import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Minimal .env.local loader (matches scripts/register-payment-domain.mjs).
function loadEnvLocal() {
  if (process.env.STRIPE_SECRET_KEY && process.env.DATABASE_URL) return;
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env.local — rely on the ambient environment.
  }
}

loadEnvLocal();

const key = process.env.STRIPE_SECRET_KEY;
const dbUrl = process.env.DATABASE_URL;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set (env or .env.local).");
  process.exit(1);
}
if (!dbUrl) {
  console.error("DATABASE_URL is not set (env or .env.local).");
  process.exit(1);
}

const days = Number.parseInt(process.argv[2] ?? "30", 10);
const since = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

const stripe = new Stripe(key);
const sql = neon(dbUrl);
const live = key.startsWith("sk_live");

function toInt(value) {
  if (value == null) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

// Mirror lib/orders-db.ts recordOrder().
async function recordOrder(pi) {
  const shipping = pi.shipping;
  const address = shipping?.address;
  const meta = pi.metadata ?? {};
  await sql.query(
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

console.log(
  `Backfilling ${live ? "LIVE" : "TEST"} succeeded payments from the last ` +
    `${days} day(s) into the orders table…`
);

let recorded = 0;
let scanned = 0;
try {
  // Auto-paginates across all matching PaymentIntents created since `since`.
  for await (const pi of stripe.paymentIntents.list({
    created: { gte: since },
    limit: 100,
  })) {
    scanned++;
    if (pi.status !== "succeeded") continue;
    await recordOrder(pi);
    recorded++;
    console.log(`  ✓ ${pi.id}  ${(pi.amount / 100).toFixed(2)} ${pi.currency}`);
  }
} catch (err) {
  console.error("\nx Backfill failed:", err?.message ?? err);
  process.exit(1);
}

console.log(
  `\nDone. Scanned ${scanned} payment(s); upserted ${recorded} succeeded order(s).`
);
