"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import { TOURNAMENT_CONFIG } from "@/config/tournament";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Standard admin credentials or demo fallback
    if (email && password) {
      // Store session
      localStorage.setItem(
        "nmims_admin_session",
        JSON.stringify({
          email,
          role: "super_admin",
          timestamp: new Date().toISOString(),
        })
      );
      router.push("/admin");
    } else {
      setError("Please provide both email and password.");
      setLoading(false);
    }
  };

  return (
    <NavyPatchBackground variant="full" className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#161A40]/90 backdrop-blur-md border-2 border-gold/40 shadow-2xl relative">
        {/* NMIMS White Logo centered */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-14 w-44 mb-3">
            <Image
              src="/images/nmims-logo-white.webp"
              alt="NMIMS Crest"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold">
            Administration Portal
          </span>
          <h1 className="text-xl font-serif font-black uppercase text-gold-light text-center mt-1">
            {TOURNAMENT_CONFIG.shortName}
          </h1>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nmims.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F122E] border border-gold/30 text-sm text-[#F4EFE3] placeholder-gray-500 focus:outline-none focus:border-gold min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F122E] border border-gold/30 text-sm text-[#F4EFE3] placeholder-gray-500 focus:outline-none focus:border-gold min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Admin Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[rgba(217,178,111,0.15)] text-center text-xs text-[#AEB3D6]">
          Protected route · SVKM&apos;s NMIMS Sports Department
        </div>
      </div>
    </NavyPatchBackground>
  );
}
