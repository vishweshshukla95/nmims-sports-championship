"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import BrandLogos from "@/components/ui/BrandLogos";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log complete error securely to server console without exposing internal details to visitor
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-navy text-text-main flex flex-col justify-between p-6 overflow-hidden">
      <NavyPatchBackground variant="calm" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between py-4">
        <BrandLogos size="md" href="/home" />
      </header>

      {/* Main Error Presentation */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-red-950/60 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-lg mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold mb-2">
          Championship System Notice
        </span>

        <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light">
          An Unexpected Error Occurred
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-[#AEB3D6] leading-relaxed">
          We encountered an issue loading this section of the tournament portal. Our system operators have been notified.
        </p>

        {error.digest && (
          <div className="mt-4 px-3 py-1.5 rounded-lg bg-[#161A40] border border-gold/20 text-[10px] font-mono text-gold/80">
            Reference Incident: {error.digest}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/home"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full btn-royal text-xs font-semibold tracking-wide flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-gold" />
            <span>Tournament Home</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-[#AEB3D6]/70 border-t border-[rgba(217,178,111,0.1)]">
        <p>© 2026 SVKM&apos;s NMIMS Sports Department · MPTP Shirpur Campus</p>
      </footer>
    </div>
  );
}
