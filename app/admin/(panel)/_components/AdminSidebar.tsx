"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "../actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-300">
      <div className="px-6 py-6">
        <div className="font-headline text-lg uppercase tracking-[0.3em] text-neutral-100">
          9924
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Admin
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-neutral-800 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-neutral-200"
        >
          <ExternalLink size={17} strokeWidth={1.75} />
          View store
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-neutral-200"
          >
            <LogOut size={17} strokeWidth={1.75} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
