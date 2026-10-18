"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global critical error boundary triggered:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0F122E] text-[#F4EFE3] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-red-950/60 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-lg mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D9B26F] mb-2">
          Critical System Alert
        </span>

        <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#F0D38F]">
          SVKM&apos;s NMIMS Sports Championship
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-[#AEB3D6] max-w-md leading-relaxed">
          A critical system error occurred while processing your request. Please retry or contact tournament coordinators.
        </p>

        {error.digest && (
          <div className="mt-4 px-3 py-1.5 rounded-lg bg-[#161A40] border border-[#D9B26F]/20 text-[10px] font-mono text-[#D9B26F]">
            Reference: {error.digest}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-full bg-[#D9B26F] hover:bg-[#F0D38F] text-[#0F122E] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-[#1E3FA8] hover:bg-[#254ED0] text-white text-xs font-semibold tracking-wide flex items-center gap-2 transition-colors"
          >
            <span>Home Portal</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
