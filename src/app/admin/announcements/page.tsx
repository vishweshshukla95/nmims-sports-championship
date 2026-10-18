"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Edit3, CheckCircle2, AlertCircle, Clock, Calendar, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAnnouncementsAction,
  saveAnnouncementAction,
  deleteAnnouncementAction,
  AnnouncementItem,
} from "@/app/actions/announcements";

export default function AdminAnnouncementsPage() {
  const [tickerList, setTickerList] = useState<AnnouncementItem[]>([]);
  const [content, setContent] = useState("");
  const [startTime, setStartTime] = useState("2026-10-26T09:00");
  const [endTime, setEndTime] = useState("2026-10-31T20:00");
  const [priority, setPriority] = useState(1);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAnnouncements = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const list = await getAnnouncementsAction();
      setTickerList(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load announcements";
      console.error("Failed to load announcements:", err);
      showToast(message, "error");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getAnnouncementsAction()
      .then((list) => {
        if (!ignore) {
          setTickerList(list);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : "Failed to load announcements";
          console.error("Failed to load announcements:", err);
          showToast(message, "error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSaving(true);
      const newItem: AnnouncementItem = {
        id: "",
        content: content.trim(),
        startTime,
        endTime,
        priority,
      };

      const res = await saveAnnouncementAction(newItem);
      if (res?.error) {
        console.error("Failed to add announcement:", res.error);
        showToast(res.error, "error");
        return;
      }

      setContent("");
      showToast("Announcement ticker saved successfully!", "success");
      await loadAnnouncements(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add announcement";
      console.error("Failed to add announcement exception:", err);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      const res = await saveAnnouncementAction(editingItem);
      if (res?.error) {
        console.error("Failed to edit announcement:", res.error);
        showToast(res.error, "error");
        return;
      }

      setEditingItem(null);
      showToast("Announcement updated successfully!", "success");
      await loadAnnouncements(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to edit announcement";
      console.error("Failed to edit announcement exception:", err);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this announcement ticker?")) return;
    try {
      const res = await deleteAnnouncementAction(id);
      if (res?.error) {
        console.error("Failed to delete announcement:", res.error);
        showToast(res.error, "error");
        return;
      }
      showToast("Announcement removed successfully!", "success");
      await loadAnnouncements(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete announcement";
      console.error("Failed to delete announcement exception:", err);
      showToast(message, "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 text-xs font-bold animate-fadeIn ${
              toast.type === "success"
                ? "bg-emerald-950 border-emerald-500 text-emerald-200"
                : "bg-red-950 border-red-500 text-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toast.message}</span>
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

          <div>
            <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
              Ticker Message Content *
            </label>
            <input
              type="text"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Badminton tournament matches commence at 10:00 AM on Court 2..."
              className="w-full p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold" />
                <span>Start Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span>End Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
              >
                <option value={1}>High Priority (1)</option>
                <option value={2}>Standard Priority (2)</option>
                <option value={3}>Low Priority (3)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{saving ? "Adding..." : "Add Notice"}</span>
            </button>
          </div>
        </form>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gold">
            Loading announcements from Supabase...
          </div>
        ) : (
          /* Current Active Tickers */
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold">
              Active Ticker Notices ({tickerList.length})
            </h3>
            <div className="space-y-3">
              {tickerList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-mono text-xs text-gold mt-0.5">#{idx + 1}</span>
                    <div>
                      <div className="text-xs text-[#F4EFE3] font-medium leading-relaxed">
                        {item.content}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-mono text-[#AEB3D6]">
                        <span>Start: {item.startTime.replace("T", " ")}</span>
                        <span>•</span>
                        <span>End: {item.endTime.replace("T", " ")}</span>
                        <span>•</span>
                        <span className="text-gold">Priority: {item.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...item })}
                      className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border border-gold/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-6">
                <h3 className="text-xl font-serif font-bold text-gold-light">
                  Edit Ticker Notice
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                    Message Content
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingItem.content}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingItem.startTime}
                      onChange={(e) => setEditingItem({ ...editingItem, startTime: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingItem.endTime}
                      onChange={(e) => setEditingItem({ ...editingItem, endTime: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-5 py-2.5 rounded-full border border-gold/30 text-xs font-bold text-[#AEB3D6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider"
                  >
                    Save Changes
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
