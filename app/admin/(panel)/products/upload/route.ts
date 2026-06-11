import { type NextRequest } from "next/server";
import { getSession } from "@/lib/admin-session";
import { saveImage } from "@/lib/images-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (base64-encoded into Postgres)
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

// Accepts a single image file and stores it in Postgres (works on Vercel's
// read-only filesystem), returning the URL to save on the product.
export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return Response.json(
      { error: "Unsupported file type (use JPEG, PNG, WebP, AVIF, or GIF)" },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "File too large (max 5 MB)" },
      { status: 413 }
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const id = await saveImage(file.type, base64);

  return Response.json({ url: `/api/images/${id}` });
}
