"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import BrandLogos from "@/components/ui/BrandLogos";

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0) return;

    if (!isSupabaseConfigured) {
      setError("Admin login is not configured on this server. Please contact the site administrator.");
      return;
    }

    setLoading(true);
    setError("");

    const cleanEmail = email.toLowerCase().trim();

    try {
      const supabase = createClient();

      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError || !authData.user) {
        handleFailedAttempt();
        return;
      }

      // 2. Query admins table in Supabase for user's email
      const { data: adminRecord, error: adminErr } = await supabase
        .from("admins")
        .select("email, role")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (adminErr || !adminRecord) {
        // User not authorized in admin directory: sign out immediately
        await supabase.auth.signOut();
        handleFailedAttempt();
        return;
      }

      // 3. Authorized admin: redirect directly to /admin
      setFailedAttempts(0);
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      console.error("Login unexpected error:", err);
      handleFailedAttempt();
    }
  };

  const handleFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    setLoading(false);

    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      setCooldownRemaining(COOLDOWN_SECONDS);
      setError(`Too many failed attempts. Please wait ${COOLDOWN_SECONDS} seconds before trying again.`);
    } else {
      // Generic error message without revealing account existence
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="relative min-h-screen bg-navy flex items-center justify-center p-4">
      <NavyPatchBackground />

      {/* Back to Starting Page Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-xs font-mono font-bold text-gold hover:text-gold-light flex items-center gap-1.5 transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Championship Portal</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        {/* Logos Header: BrandLogos size="lg" (96x96) */}
        <div className="w-full max-w-xs mx-auto mb-8">
          <BrandLogos size="lg" href="/" />
        </div>

        {/* Login Card */}
        <div className="card-championship p-8 relative overflow-hidden backdrop-blur-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0F122E] border border-gold/40 flex items-center justify-center shadow-gold-glow">
              <ShieldCheck className="w-7 h-7 text-gold-light" />
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold">
              Organisers Portal
            </span>
            <h1 className="text-2xl font-serif font-black uppercase text-gold-light mt-1">
              Admin Login
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-1">
              Enter your credentials to manage tournament fixtures, scores and standings.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-semibold animate-fadeIn flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {cooldownRemaining > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-mono text-center animate-fadeIn">
              Rate limit active: retry in {cooldownRemaining}s
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase tracking-wider mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={cooldownRemaining > 0 || loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nmims.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] placeholder-gray-500 focus:outline-none focus:border-gold font-mono disabled:opacity-50"
                />
                <Mail className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  disabled={cooldownRemaining > 0 || loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] placeholder-gray-500 focus:outline-none focus:border-gold font-mono disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cooldownRemaining > 0}
              className="w-full py-3.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow mt-6 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : cooldownRemaining > 0 ? (
                <span>Locked ({cooldownRemaining}s)</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-6 border-t border-[rgba(217,178,111,0.15)] text-center">
            <span className="text-[10px] text-text-muted">
              Access is strictly restricted to designated sports committee members and administrators.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
