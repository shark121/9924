import { NextRequest } from "next/server";
import {
  assertValidItems,
  getRatesWithDebug,
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
    const { rates, debug } = await getRatesWithDebug(a, body.items);
    if (!rates.length) {
      return Response.json(
        { error: "No shipping options for this address.", debug },
        { status: 422 }
      );
    }
    // `debug` lets the client mirror the Shippo outcome (status, messages,
    // whether the flat fallback was used) into the browser console.
    return Response.json({ rates, debug });
  } catch (e) {
    const msg = typeof e === "string" ? e : "Could not fetch shipping rates.";
    return Response.json({ error: msg }, { status: 400 });
  }
}
