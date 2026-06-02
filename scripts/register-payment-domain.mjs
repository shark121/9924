// Registers a domain with Stripe so wallet payment methods (Apple Pay, Google
// Pay, Link) render in the embedded Payment Element. This is the API equivalent
// of Dashboard → Settings → Payments → Payment method domains. Stripe then
// hosts the Apple Pay association file for you — no /.well-known file needed.
//
// Usage:
//   node scripts/register-payment-domain.mjs www.9924.store
//   node scripts/register-payment-domain.mjs            (defaults to www.9924.store)
//
// Reads STRIPE_SECRET_KEY from the environment, or from .env.local if present.
// Run it once per domain, with your LIVE key, against production.

import Stripe from "stripe";
import { readFileSync } from "node:fs";

// Minimal .env.local loader so this works without extra deps or a Node flag.
function loadEnvLocal() {
  if (process.env.STRIPE_SECRET_KEY) return;
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
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set (env or .env.local).");
  process.exit(1);
}

const domain = process.argv[2] ?? "www.9924.store";
const stripe = new Stripe(key);
const live = key.startsWith("sk_live");

console.log(
  `Registering "${domain}" in ${live ? "LIVE" : "TEST"} mode…\n` +
    "(Wallets only show on the exact host they're registered for — register " +
    "both apex and www if you serve both.)"
);

try {
  // Re-registering an existing domain throws; treat that as success.
  const existing = await stripe.paymentMethodDomains.list({ domain_name: domain, limit: 1 });
  const pmd =
    existing.data[0] ??
    (await stripe.paymentMethodDomains.create({ domain_name: domain }));

  // Validate so Stripe (re)checks the association file is reachable.
  const validated = await stripe.paymentMethodDomains.validate(pmd.id);

  const wallets = ["apple_pay", "google_pay", "link"]
    .map((w) => `${w}: ${validated[w]?.status ?? "n/a"}`)
    .join(", ");

  console.log(`\n✓ ${validated.domain_name} (${validated.id})`);
  console.log(`  enabled: ${validated.enabled}`);
  console.log(`  ${wallets}`);
  if (!validated.enabled) {
    console.log(
      "\n⚠ Domain not yet enabled — confirm the site is publicly reachable " +
        "over HTTPS, then re-run. Apple Pay also needs the domain live."
    );
  }
} catch (err) {
  console.error("\nx Registration failed:", err?.message ?? err);
  process.exit(1);
}
