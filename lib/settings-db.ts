import { getDb } from "@/lib/db";

// Simple key/value settings store, shared SQLite file. Holds runtime-editable
// configuration that would otherwise require a redeploy: the admin password
// override (see lib/auth.ts) and the shipping policy (see lib/shipping.ts).

let _ready = false;

function db() {
  const d = getDb();
  if (!_ready) {
    d.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    _ready = true;
  }
  return d;
}

export function getSetting(key: string): string | null {
  const row = db()
    .prepare(`SELECT value FROM settings WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db()
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    .run(key, value);
}

export function getAllSettings(): Record<string, string> {
  const rows = db().prepare(`SELECT key, value FROM settings`).all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
