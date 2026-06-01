import { NextRequest } from "next/server";
import {
  assertValidItems,
  getRates,
  type IncomingItem,
  type ShippingAddressInput,
} from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    items?: IncomingItem[];
    address?: ShippingAddressInput;
  };

  if (!body.items?.length) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  const a = body.address;
  if (!a?.address || !a.city || !a.postal || !a.country) {
    return Response.json({ error: "Incomplete address" }, { status: 400 });
  }

  try {
    assertValidItems(body.items);
    const rates = await getRates(a, body.items);
    if (!rates.length) {
      return Response.json(
        { error: "No shipping options for this address." },
        { status: 422 }
      );
    }
    return Response.json({ rates });
  } catch (e) {
    const msg = typeof e === "string" ? e : "Could not fetch shipping rates.";
    return Response.json({ error: msg }, { status: 400 });
  }
}
