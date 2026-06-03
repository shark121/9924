import LegalLayout from "@/app/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact · 9924",
  description: "Reach 9924 and Ahyensode Creative Agency.",
};

export default function ContactPage() {
  return (
    <LegalLayout eyebrow="GET IN TOUCH" title="Contact">
      <p>
        Questions about an order, a release, or a collaboration? We&rsquo;d love to hear from
        you. 9924 is owned and operated by Ahyensode Creative Agency.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        <a
          href="mailto:shop9924brand@gmail.com"
          className="group block border border-black/10 hover:border-black transition-colors p-6 sm:p-8 bg-white"
        >
          <span className="font-label text-[10px] tracking-[0.25em] uppercase text-neutral-400 block mb-3">
            Email
          </span>
          <span className="font-headline font-bold text-base sm:text-lg uppercase tracking-tight text-primary group-hover:opacity-70 transition-opacity break-all">
            shop9924brand@gmail.com
          </span>
        </a>

        <a
          href="https://www.instagram.com/9924brand"
          target="_blank"
          rel="noopener noreferrer"
          className="group block border border-black/10 hover:border-black transition-colors p-6 sm:p-8 bg-white"
        >
          <span className="font-label text-[10px] tracking-[0.25em] uppercase text-neutral-400 block mb-3">
            Instagram
          </span>
          <span className="font-headline font-bold text-base sm:text-lg uppercase tracking-tight text-primary group-hover:opacity-70 transition-opacity">
            @9924brand
          </span>
        </a>

        <a
          href="https://www.tiktok.com/@9924brand"
          target="_blank"
          rel="noopener noreferrer"
          className="group block border border-black/10 hover:border-black transition-colors p-6 sm:p-8 bg-white"
        >
          <span className="font-label text-[10px] tracking-[0.25em] uppercase text-neutral-400 block mb-3">
            TikTok
          </span>
          <span className="font-headline font-bold text-base sm:text-lg uppercase tracking-tight text-primary group-hover:opacity-70 transition-opacity">
            @9924brand
          </span>
        </a>

        <div className="block border border-black/10 p-6 sm:p-8 bg-white">
          <span className="font-label text-[10px] tracking-[0.25em] uppercase text-neutral-400 block mb-3">
            Operated By
          </span>
          <span className="font-headline font-bold text-base sm:text-lg uppercase tracking-tight text-primary">
            Ahyensode Creative Agency
          </span>
        </div>
      </div>
    </LegalLayout>
  );
}
