import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
};

export default function LegalLayout({ eyebrow, title, updated, children }: Props) {
  return (
    <div className="bg-[#f9f9f9] font-body text-on-surface antialiased min-h-screen">
      <SiteNav />

      <main className="pt-24 md:pt-32 px-4 sm:px-6 md:px-12 max-w-[1100px] mx-auto pb-20 md:pb-32">
        <header className="mb-12 md:mb-20 border-b border-black/5 pb-8 md:pb-12">
          <span className="font-label text-[10px] sm:text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3 sm:mb-4 block">
            {eyebrow}
          </span>
          <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase text-primary">
            {title}
          </h1>
          {updated && (
            <p className="font-label text-[10px] sm:text-xs tracking-widest uppercase text-neutral-400 mt-6">
              Last Updated: {updated}
            </p>
          )}
        </header>

        <article className="legal-body max-w-3xl font-body text-on-surface-variant text-sm sm:text-base leading-relaxed space-y-8">
          {children}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
