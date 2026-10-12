"use client";

import React, { useState } from "react";
import Link from "next/link";
import { History, ArrowLeft, Shield } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminAuditPage() {
  const [logs] = useState([
    {
      id: "1",
      adminEmail: "admin@nmims.edu",
      action: "INIT_SYSTEM",
      entity: "editions",
      entityId: "2026-27",
      timestamp: "2026-10-12 17:00:00 IST",
    },
    {
      id: "2",
      adminEmail: "admin@nmims.edu",
      action: "SEED_TEAMS",
      entity: "teams",
      entityId: "70 teams seeded",
      timestamp: "2026-10-12 17:05:00 IST",
    },
    {
      id: "3",
      adminEmail: "admin@nmims.edu",
      action: "UPDATE_CONFIG",
      entity: "site_config",
      entityId: "venue_address",
      timestamp: "2026-10-12 17:15:00 IST",
    },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/settings"
              className="p-2 rounded-xl bg-[#161A40] text-gold hover:bg-[#20255A]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
                System Security
              </span>
              <h1 className="text-2xl font-serif font-black uppercase text-gold-light">
                Admin Audit Trail
              </h1>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[rgba(217,178,111,0.2)] bg-[#161A40]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#20255A] text-gold uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Email</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217,178,111,0.1)] font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#20255A]/40">
                  <td className="p-4 text-[#AEB3D6]">{log.timestamp}</td>
                  <td className="p-4 text-gold font-bold">{log.adminEmail}</td>
                  <td className="p-4 text-emerald-400 font-bold">{log.action}</td>
                  <td className="p-4 text-[#F4EFE3]">{log.entity}</td>
                  <td className="p-4 text-[#AEB3D6]">{log.entityId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
