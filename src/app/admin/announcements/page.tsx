"use client";

import React, { useState } from "react";
import { Megaphone, Plus, Trash2, Save, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminAnnouncementsPage() {
  const [tickerList, setTickerList] = useState([
    "Welcome to SVKM'S NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27 at MPTP Shirpur Campus!",
    "Teams must report on 26th October 2026 by 12:00 Noon. Complimentary travel pick-up available from railway stations and airports.",
    "Submit signed Eligibility Proforma and college ID on arrival at the accreditation desk.",
  ]);

  const [newText, setNewText] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      setTickerList([...tickerList, newText.trim()]);
      setNewText("");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleDelete = (index: number) => {
    setTickerList(tickerList.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Live Notices
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Announcement Ticker Manager
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Broadcast high-priority ticker notices across the top of the championship homepage.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Announcement ticker updated successfully!</span>
          </div>
        )}

        {/* Add Form */}
        <form
          onSubmit={handleAdd}
          className="p-6 rounded-3xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-4"
        >
          <div className="flex items-center gap-2 text-gold">
            <Megaphone className="w-5 h-5 text-gold-light" />
            <h3 className="font-serif font-bold text-sm text-gold-light uppercase">
              Add New Ticker Notice
            </h3>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Badminton tournament matches commence at 10:00 AM on Court 2..."
              className="flex-1 p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Current Active Tickers */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold">
            Active Ticker Notices ({tickerList.length})
          </h3>
          {tickerList.map((text, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gold">#{idx + 1}</span>
                <span className="text-xs text-[#F4EFE3] font-medium leading-relaxed">
                  {text}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                title="Remove notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
