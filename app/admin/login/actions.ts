"use server";

import { redirect } from "next/navigation";
import { passwordMatches } from "@/lib/auth";
import { startSession } from "@/lib/admin-session";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!(await passwordMatches(password))) {
    return { error: "Incorrect password." };
  }

  await startSession();
  // Only ever redirect within the admin area.
  redirect(from.startsWith("/admin") ? from : "/admin");
}
