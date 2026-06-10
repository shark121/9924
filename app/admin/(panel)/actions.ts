"use server";

import { redirect } from "next/navigation";
import { endSession } from "@/lib/admin-session";

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}
