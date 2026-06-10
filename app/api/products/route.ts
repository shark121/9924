import { listProducts } from "@/lib/products-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, read-only catalog feed (active products only).
export function GET() {
  return Response.json({ products: listProducts() });
}
