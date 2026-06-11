import { type NextRequest } from "next/server";
import { getImage } from "@/lib/images-db";

export const runtime = "nodejs";

// Serves a product image stored in Postgres. IDs are unique and content is
// immutable, so it's safe to cache aggressively.
export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const img = await getImage(id);
  if (!img) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(img.data, "base64");
  return new Response(bytes, {
    headers: {
      "content-type": img.contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
