import {
  createHmac,
  createHash,
  timingSafeEqual,
  scryptSync,
  randomBytes,
} from "node:crypto";

// Stateless, signed session for the single admin user. The cookie value is
// `base64url(payload).hmac` — no DB lookup needed to verify, so the `proxy`
// (Next 16's renamed middleware, Node runtime) can check it cheaply. This module
// must stay free of `next/headers` so it's safe to import from proxy.ts; cookie
// reading/writing lives in lib/admin-session.ts.

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours
const TTL_MS = SESSION_MAX_AGE_SECONDS * 1000;
const PW_OVERRIDE_KEY = "admin_password_hash";

// Signing secret: prefer a dedicated SESSION_SECRET; otherwise derive a stable
// 32-byte key from ADMIN_PASSWORD so the feature works with the existing env.
// NOTE: changing the password override via Settings does not rotate this secret;
// it stays tied to env so existing sessions remain valid.
function secret(): Buffer {
  const s = process.env.SESSION_SECRET;
  if (s) return Buffer.from(s);
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("Neither SESSION_SECRET nor ADMIN_PASSWORD is set");
  return createHash("sha256").update(pw).digest();
}

export function createSessionToken(): string {
  const payload = { sub: "admin", exp: Date.now() + TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;

  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

// --- Password ---------------------------------------------------------------

/** Hash a password for storage (admin password override set from Settings). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyHashed(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

/**
 * Check a login password. A password override stored in the DB (set from the
 * admin Settings page) takes precedence; otherwise fall back to ADMIN_PASSWORD.
 */
export async function passwordMatches(provided: string): Promise<boolean> {
  // Lazy import so proxy.ts (which only needs verifySessionToken) doesn't pull
  // the database driver into its bundle.
  const { getSetting } = await import("@/lib/settings-db");
  const override = await getSetting(PW_OVERRIDE_KEY);
  if (override) return verifyHashed(provided, override);

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export { PW_OVERRIDE_KEY };
