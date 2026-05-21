import LegalLayout from "@/app/components/LegalLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — 9924",
  description:
    "9924 is a modern lifestyle brand built around timeless style, confidence, and everyday expression. Operated by Ahyensode Creative Agency.",
};

const pillars = [
  {
    title: "Individuality",
    body: "Garments designed for people who move with purpose. No uniform — a wardrobe shaped around the wearer.",
  },
  {
    title: "Quality",
    body: "Elevated essentials cut from considered materials. Made to last past the season.",
  },
  {
    title: "Growth",
    body: "A brand that evolves with its community. Each release marks a step forward, not a repeat.",
  },
];

export default function AboutPage() {
  return (
    <LegalLayout eyebrow="THE BRAND" title="About 9924">
      <p className="font-headline text-xl sm:text-2xl md:text-3xl leading-tight tracking-tight text-primary uppercase font-bold">
        Streetwear, creativity, and lifestyle designed to move differently.
      </p>

      <p>
        9924 is a modern lifestyle brand built around timeless style, confidence,
        and everyday expression. Inspired by culture, creativity, and ambition,
        the brand blends elevated essentials with a refined identity designed for
        people who move with purpose.
      </p>

      <p>
        More than fashion, 9924 represents a lifestyle rooted in individuality,
        quality, and growth — pieces that hold their own season after season, in
        a wardrobe that grows with you.
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
          9924 is owned and operated by Ahyensode Creative Agency — a creative
          studio building brands, products, and stories with intent. From
          concept and direction to launch, every detail of 9924 is shaped in
          house.
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
