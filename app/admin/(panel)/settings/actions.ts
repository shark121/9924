"use server";

import { requireAdmin } from "@/lib/admin-session";
import {
  passwordMatches,
  hashPassword,
  PW_OVERRIDE_KEY,
} from "@/lib/auth";
import { setSetting } from "@/lib/settings-db";

export type SettingsState = { ok?: boolean; error?: string };

export async function changePasswordAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!(await passwordMatches(current)))
    return { error: "Current password is incorrect" };
  if (next.length < 8)
    return { error: "New password must be at least 8 characters" };
  if (next !== confirm) return { error: "New passwords do not match" };

  await setSetting(PW_OVERRIDE_KEY, hashPassword(next));
  return { ok: true };
}

export async function updateShippingAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const intl = Number(String(formData.get("intl_flat_usd") ?? "").trim());
  const origin = String(formData.get("origin_country") ?? "")
    .trim()
    .toUpperCase();

  if (!Number.isFinite(intl) || intl < 0)
    return { error: "Enter a valid international flat rate" };
  if (origin.length !== 2)
    return { error: "Origin must be a 2-letter ISO country code" };

  await setSetting("ship_intl_flat_usd", String(intl));
  await setSetting("ship_from_country", origin);
  return { ok: true };
}
