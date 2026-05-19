import Image from "next/image";
import Link from "next/link";
import ParticleLogo from "./components/ParticleLogo";

export default function Home() {
  return (
    <div className="relative h-[100svh] w-screen overflow-hidden bg-white">
      {/* Full-viewport particle canvas */}
      <ParticleLogo
        src={encodeURI("/logos/9924 logo 3 -black@4x.png")}
        sizeFactor={0.7}
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Navigation overlay */}
      <nav className="w-full p-6 sm:p-10 flex items-center justify-start z-20 absolute top-0 left-0 pointer-events-none">
        <Image
          src="/logos/9924 logo 1 -black@4x (1).png"
          alt="9924 Logotype"
          width={200}
          height={80}
          className="h-auto w-full max-w-[70px] drop-shadow-sm pointer-events-auto"
          priority
        />
      </nav>

      {/* Enter Store overlay */}
      <div
        className="absolute bottom-20 sm:bottom-14 left-0 right-0 flex items-center justify-center z-20 pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          href="/store"
          className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors pointer-events-auto"
        >
          Enter Store
        </Link>
      </div>
    </div>
  );
}
