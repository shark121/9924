import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "9924 — Admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await props.searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-2xl uppercase tracking-[0.3em] text-neutral-100">
            9924
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
            Admin Console
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
          <LoginForm from={from ?? "/admin"} />
        </div>
      </div>
    </main>
  );
}
