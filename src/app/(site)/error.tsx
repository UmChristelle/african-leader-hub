"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "Site render error:",
      error?.name,
      error?.message,
      error?.digest ?? ""
    );
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf8] px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513]">
        African Leaders Hub
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        We hit a temporary problem
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-stone-600">
        This page could not be loaded right now. Please try again in a moment.
        If the problem continues, contact us at africanleadershub@gmail.com.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#8B4513] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6f3610]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[#8B4513] px-6 py-2.5 text-sm font-semibold text-[#8B4513] transition hover:bg-[#f6efe8]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}