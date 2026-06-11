import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

// Image blobs stored in Postgres (base64 text). This works on Vercel's
// read-only filesystem, unlike writing to public/uploads. Images are served by
// app/api/images/[id]/route.ts. For a large/high-traffic catalog, object storage
// with a CDN (Vercel Blob, S3/R2) would be a better fit than the database.

let _ready: Promise<void> | null = null;

function ensure(): Promise<void> {
  if (!_ready) {
    _ready = query(`
      CREATE TABLE IF NOT EXISTS images (
        id           text PRIMARY KEY,
        content_type text NOT NULL,
        data         text NOT NULL,
        created_at   text NOT NULL
      )
    `).then(() => undefined);
  }
  return _ready;
}

export async function saveImage(
  contentType: string,
  base64: string
): Promise<string> {
  await ensure();
  const id = randomUUID().replace(/-/g, "");
  await query(
    `INSERT INTO images (id, content_type, data, created_at)
     VALUES ($1, $2, $3, $4)`,
    [id, contentType, base64, new Date().toISOString()]
  );
  return id;
}

export async function getImage(
  id: string
): Promise<{ contentType: string; data: string } | null> {
  await ensure();
  const rows = await query<{ content_type: string; data: string }>(
    `SELECT content_type, data FROM images WHERE id = $1`,
    [id]
  );
  return rows[0]
    ? { contentType: rows[0].content_type, data: rows[0].data }
    : null;
}
