"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, CheckCircle2, UserCheck, Shield, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { ContactPerson, LEADERSHIP_CONFIG, COMMITTEE_CONFIG } from "@/config/contacts";
import { getContactsAction, saveContactsAction } from "@/app/actions/contacts";

export default function AdminContactsPage() {
  const [leadership, setLeadership] = useState<ContactPerson>(LEADERSHIP_CONFIG);
  const [committee, setCommittee] = useState<ContactPerson[]>(COMMITTEE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getContactsAction()
      .then((list) => {
        if (!ignore) {
          const lead = list.find((c) => c.group === "leadership");
          if (lead) setLeadership(lead);
          const comm = list.filter((c) => c.group === "committee");
          if (comm.length > 0) setCommittee(comm);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Failed to load contacts:", err);
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
      const res = await saveContactsAction([leadership, ...committee]);
      if (res?.error) {
        console.error("Failed to save contacts:", res.error);
        setErrorMessage(res.error);
        return;
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save contacts.";
      console.error("Failed to save contacts exception:", err);
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCommitteeMember = () => {
    const newMember: ContactPerson = {
      name: "New Committee Member",
      role: "Sports Council Member, MPTP Shirpur Campus",
      phone: "+91 00000 00000",
      cleanPhone: "910000000000",
      group: "committee",
    };
    setCommittee([...committee, newMember]);
  };

  const handleDeleteCommitteeMember = (index: number) => {
    if (!confirm("Are you sure you want to remove this committee member?")) return;
    setCommittee(committee.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Personnel Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Contacts & Leadership Editor
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Edit Sports Leadership and Organising Committee members synced directly to Supabase <code className="text-gold">contacts</code> table.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm min-h-[44px] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving..." : "Save All Contacts"}</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Contacts saved to Supabase contacts table successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-400" />
            <span>Error saving contacts: {errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gold">
            Loading contacts from Supabase...
          </div>
        ) : (
          <>
            {/* Section 1: Leadership Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gold">
                <Shield className="w-4 h-4 text-gold-light" />
                <h3 className="font-serif font-bold text-sm text-gold-light uppercase tracking-wider">
                  Sports Leadership (Single Card · No Phone Number)
                </h3>
              </div>

              <div className="p-6 rounded-2xl bg-[#161A40] border border-gold/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                    Director Name
                  </label>
                  <input
                    type="text"
                    value={leadership.name}
                    onChange={(e) => setLeadership({ ...leadership, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    value={leadership.role}
                    onChange={(e) => setLeadership({ ...leadership, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#AEB3D6]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Organising Committee */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold">
                  <UserCheck className="w-4 h-4 text-gold-light" />
                  <h3 className="font-serif font-bold text-sm text-gold-light uppercase tracking-wider">
                    Organising Committee ({committee.length} Members · Call & WhatsApp Enabled)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddCommitteeMember}
                  className="px-4 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="space-y-3">
                {committee.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Member Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => {
                          const copy = [...committee];
                          copy[idx].name = e.target.value;
                          setCommittee(copy);
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Championship Role
                      </label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => {
                          const copy = [...committee];
                          copy[idx].role = e.target.value;
                          setCommittee(copy);
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#AEB3D6]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={member.phone || ""}
                          onChange={(e) => {
                            const copy = [...committee];
                            copy[idx].phone = e.target.value;
                            copy[idx].cleanPhone = e.target.value.replace(/[^0-9]/g, "");
                            setCommittee(copy);
                          }}
                          className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCommitteeMember(idx)}
                        className="mt-5 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
