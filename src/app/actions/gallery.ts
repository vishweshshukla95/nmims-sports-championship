"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";

export interface GalleryImageItem {
  id: string;
  url: string;
  caption: string;
  tag: string;
  edition: string;
  storagePath?: string;
  isCustom?: boolean;
}

interface GalleryImageRow {
  id: string;
  url: string;
  caption: string;
  tag: string;
  edition: string;
  storage_path: string | null;
  created_at?: string;
}

const STATIC_GALLERY_PHOTOS: GalleryImageItem[] = [
  { id: "s-1", url: "/images/gallery/highlight-01-champions.webp", caption: "Champions with the trophy", tag: "Ceremonies", edition: "2025-26" },
  { id: "s-2", url: "/images/gallery/highlight-02-all-campuses-group.webp", caption: "All seven campuses together", tag: "Team Photos", edition: "2025-26" },
  { id: "s-3", url: "/images/gallery/highlight-03-campus-captains.webp", caption: "Campus captains at march-past", tag: "Ceremonies", edition: "2025-26" },
  { id: "s-4", url: "/images/gallery/highlight-04-opening-ceremony-anthem.webp", caption: "Opening ceremony", tag: "Ceremonies", edition: "2025-26" },
  { id: "s-5", url: "/images/gallery/highlight-05-inauguration.webp", caption: "Inauguration", tag: "Ceremonies", edition: "2025-26" },
  { id: "s-6", url: "/images/gallery/highlight-06-felicitation.webp", caption: "Felicitation of dignitaries", tag: "Ceremonies", edition: "2025-26" },
  { id: "s-7", url: "/images/gallery/highlight-07-trophies.webp", caption: "The trophies", tag: "Ceremonies", edition: "2025-26" },
  { id: "s-8", url: "/images/gallery/highlight-08-closing-group.webp", caption: "Closing ceremony group", tag: "Ceremonies", edition: "2025-26" },
  { id: "s-9", url: "/images/gallery/highlight-09-in-the-news.webp", caption: "In the News – Punya Nagari", tag: "In the News", edition: "2025-26" },
];

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function verifyImageMagicBytes(buffer: Buffer): { valid: boolean; ext: "jpg" | "png" | "webp" } {
  if (buffer.length < 12) {
    return { valid: false, ext: "jpg" };
  }

  // JPEG: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: "jpg" };
  }

  // PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: "png" };
  }

  // WebP: bytes 0-3 "RIFF" and bytes 8-11 "WEBP"
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return { valid: true, ext: "webp" };
  }

  return { valid: false, ext: "jpg" };
}

export async function getGalleryImagesAction(): Promise<GalleryImageItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id, url, caption, tag, edition, storage_path")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return STATIC_GALLERY_PHOTOS;
  }

  const rows = data as unknown as GalleryImageRow[];

  const customItems: GalleryImageItem[] = rows.map((row) => ({
    id: row.id,
    url: row.url,
    caption: row.caption || "",
    tag: row.tag || "Ceremonies",
    edition: row.edition || "2026-27",
    storagePath: row.storage_path || undefined,
    isCustom: true,
  }));

  return [...customItems, ...STATIC_GALLERY_PHOTOS];
}

const addGalleryMetadataSchema = z.object({
  caption: z.string().max(255).default(""),
  tag: z.string().max(50).default("Ceremonies"),
  edition: z.string().max(20).default("2026-27"),
});

export async function uploadGalleryPhotoAction(
  formData: FormData
): Promise<{ success: boolean; item?: GalleryImageItem; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return { success: false, error: "An image file is required." };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: "File exceeds 5 MB limit." };
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return { success: false, error: "Unsupported file type. Only JPEG, PNG, and WebP are allowed." };
    }

    const caption = (formData.get("caption") as string) || "";
    const tag = (formData.get("tag") as string) || "Ceremonies";
    const edition = (formData.get("edition") as string) || "2026-27";

    const metaParsed = addGalleryMetadataSchema.safeParse({ caption, tag, edition });
    if (!metaParsed.success) {
      return { success: false, error: metaParsed.error.issues[0]?.message || "Invalid metadata" };
    }

    // Convert file to buffer and verify magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { valid, ext } = verifyImageMagicBytes(buffer);
    if (!valid) {
      return {
        success: false,
        error: "Corrupted or invalid image data. File header does not match permitted image formats.",
      };
    }

    // Generate random server-side UUID filename
    const uniqueId = crypto.randomUUID();
    const storagePath = `uploads/${uniqueId}.${ext}`;

    // Upload to Supabase Storage bucket 'gallery'
    const { error: storageError } = await supabase.storage
      .from("gallery")
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return { success: false, error: "Storage upload failed. Please verify storage permissions." };
    }

    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Insert record in gallery_images table
    const { data: dbData, error: dbError } = await supabase
      .from("gallery_images")
      .insert({
        id: uniqueId,
        url: publicUrl,
        caption: metaParsed.data.caption.trim(),
        tag: metaParsed.data.tag,
        edition: metaParsed.data.edition,
        storage_path: storagePath,
      })
      .select("id, url, caption, tag, edition, storage_path")
      .single();

    if (dbError) {
      console.error("DB insert error for gallery photo:", dbError);
      // Clean up uploaded file
      await supabase.storage.from("gallery").remove([storagePath]);
      return { success: false, error: "Failed to save photo record in database." };
    }

    const row = dbData as GalleryImageRow;
    const item: GalleryImageItem = {
      id: row.id,
      url: row.url,
      caption: row.caption,
      tag: row.tag,
      edition: row.edition,
      storagePath: row.storage_path || undefined,
      isCustom: true,
    };

    revalidatePath("/gallery");
    revalidatePath("/home");

    return { success: true, item };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload processing failed";
    console.error("uploadGalleryPhotoAction exception:", err);
    return { success: false, error: message };
  }
}

export async function addGalleryImageAction(item: {
  url: string;
  caption: string;
  tag: string;
  edition: string;
  storagePath?: string;
}): Promise<{ success: boolean; item?: GalleryImageItem; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const { data, error } = await supabase
      .from("gallery_images")
      .insert({
        id: crypto.randomUUID(),
        url: item.url,
        caption: item.caption || "",
        tag: item.tag || "Ceremonies",
        edition: item.edition || "2026-27",
        storage_path: item.storagePath || null,
      })
      .select("id, url, caption, tag, edition, storage_path")
      .single();

    if (error) {
      console.error("addGalleryImageAction error:", error);
      return { success: false, error: error.message };
    }

    const row = data as GalleryImageRow;
    revalidatePath("/gallery");
    revalidatePath("/home");
    return {
      success: true,
      item: {
        id: row.id,
        url: row.url,
        caption: row.caption,
        tag: row.tag,
        edition: row.edition,
        storagePath: row.storage_path || undefined,
        isCustom: true,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add image";
    console.error("addGalleryImageAction exception:", err);
    return { success: false, error: message };
  }
}

export async function deleteGalleryImageAction(
  id: string,
  storagePath?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    if (storagePath) {
      try {
        await supabase.storage.from("gallery").remove([storagePath]);
      } catch (e) {
        console.warn("Storage deletion error:", e);
      }
    }

    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) {
      console.error("deleteGalleryImageAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/gallery");
    revalidatePath("/home");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete image";
    console.error("deleteGalleryImageAction exception:", err);
    return { success: false, error: message };
  }
}
