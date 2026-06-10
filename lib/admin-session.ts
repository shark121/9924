import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";

// Cookie read/write helpers for server components, route handlers, and server
// actions. Kept separate from lib/auth.ts (which proxy.ts imports) because
// next/headers may only be used in server-render contexts.

export async function getSession(): Promise<boolean> {
  const c = await cookies();
  return verifySessionToken(c.get(COOKIE_NAME)?.value);
}

/** Redirect to the login page unless a valid session is present. */
export async function requireAdmin(): Promise<void> {
  if (!(await getSession())) redirect("/admin/login");
}

export async function startSession(): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
