"use client";

import React from "react";
import { Archive, Plus, Clock, Trophy } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminArchivePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Historical Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Previous Edition Archive (2025-26)
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Add past results, previous champions, and historical statistics keyed by edition = &apos;2025-26&apos;.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert("Archive records entry is ready for past tournament data.")}
            className="px-5 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Archived Record</span>
          </button>
        </div>

        <div className="p-12 rounded-3xl bg-[#161A40] border-2 border-dashed border-gold/30 text-center max-w-xl mx-auto space-y-3">
          <Archive className="w-12 h-12 text-gold mx-auto stroke-1" />
          <h3 className="text-lg font-serif font-bold text-gold-light">
            Archive Database Ready
          </h3>
          <p className="text-xs text-[#AEB3D6] leading-relaxed">
            The archive tables in PostgreSQL are prepared for edition 2025-26. Records added here will automatically populate the public /previous-edition dashboard.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
