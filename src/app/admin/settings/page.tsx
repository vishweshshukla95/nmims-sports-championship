"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Save,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  History,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { TOURNAMENT_CONFIG } from "@/config/tournament";
import { clearDemoMatches } from "@/lib/tournament-store";

export default function AdminSettingsPage() {
  const [venue, setVenue] = useState(TOURNAMENT_CONFIG.venueAddress);
  const [reporting, setReporting] = useState(TOURNAMENT_CONFIG.reportingText);
  const [instagram, setInstagram] = useState(TOURNAMENT_CONFIG.instagramHandle);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearDemoData = () => {
    if (
      confirm(
        "Are you sure you want to clear all demo data? This action is reserved for super_admin."
      )
    ) {
      clearDemoMatches();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Configuration & Audit
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Tournament Settings
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Edit venue address, reporting deadline, social handles, and system logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/settings/audit"
              className="px-4 py-2.5 rounded-full btn-royal text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px]"
            >
              <History className="w-4 h-4 text-gold" />
              <span>Audit Log</span>
            </Link>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tournament settings updated successfully!</span>
          </div>
        )}

        {clearSuccess && (
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Demo match data purged. Real fixtures ready for entry.</span>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-3xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AEB3D6] mb-1.5">
              Official Venue Address
            </label>
            <textarea
              rows={4}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono leading-relaxed focus:outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#AEB3D6] mb-1.5">
                Reporting Deadline Text
              </label>
              <input
                type="text"
                value={reporting}
                onChange={(e) => setReporting(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#AEB3D6] mb-1.5">
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Super Admin Zone: Clear Demo Data */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-950/20 border border-red-500/30 space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base uppercase">
              Super Admin Danger Zone
            </h3>
          </div>
          <p className="text-xs text-[#AEB3D6] leading-relaxed">
            Clicking &quot;Clear Demo Data&quot; permanently removes all test fixtures and records marked with is_demo = true.
          </p>
          <button
            type="button"
            onClick={handleClearDemoData}
            className="px-6 py-2.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Demo Data</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
