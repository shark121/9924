import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// Single shared SQLite handle for the whole app. Orders, products, and settings
// all live in one file (default `data/orders.db`, override with ORDERS_DB_PATH)
// so there is one volume to mount in production and one connection to manage.
// WAL mode lets storefront reads and admin writes coexist.

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  const dbPath =
    process.env.ORDERS_DB_PATH || join(process.cwd(), "data", "orders.db");
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  _db = db;
  return _db;
}

/**
 * Add a column to an existing table if it isn't already present. Idempotent, so
 * it's safe to run on every boot against databases created by older versions.
 */
export function ensureColumn(
  db: DatabaseSync,
  table: string,
  column: string,
  ddl: string
): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}
