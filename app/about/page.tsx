import LegalLayout from "@/app/components/LegalLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About 9924",
  description:
    "9924 is a contemporary lifestyle brand shaped through timeless style, movement and identity. Operated by Ahyensode Creative Agency.",
};

const pillars = [
  {
    title: "Character",
    body: "Clothing designed to reflect individuality, presence and quiet confidence.",
  },
  {
    title: "Quality",
    body: "Timeless essentials crafted with attention to detail, longevity and everyday wear.",
  },
  {
    title: "Evolution",
    body: "A brand shaped through movement, creativity, and continuous growth, each release building on the last.",
  },
];

export default function AboutPage() {
  return (
    <LegalLayout eyebrow="THE BRAND" title="About 9924">
      <p>
        9924 is a contemporary lifestyle brand shaped through timeless style,
        movement and identity. Built around the idea that presence is carried,
        not announced, the brand explores clothing as an extension of character,
        refined essentials designed to move naturally across generations,
        places and everyday life.
      </p>

      <p>
        Positioned above the 9924 identity is the Baker Boy cap, a symbol of
        individuality, confidence and quiet distinction. Inspired by the
        effortless elegance and presence carried by generations before us, the
        cap represents those who wear their world with intention.
      </p>

      <p>
        Blending contemporary sportswear, classic influence and cultural
        storytelling, 9924 creates pieces designed without limits, timeless
        clothing for individuals drawn to expression, sophistication and
        movement. More than fashion, 9924 is an evolving world shaped through
        design, storytelling and purpose.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6">
        {pillars.map((pillar, index) => (
          <div
            key={pillar.title}
            className="border border-black/10 p-6 sm:p-8 bg-white"
          >
            <span className="font-label text-[10px] tracking-[0.25em] uppercase text-neutral-400 block mb-3">
              {String(index + 1).padStart(2, "0")} / Principle
            </span>
            <h2 className="font-headline font-black text-lg sm:text-xl uppercase tracking-tight text-primary mb-3">
              {pillar.title}
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-black/5">
        <span className="font-label text-[10px] tracking-[0.25em] uppercase text-neutral-400 block mb-3">
          Operated By
        </span>
        <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tight text-primary mb-4">
          Ahyensode Creative Agency
        </h2>
        <p>
          9924 is developed and directed by Ahyensode Creative Agency, a
          creative studio focused on building thoughtful brands, products and
          visual worlds through design and storytelling.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 pt-6">
        <Link
          href="/store"
          className="bg-primary text-on-primary px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-headline font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
        >
          Shop Now
        </Link>
        <Link
          href="/collections"
          className="border border-black text-black px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-headline font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
        >
          Explore Collection
        </Link>
        <Link
          href="/contact"
          className="border border-black/20 text-black px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-headline font-bold uppercase tracking-widest hover:border-black transition-colors"
        >
          Get in Touch
        </Link>
      </div>
    </LegalLayout>
  );
}
