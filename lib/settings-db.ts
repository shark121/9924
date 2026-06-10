import { query } from "@/lib/db";

// Key/value settings store (Neon Postgres). Holds runtime-editable config that
// would otherwise need a redeploy: the admin password override (see lib/auth.ts)
// and the shipping policy (see lib/shipping.ts).

let _ready: Promise<void> | null = null;

function ensure(): Promise<void> {
  if (!_ready) {
    _ready = query(
      `CREATE TABLE IF NOT EXISTS settings (
         key   text PRIMARY KEY,
         value text NOT NULL
       )`
    ).then(() => undefined);
  }
  return _ready;
}

export async function getSetting(key: string): Promise<string | null> {
  await ensure();
  const rows = await query<{ value: string }>(
    `SELECT value FROM settings WHERE key = $1`,
    [key]
  );
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensure();
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}

export async function getAllSettings(): Promise<Record<string, string>> {
  await ensure();
  const rows = await query<{ key: string; value: string }>(
    `SELECT key, value FROM settings`
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
