"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "Admin render error:",
      error?.name,
      error?.message,
      error?.digest ?? ""
    );
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        We hit a temporary problem
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
        This page could not be loaded right now. Please try again. If it keeps
        happening, the database may be temporarily unavailable.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-[#8B4513] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6f3610]"
      >
        Try again
      </button>
    </div>
  );
}