"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAdminCampusDepartmentsAction,
  saveAdminCampusDepartmentAction,
  CampusDepartmentAdmin,
} from "@/app/actions/campuses";
import { Save, Edit3, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState<CampusDepartmentAdmin[]>([]);
  const [editingCampus, setEditingCampus] = useState<CampusDepartmentAdmin | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    const list = await getAdminCampusDepartmentsAction();
    setCampuses(list);
  };

  useEffect(() => {
    let ignore = false;
    getAdminCampusDepartmentsAction().then((list) => {
      if (!ignore) {
        setCampuses(list);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleEdit = (c: CampusDepartmentAdmin) => {
    setEditingCampus({ ...c });
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus) return;
    setErrorMessage(null);

    const total = Number(editingCampus.menCount) + Number(editingCampus.womenCount);
    const updated: CampusDepartmentAdmin = {
      ...editingCampus,
      menCount: Number(editingCampus.menCount),
      womenCount: Number(editingCampus.womenCount),
      totalCount: total,
      staffMen: Number(editingCampus.staffMen),
      staffWomen: Number(editingCampus.staffWomen),
      dayScholar: Number(editingCampus.dayScholar),
      hosteller: Number(editingCampus.hosteller),
    };

    const res = await saveAdminCampusDepartmentAction(updated);
    if (res?.error) {
      console.error("Failed to save campus department:", res.error);
      setErrorMessage(res.error);
      return;
    }

    await loadData();
    setEditingCampus(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Contingents & Officers
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Campus Departments Manager
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Manage contingent athlete counts, accompanying staff, sports officer contacts, and confidential accommodation stats.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Campus department data saved successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-400" />
            <span>Error saving campus: {errorMessage}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-300">Confidentiality Note:</span> Day Scholar and Hosteller accommodation numbers are private and visible <strong className="text-white">only</strong> in this Admin Portal. They are automatically stripped from public-facing contingent cards on <code className="text-gold">/campuses</code>.
          </div>
        </div>

        {/* Campuses Table */}
        <div className="overflow-x-auto rounded-2xl border border-[rgba(217,178,111,0.2)] bg-[#161A40]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(217,178,111,0.2)] bg-[#0F122E]/80 text-[11px] font-bold uppercase tracking-wider text-gold">
                <th className="p-4">Campus</th>
                <th className="p-4">Contingent (M / W / Tot)</th>
                <th className="p-4">Staff (M / W)</th>
                <th className="p-4 text-amber-300">Accommodation (Day / Host)</th>
                <th className="p-4">Sports Officer</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217,178,111,0.1)] text-xs">
              {campuses.map((c) => (
                <tr key={c.campusId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-serif font-bold text-[#F4EFE3]">
                    <div className="flex items-center gap-2">
                      <span>{c.name}</span>
                      {c.isHost && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/40">
                          HOST
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#AEB3D6]">{c.city}, {c.state}</span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="text-men font-bold">{c.menCount}M</span> /{" "}
                    <span className="text-women font-bold">{c.womenCount}W</span> /{" "}
                    <span className="text-gold font-bold">{c.totalCount} Total</span>
                  </td>
                  <td className="p-4 font-mono text-[#AEB3D6]">
                    <span>{c.staffMen}M</span> / <span>{c.staffWomen}W</span>
                  </td>
                  <td className="p-4 font-mono text-amber-200">
                    <span>{c.dayScholar} Day</span> / <span>{c.hosteller} Host</span>
                  </td>
                  <td className="p-4 text-[#AEB3D6]">
                    {c.officerName ? (
                      <div>
                        <div className="font-bold text-[#F4EFE3]">{c.officerName}</div>
                        <div className="text-[10px] text-gold font-mono">{c.officerPhone}</div>
                      </div>
                    ) : (
                      <span className="italic text-[#AEB3D6]/50">Not assigned</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingCampus && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border border-gold/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gold">Edit Campus Department</span>
                  <h3 className="text-xl font-serif font-bold text-gold-light">
                    {editingCampus.name} ({editingCampus.shortCode})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCampus(null)}
                  className="text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-5">
                {/* Athletes */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-2">
                    Athletes Contingent
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#AEB3D6] mb-1">Men Athletes</label>
                      <input
                        type="number"
                        min="0"
                        value={editingCampus.menCount}
                        onChange={(e) => setEditingCampus({ ...editingCampus, menCount: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#AEB3D6] mb-1">Women Athletes</label>
                      <input
                        type="number"
                        min="0"
                        value={editingCampus.womenCount}
                        onChange={(e) => setEditingCampus({ ...editingCampus, womenCount: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Staff */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-2">
                    Accompanying Staff
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#AEB3D6] mb-1">Staff Men</label>
                      <input
                        type="number"
                        min="0"
                        value={editingCampus.staffMen}
                        onChange={(e) => setEditingCampus({ ...editingCampus, staffMen: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#AEB3D6] mb-1">Staff Women</label>
                      <input
                        type="number"
                        min="0"
                        value={editingCampus.staffWomen}
                        onChange={(e) => setEditingCampus({ ...editingCampus, staffWomen: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Accommodation (Admin only) */}
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                    Accommodation Split (Admin Only)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-amber-200 mb-1">Day Scholars</label>
                      <input
                        type="number"
                        min="0"
                        value={editingCampus.dayScholar}
                        onChange={(e) => setEditingCampus({ ...editingCampus, dayScholar: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-amber-500/40 text-xs text-amber-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-amber-200 mb-1">Hostellers</label>
                      <input
                        type="number"
                        min="0"
                        value={editingCampus.hosteller}
                        onChange={(e) => setEditingCampus({ ...editingCampus, hosteller: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-amber-500/40 text-xs text-amber-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Sports Officer */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-2">
                    Sports Officer Contact
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#AEB3D6] mb-1">Officer Name</label>
                      <input
                        type="text"
                        value={editingCampus.officerName}
                        onChange={(e) => setEditingCampus({ ...editingCampus, officerName: e.target.value })}
                        placeholder="e.g. Prof. Rajesh Sharma"
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#AEB3D6] mb-1">Phone</label>
                        <input
                          type="text"
                          value={editingCampus.officerPhone}
                          onChange={(e) => setEditingCampus({ ...editingCampus, officerPhone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#AEB3D6] mb-1">Email</label>
                        <input
                          type="email"
                          value={editingCampus.officerEmail}
                          onChange={(e) => setEditingCampus({ ...editingCampus, officerEmail: e.target.value })}
                          placeholder="officer@nmims.edu"
                          className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                  <button
                    type="button"
                    onClick={() => setEditingCampus(null)}
                    className="px-5 py-2.5 rounded-full border border-gold/30 text-xs font-bold text-[#AEB3D6] hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
