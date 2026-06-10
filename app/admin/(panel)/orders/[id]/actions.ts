"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { getStripe } from "@/lib/stripe";
import {
  getOrder,
  updateFulfillment,
  recordRefund,
  type FulfillmentStatus,
} from "@/lib/orders-db";

export type ActionState = { ok?: boolean; error?: string };

const STATUSES: FulfillmentStatus[] = [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function setFulfillmentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as FulfillmentStatus;
  if (!STATUSES.includes(status)) return { error: "Invalid status" };

  const trackingNumber =
    String(formData.get("tracking_number") ?? "").trim() || null;
  const trackingCarrier =
    String(formData.get("tracking_carrier") ?? "").trim() || null;

  await updateFulfillment(id, { status, trackingNumber, trackingCarrier });
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

export async function refundOrderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const order = await getOrder(id);
  if (!order) return { error: "Order not found" };

  const remaining = order.amount_cents - (order.refunded_cents ?? 0);
  if (remaining <= 0) return { error: "Order is already fully refunded" };

  // Empty amount => refund the full remaining balance.
  const raw = String(formData.get("amount_usd") ?? "").trim();
  let amount = raw ? Math.round(Number(raw) * 100) : remaining;
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter a valid amount" };
  if (amount > remaining)
    return { error: `Max refundable is ${(remaining / 100).toFixed(2)}` };

  let refundId: string;
  let refundedAmount: number;
  try {
    const refund = await getStripe().refunds.create({
      payment_intent: id,
      amount,
    });
    refundId = refund.id;
    refundedAmount = refund.amount ?? amount;
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Stripe refund failed",
    };
  }

  const refundedTotal = (order.refunded_cents ?? 0) + refundedAmount;
  const refundStatus =
    refundedTotal >= order.amount_cents ? "full" : "partial";
  await recordRefund(id, { refundId, refundedCents: refundedTotal, refundStatus });

  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}
