import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-session";
import AdminSidebar from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: "9924 — Admin",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-suspenders: proxy.ts already gates /admin, but re-verify here so a
  // server render never leaks admin data without a valid session.
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
