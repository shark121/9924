import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon serverless Postgres over HTTP — works on Vercel's read-only/ephemeral
// filesystem (unlike a local SQLite file) and persists across instances.
// Set DATABASE_URL to your Neon connection string (locally in .env.local, and
// in the Vercel project env). Use `sql.query(text, params)` with $1, $2 …
// placeholders for parameterized queries.

let _sql: NeonQueryFunction<false, false> | null = null;

export function sql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — point it at your Neon Postgres connection string."
    );
  }
  _sql = neon(url);
  return _sql;
}

/** Run a parameterized query and return the rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const rows = await sql().query(text, params);
  return rows as T[];
}
