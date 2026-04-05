import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Navigation */}
      <nav className="w-full p-6 sm:p-10 flex items-center justify-start z-20 absolute top-0 left-0">
        <Image
          src="/logos/9924 logo 1 -black@4x (1).png"
          alt="9924 Logotype"
          width={200}
          height={80}
          className="h-auto w-full max-w-[70px] drop-shadow-sm"
          priority
        />
      </nav>

      {/* Main Logo Container */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full p-8 sm:p-12 md:p-16">
        <Image
          src="/logos/9924 logo 3 -black@4x.png"
          alt="9924 Logo"
          width={800}
          height={800}
          /* Size doubled from 179px back to 358px. */
          className="w-full max-w-[358px] h-auto drop-shadow-sm mb-12"
          priority
        />

        <Link 
          href="/store"
          className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors"
        >
          Enter Store
        </Link>
      </div>
    </div>
  );
}
