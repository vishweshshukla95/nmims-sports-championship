import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import BrandLogos from "@/components/ui/BrandLogos";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-navy text-text-main flex flex-col justify-between p-6 overflow-hidden">
      <NavyPatchBackground variant="calm" />

      {/* Header with Brand Logos */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between py-4">
        <BrandLogos size="md" href="/home" />
      </header>

      {/* Centre Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-[#161A40] border-2 border-gold/40 flex items-center justify-center text-gold shadow-gold-glow mb-6 animate-pulse">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold mb-2">
          Error 404 · Fixture Not Located
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-black uppercase text-gold-light">
          Page Not Found
        </h1>

        <p className="mt-4 text-sm text-[#AEB3D6] leading-relaxed">
          The sports championship page, fixture, or document you requested does not exist or has been relocated.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/home"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Championship Home</span>
          </Link>
          <Link
            href="/sports"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full btn-royal text-xs font-semibold tracking-wide flex items-center justify-center"
          >
            <span>Explore Disciplines</span>
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
