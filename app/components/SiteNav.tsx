"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-neutral-50 fixed top-0 z-50 w-full">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 py-4 md:py-6 max-w-[1920px] mx-auto">
        <Link
          href="/store"
          className="text-base sm:text-lg md:text-2xl font-black text-black font-headline tracking-tight uppercase hover:opacity-70 transition-opacity"
        >
          FOOTWEAR MANIFESTO
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

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={toggleCart}
            className="relative hover:opacity-70 transition-opacity"
            aria-label="Shopping bag"
          >
            <Image
              src="/ghana-must-go.png"
              alt=""
              width={48}
              height={48}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              priority
            />
            {mounted && getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-label">
                {getCartCount()}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden text-black hover:opacity-70 transition-opacity"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-black/5 bg-neutral-50">
          <div className="flex flex-col px-4 sm:px-6 py-4 gap-1 font-label tracking-tight uppercase">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={
                    isActive
                      ? "text-black font-bold py-3 border-b border-black/10 text-sm"
                      : "text-neutral-500 font-medium hover:text-black transition-colors py-3 border-b border-black/10 text-sm"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
