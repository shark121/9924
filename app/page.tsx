"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ParticleLogo from "./components/ParticleLogo";
import CartDrawer from "./store/components/CartDrawer";
import { useCartStore } from "@/store/cartStore";

export default function Home() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const getCartCount = useCartStore((s) => s.getCartCount);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative h-[100svh] w-screen overflow-hidden bg-white">
      {/* Full-viewport particle canvas */}
      <ParticleLogo
        src={encodeURI("/logos/9924 logo 3 -black@4x.png")}
        sizeFactor={0.7}
        className="absolute inset-0 m-auto w-full h-full md:w-[850px] md:h-[850px] z-0"
      />

      {/* Navigation overlay */}
      <nav className="w-full p-6 sm:p-10 flex items-center justify-between z-20 absolute top-0 left-0 pointer-events-none">
        <Image
          src="/logos/9924 logo 1 -black@4x (1).png"
          alt="9924 Logotype"
          width={200}
          height={80}
          className="h-auto w-full max-w-[70px] drop-shadow-sm pointer-events-auto"
          priority
        />

        <div className="flex items-center gap-4 sm:gap-5">
          <a
            href="https://www.instagram.com/9924brand?igsh=MTZlbWhmamc5aHQycA%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-black hover:opacity-60 transition-opacity pointer-events-auto"
          >
            <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" aria-hidden>
              <path
                fill="currentColor"
                d="M23,0H9C4,0,0,4,0,9v6v8c0,5,4,9,9,9h14c5,0,9-4,9-9v-8V9C32,4,28,0,23,0z"
              />
              <circle fill="none" stroke="#ffffff" strokeWidth="2" cx="16" cy="16" r="8" />
              <circle fill="#ffffff" cx="25" cy="6" r="2" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@9924brand?_r=1&_t=ZT-96JrYwR4vaY"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-black hover:opacity-60 transition-opacity pointer-events-auto"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" aria-hidden>
              <path
                fill="currentColor"
                d="M19.4 6.7v2.7c-1.8 0-3.5-.6-4.8-1.5v7c0 3.5-2.8 6.3-6.3 6.3-1.4 0-2.6-.4-3.6-1.2 1.2 1.3 2.9 2 4.7 2 3.5 0 6.4-2.8 6.4-6.4V8.7c1.4 1 3 1.5 4.8 1.5v-3.4c-.4 0-.7 0-1 0z"
              />
              <path
                fill="currentColor"
                d="M14.6 14.8V7.8c1.4 1 3 1.5 4.8 1.5V6.7c-1-.2-1.9-.8-2.6-1.6-.7-.7-1.5-1.8-1.7-3.1H12.2v13.8c-.1 1.5-1.3 2.7-2.9 2.7-1 0-1.8-.5-2.4-1.2-.9-.5-1.5-1.5-1.5-2.6 0-1.6 1.3-2.9 2.9-2.9.3 0 .6.1.9.2V9.4c-3.4.1-6.2 2.9-6.2 6.3 0 1.7.6 3.2 1.7 4.3 1 .7 2.2 1.1 3.6 1.1 3.5 0 6.3-2.8 6.3-6.3z"
              />
            </svg>
          </a>
          <button
            onClick={toggleCart}
            className="relative hover:opacity-70 transition-opacity pointer-events-auto"
            aria-label="Shopping bag"
          >
          <Image
            src="/ghana-must-go-red.png"
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
        </div>
      </nav>

      {/* Enter Store overlay */}
      <div
        className="absolute bottom-20 sm:bottom-14 left-0 right-0 flex items-center justify-center z-20 pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          href="/store"
          className="text-sm sm:text-base font-black uppercase tracking-[0.25em] text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors pointer-events-auto"
        >
          Enter Store
        </Link>
      </div>

      <CartDrawer />
    </div>
  );
}
