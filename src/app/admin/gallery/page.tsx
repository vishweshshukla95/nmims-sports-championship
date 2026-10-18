"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getGalleryImagesAction,
  uploadGalleryPhotoAction,
  deleteGalleryImageAction,
  GalleryImageItem,
} from "@/app/actions/gallery";

export default function AdminGalleryPage() {
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("Ceremonies");
  const [edition, setEdition] = useState("2026-27");
  const [file, setFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<GalleryImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      const data = await getGalleryImagesAction();
      setPhotos(data);
    } catch (err: unknown) {
      console.error("Failed to load gallery photos:", err);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getGalleryImagesAction()
      .then((data) => {
        if (!ignore) {
          setPhotos(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Failed to load gallery photos:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const stripExifAndCompress = async (rawFile: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(rawFile);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawFile);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(rawFile);
          },
          "image/webp",
          0.88
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(rawFile);
      };
      img.src = url;
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setFeedback({ type: "error", message: "Please provide a photo caption." });
      return;
    }

    if (!file) {
      setFeedback({ type: "error", message: "Please select an image file to upload." });
      return;
    }

    setUploading(true);

    try {
      // 1. Strip EXIF/GPS metadata and compress via canvas
      const cleanBlob = await stripExifAndCompress(file);
      const cleanFile = new File([cleanBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
        type: "image/webp",
      });

      // 2. Prepare FormData for secure server action upload
      const formData = new FormData();
      formData.append("file", cleanFile);
      formData.append("caption", caption.trim());
      formData.append("tag", tag);
      formData.append("edition", edition);

      const res = await uploadGalleryPhotoAction(formData);

      if (res.error || !res.success) {
        setFeedback({ type: "error", message: res.error || "Upload failed." });
        return;
      }

      setFeedback({
        type: "success",
        message: "Image uploaded and stored in Supabase Storage & gallery_images table successfully!",
      });

      setCaption("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadPhotos(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      console.error("Gallery upload exception:", err);
      setFeedback({ type: "error", message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (item: GalleryImageItem) => {
    if (!confirm(`Are you sure you want to delete "${item.caption}"?`)) return;

    try {
      const res = await deleteGalleryImageAction(item.id, item.storagePath);
      if (res.error) {
        console.error("Gallery delete error:", res.error);
        setFeedback({ type: "error", message: res.error });
        return;
      }
      setFeedback({ type: "success", message: "Photo deleted from Supabase gallery." });
      await loadPhotos(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      console.error("Gallery delete exception:", err);
      setFeedback({ type: "error", message });
    }
  };

  const customPhotos = photos.filter((p) => p.isCustom);
  const staticPhotos = photos.filter((p) => !p.isCustom);

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
              Upload event photos to Supabase Storage bucket <code className="text-gold">gallery</code> and record captions in <code className="text-gold">gallery_images</code>.
            </p>
          </div>
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
                Photo Caption *
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

          <div>
            <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
              Select Image File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-[#AEB3D6] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gold/20 file:text-gold hover:file:bg-gold/30 cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Storage & DB...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload to Supabase</span>
                </>
              )}
            </button>
          </div>
        </form>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gold">
            Loading photos from Supabase gallery_images...
          </div>
        ) : (
          <>
            {/* Custom Admin Uploaded Photos */}
            {customPhotos.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-sm text-gold-light uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gold" />
                  <span>Supabase Live Uploads ({customPhotos.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {customPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-[#161A40] border border-gold/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                          <Image
                            src={p.url}
                            alt={p.caption}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-serif font-bold text-xs text-[#F4EFE3] truncate">
                            {p.caption}
                          </div>
                          <span className="text-[10px] text-gold font-mono truncate block">
                            {p.tag} · {p.edition}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(p)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors flex-shrink-0"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Static Photos */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#AEB3D6] uppercase">
                Default Tournament Kit Photos ({staticPhotos.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {staticPhotos.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] flex items-center gap-3"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={p.url}
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
                        {p.tag}
                      </span>
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
