"use client";

import React, { useState } from "react";
import { Phone, Save, Plus, Trash2, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { CONTACTS_CONFIG } from "@/config/contacts";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState(CONTACTS_CONFIG);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
              Contacts Editor
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Edit Sports Director and Organising Committee phone numbers and details.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Save Contacts</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Contacts updated successfully across the website!</span>
          </div>
        )}

        <div className="space-y-4">
          {contacts.map((contact, idx) => (
            <div
              key={contact.name}
              className="p-6 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
            >
              <div>
                <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => {
                    const copy = [...contacts];
                    copy[idx].name = e.target.value;
                    setContacts(copy);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) => {
                    const copy = [...contacts];
                    copy[idx].role = e.target.value;
                    setContacts(copy);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#AEB3D6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => {
                    const copy = [...contacts];
                    copy[idx].phone = e.target.value;
                    setContacts(copy);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
