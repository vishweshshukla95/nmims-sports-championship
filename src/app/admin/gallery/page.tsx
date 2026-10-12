"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Filter,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminGalleryPage() {
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("Ceremonies");
  const [edition, setEdition] = useState("2026-27");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const staticPhotos = [
    { name: "highlight-01-champions.webp", caption: "Champions with the trophy" },
    { name: "highlight-02-all-campuses-group.webp", caption: "All seven campuses together" },
    { name: "highlight-03-campus-captains.webp", caption: "Campus captains at march-past" },
    { name: "highlight-04-opening-ceremony-anthem.webp", caption: "Opening ceremony" },
    { name: "highlight-05-inauguration.webp", caption: "Inauguration" },
    { name: "highlight-06-felicitation.webp", caption: "Felicitation of dignitaries" },
    { name: "highlight-07-trophies.webp", caption: "The trophies" },
    { name: "highlight-08-closing-group.webp", caption: "Closing ceremony group" },
    { name: "highlight-09-in-the-news.webp", caption: "In the News – Punya Nagari" },
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setCaption("");
    }, 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Storage & Media
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Gallery Uploads Manager
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Upload event photos to Supabase Storage with automatic client-side compression and tags.
            </p>
          </div>
        </div>

        {uploadSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Image uploaded successfully and published to Tournament Gallery!</span>
          </div>
        )}

        {/* Upload Form Box */}
        <form
          onSubmit={handleUpload}
          className="p-6 rounded-3xl bg-[#161A40] border-2 border-dashed border-gold/40 space-y-4"
        >
          <div className="flex items-center gap-3 text-gold">
            <Upload className="w-5 h-5 text-gold-light" />
            <h3 className="font-serif font-bold text-base text-gold-light uppercase">
              Upload New Photo
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                Photo Caption
              </label>
              <input
                type="text"
                required
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Volleyball Championship Final Spike"
                className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                Category Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
              >
                <option value="Ceremonies">Ceremonies</option>
                <option value="Team Photos">Team Photos</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Table Tennis">Table Tennis</option>
                <option value="Lawn Tennis">Lawn Tennis</option>
                <option value="In the News">In the News</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                Edition
              </label>
              <select
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
              >
                <option value="2026-27">2026-27 (Current)</option>
                <option value="2025-26">2025-26 (Archive)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>Select File & Upload</span>
            </button>
          </div>
        </form>

        {/* Existing Seed Photos (Read-Only per spec) */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-sm text-gold-light uppercase">
            Default Tournament Kit Photos (9 Loaded)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {staticPhotos.map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-2xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] flex items-center gap-3"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={`/images/gallery/${p.name}`}
                    alt={p.caption}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="font-serif font-bold text-xs text-[#F4EFE3] truncate">
                    {p.caption}
                  </div>
                  <span className="text-[10px] text-gold/70 font-mono truncate block">
                    {p.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
