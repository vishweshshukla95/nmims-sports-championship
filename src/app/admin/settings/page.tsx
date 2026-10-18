"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Trash2,
  Plus,
  ShieldAlert,
  CheckCircle2,
  History,
  HelpCircle,
  MapPin,
  Clock,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { TOURNAMENT_CONFIG } from "@/config/tournament";
import { FAQItem } from "@/components/ui/FAQAccordion";
import { clearDemoMatches } from "@/lib/tournament-store";
import { getSiteSettingsAction, saveSiteSettingsAction } from "@/app/actions/settings";

export default function AdminSettingsPage() {
  const [venue, setVenue] = useState(TOURNAMENT_CONFIG.venueAddress);
  const [reporting, setReporting] = useState(TOURNAMENT_CONFIG.reportingText);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getSiteSettingsAction()
      .then((data) => {
        if (!ignore) {
          setVenue(data.venue);
          setReporting(data.reporting);
          setFaqs(data.faqs);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Failed to load settings:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      const res = await saveSiteSettingsAction({ venue, reporting, faqs });
      if (res?.error) {
        console.error("Failed to save settings:", res.error);
        setErrorMessage(res.error);
        return;
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings.";
      console.error("Failed to save settings exception:", err);
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      {
        question: "New Championship Question?",
        answer: "Enter detailed response and guidance here.",
      },
    ]);
  };

  const handleDeleteFaq = (index: number) => {
    if (!confirm("Are you sure you want to remove this FAQ item?")) return;
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleClearDemoData = async () => {
    if (
      confirm(
        "Are you sure you want to clear all demo data? This action is reserved for super_admin."
      )
    ) {
      await clearDemoMatches();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3500);
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
              Edit venue address, reporting deadline, and championship FAQs stored securely in Supabase <code className="text-gold">site_config</code>.
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
              disabled={saving}
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tournament settings and FAQs saved to Supabase site_config successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-400" />
            <span>Error saving settings: {errorMessage}</span>
          </div>
        )}

        {clearSuccess && (
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Demo match data purged. Real fixtures ready for entry.</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gold font-mono text-xs">
            Loading settings from Supabase site_config...
          </div>
        ) : (
          <>
            {/* Venue & Reporting Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-6">
              <div className="flex items-center gap-2 text-gold">
                <MapPin className="w-5 h-5 text-gold-light" />
                <h3 className="font-serif font-bold text-sm text-gold-light uppercase tracking-wider">
                  Venue & Reporting Logistics
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#AEB3D6] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    <span>Official Venue Address</span>
                  </label>
                  <textarea
                    rows={4}
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono leading-relaxed focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#AEB3D6] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>Reporting Deadline & Protocol</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reporting}
                    onChange={(e) => setReporting(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono leading-relaxed focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Management */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold">
                  <HelpCircle className="w-5 h-5 text-gold-light" />
                  <h3 className="font-serif font-bold text-sm text-gold-light uppercase tracking-wider">
                    Frequently Asked Questions ({faqs.length} Items)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-4 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-gold">Question #{idx + 1}</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const copy = [...faqs];
                              copy[idx].question = e.target.value;
                              setFaqs(copy);
                            }}
                            className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-xs text-[#F4EFE3] font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#AEB3D6]">Answer</label>
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const copy = [...faqs];
                              copy[idx].answer = e.target.value;
                              setFaqs(copy);
                            }}
                            className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-xs text-[#AEB3D6]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(idx)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors mt-4"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-200">Reset Demo Matches</h4>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    Clears all pre-seeded mock matches and begins fresh with real live championship fixtures.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearDemoData}
                className="px-5 py-2.5 rounded-full bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 flex-shrink-0 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Purge Demo Fixtures</span>
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
