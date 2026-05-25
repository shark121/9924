import Link from "next/link";
import Image from "next/image";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/9924brand?igsh=MTZlbWhmamc5aHQycA%3D%3D&utm_source=qr",
    svg: (
      <svg viewBox="0 0 32 32" className="w-4 h-4" aria-hidden>
        <path
          fill="currentColor"
          d="M23,0H9C4,0,0,4,0,9v6v8c0,5,4,9,9,9h14c5,0,9-4,9-9v-8V9C32,4,28,0,23,0z"
        />
        <circle fill="none" stroke="#f5f5f5" strokeWidth="2" cx="16" cy="16" r="8" />
        <circle fill="#f5f5f5" cx="25" cy="6" r="2" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@9924brand?_r=1&_t=ZT-96JrYwR4vaY",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
        <path
          fill="currentColor"
          d="M19.4 6.7v2.7c-1.8 0-3.5-.6-4.8-1.5v7c0 3.5-2.8 6.3-6.3 6.3-1.4 0-2.6-.4-3.6-1.2 1.2 1.3 2.9 2 4.7 2 3.5 0 6.4-2.8 6.4-6.4V8.7c1.4 1 3 1.5 4.8 1.5v-3.4c-.4 0-.7 0-1 0z"
        />
        <path
          fill="currentColor"
          d="M14.6 14.8V7.8c1.4 1 3 1.5 4.8 1.5V6.7c-1-.2-1.9-.8-2.6-1.6-.7-.7-1.5-1.8-1.7-3.1H12.2v13.8c-.1 1.5-1.3 2.7-2.9 2.7-1 0-1.8-.5-2.4-1.2-.9-.5-1.5-1.5-1.5-2.6 0-1.6 1.3-2.9 2.9-2.9.3 0 .6.1.9.2V9.4c-3.4.1-6.2 2.9-6.2 6.3 0 1.7.6 3.2 1.7 4.3 1 .7 2.2 1.1 3.6 1.1 3.5 0 6.3-2.8 6.3-6.3z"
        />
      </svg>
    ),
  },
];

const LINKS: { label: string; href: string }[] = [
  { label: "TERMS", href: "/terms" },
  { label: "SHIPPING", href: "/shipping" },
  { label: "PRIVACY", href: "/privacy" },
  { label: "CONTACT", href: "/contact" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-neutral-100 py-10 md:py-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 px-4 sm:px-6 md:px-12 w-full max-w-[1920px] mx-auto text-center md:text-left">
        <Link href="/" aria-label="9924" className="block hover:opacity-70 transition-opacity">
          <Image
            src="/logos/9924 logo 1 -black@4x (1).png"
            alt="9924"
            width={200}
            height={80}
            className="h-auto w-auto max-w-[50px] sm:max-w-[60px] md:max-w-[70px]"
          />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 font-label text-[10px] tracking-widest uppercase">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-neutral-400 hover:text-black transition-all"
            >
              {link.label}
            </Link>
          ))}
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-neutral-400 hover:text-black transition-colors"
            >
              {s.svg}
            </a>
          ))}
        </div>
        <div className="font-label text-[10px] tracking-widest uppercase text-neutral-400 text-center md:text-right md:max-w-[280px] leading-relaxed">
          © 2026 9924. OPERATED BY AHYENSODE CREATIVE AGENCY. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
