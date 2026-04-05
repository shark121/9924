"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "ARCHIVE", href: "/archive" },
  { label: "LATEST", href: "/store" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "ABOUT", href: "#" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const getCartCount = useCartStore((s) => s.getCartCount);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="bg-neutral-50 fixed top-0 z-50 w-full">
      <div className="flex justify-between items-center w-full px-12 py-6 max-w-[1920px] mx-auto">
        <Link
          href="/store"
          className="text-2xl font-black text-black font-headline tracking-tight uppercase hover:opacity-70 transition-opacity"
        >
          FOOTWEAR_MANIFESTO
        </Link>

        <div className="hidden md:flex gap-12 font-label tracking-tight uppercase">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={
                  isActive
                    ? "text-black border-b-2 border-black pb-1 font-bold transition-colors duration-200"
                    : "text-neutral-500 font-medium hover:text-black transition-colors duration-200"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleCart}
            className="relative text-black hover:opacity-70 transition-opacity"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {mounted && getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-label">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
