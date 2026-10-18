"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface AdminUser {
  id?: string;
  email: string;
  role: string;
  sports?: string[];
  created_at?: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchAdmins = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch admins");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load admin users.";
      console.error("fetchAdmins error:", err);
      setFeedback({ type: "error", message });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/users")
      .then(async (res) => {
        if (!ignore) {
          if (res.ok) {
            const data = await res.json();
            setAdmins(data.admins || []);
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("fetchAdmins initial error:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    try {
      setCreating(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin user.");
      }

      setFeedback({
        type: "success",
        message: `Admin user ${newEmail} created in Supabase Auth & admins directory with temporary password.`,
      });

      setShowAddModal(false);
      setNewEmail("");
      setNewPassword("");
      await fetchAdmins(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create admin user.";
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke admin credentials for ${email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete admin");
      }

      setFeedback({
        type: "success",
        message: `Admin access revoked for ${email} from Supabase admins table.`,
      });
      await fetchAdmins(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete admin user.";
      setFeedback({
        type: "error",
        message,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Security & Access Control
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Admin Users Directory
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Provision and manage admin accounts with temporary credentials in Supabase Auth & verified via the database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin User</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                : "bg-red-950/60 border-red-500/50 text-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Security notice */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#AEB3D6] leading-relaxed">
            <span className="font-bold text-gold-light">Access Rule:</span> Only authenticated emails listed in the <code className="text-gold">admins</code> table in Supabase can access any <code className="text-gold">/admin/*</code> dashboard routes. Users not present here are strictly blocked by middleware.
          </div>
        </div>

        {/* Admins Table */}
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gold">
            Loading admin users from Supabase...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[rgba(217,178,111,0.2)] bg-[#161A40]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(217,178,111,0.2)] bg-[#0F122E]/80 text-[11px] font-bold uppercase tracking-wider text-gold">
                  <th className="p-4">Admin Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Sports</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(217,178,111,0.1)] text-xs">
                {admins.map((admin) => (
                  <tr key={admin.email} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#F4EFE3]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
                        <span>{admin.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          admin.role === "super_admin"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="p-4 text-[#AEB3D6]">
                      <div className="flex flex-wrap gap-1">
                        {(admin.sports || ["All"]).map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 rounded bg-[#0F122E] border border-gold/20 text-[10px] font-mono text-gold-light"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {admin.email !== "sports.shirpur@nmims.edu" ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(admin.email)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-text-muted italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gold">Provision Credentials</span>
                  <h3 className="text-xl font-serif font-bold text-gold-light">
                    Add New Admin
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. convenor@nmims.edu"
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                    />
                    <KeyRound className="w-4 h-4 text-gold absolute right-3 top-3 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-[#AEB3D6]/70 mt-1 block">
                    The admin can sign in immediately using this password at /admin/login.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                    Admin Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    <option value="admin">Admin (Scorekeeper / Results Editor)</option>
                    <option value="super_admin">Super Admin (Full Tournament Controller)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-full border border-gold/30 text-xs font-bold text-[#AEB3D6] hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>{creating ? "Provisioning..." : "Create Account"}</span>
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
