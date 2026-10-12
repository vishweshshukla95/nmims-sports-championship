"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Download,
  Share2,
  ZoomIn,
  Camera,
  ExternalLink,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import ImageLightbox, { LightboxImage } from "@/components/ui/ImageLightbox";
import { TOURNAMENT_CONFIG } from "@/config/tournament";

export default function GalleryPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState("all");

  // All 9 gallery photos in exact filename order with required captions
  const initialPhotos: (LightboxImage & { id: string; tag: string })[] = [
    {
      id: "highlight-01",
      src: "/images/gallery/highlight-01-champions.webp",
      alt: "Champions with the trophy",
      caption: "Champions with the trophy",
      tag: "Ceremonies",
    },
    {
      id: "highlight-02",
      src: "/images/gallery/highlight-02-all-campuses-group.webp",
      alt: "All seven campuses together",
      caption: "All seven campuses together",
      tag: "Team Photos",
    },
    {
      id: "highlight-03",
      src: "/images/gallery/highlight-03-campus-captains.webp",
      alt: "Campus captains at the march-past",
      caption: "Campus captains at the march-past",
      tag: "Ceremonies",
    },
    {
      id: "highlight-04",
      src: "/images/gallery/highlight-04-opening-ceremony-anthem.webp",
      alt: "Opening ceremony",
      caption: "Opening ceremony",
      tag: "Ceremonies",
    },
    {
      id: "highlight-05",
      src: "/images/gallery/highlight-05-inauguration.webp",
      alt: "Inauguration",
      caption: "Inauguration",
      tag: "Ceremonies",
    },
    {
      id: "highlight-06",
      src: "/images/gallery/highlight-06-felicitation.webp",
      alt: "Felicitation of dignitaries",
      caption: "Felicitation of dignitaries",
      tag: "Ceremonies",
    },
    {
      id: "highlight-07",
      src: "/images/gallery/highlight-07-trophies.webp",
      alt: "The trophies",
      caption: "The trophies",
      tag: "Ceremonies",
    },
    {
      id: "highlight-08",
      src: "/images/gallery/highlight-08-closing-group.webp",
      alt: "Closing ceremony group",
      caption: "Closing ceremony group",
      tag: "Ceremonies",
    },
    {
      id: "highlight-09",
      src: "/images/gallery/highlight-09-in-the-news.webp",
      alt: "In the News – Punya Nagari",
      caption: "In the News – Punya Nagari",
      credit: "Featured in Punya Nagari, Dhule Edition",
      tag: "In the News",
    },
  ];

  const tags = [
    "all",
    "Ceremonies",
    "Team Photos",
    "Cricket",
    "Football",
    "Basketball",
    "Volleyball",
    "Table Tennis",
    "Lawn Tennis",
    "In the News",
  ];

  const filteredPhotos =
    selectedTag === "all"
      ? initialPhotos
      : initialPhotos.filter((p) => p.tag === selectedTag);

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Visual Memories
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            HIGHLIGHTS OF THE CHAMPIONSHIP
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-3" />
          <p className="mt-3 text-base text-[#AEB3D6]">
            Relive the best moments
          </p>
        </div>

        {/* Tags Filter (scrollable on mobile) */}
        <div className="flex items-center justify-start md:justify-center overflow-x-auto pb-4 mb-10 gap-2 no-scrollbar">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? "bg-gold text-indigo-black font-bold shadow-md"
                  : "bg-[#161A40] text-[#AEB3D6] hover:text-[#F4EFE3] border border-[rgba(217,178,111,0.15)]"
              }`}
            >
              {tag === "all" ? "All Photos" : tag}
            </button>
          ))}
        </div>

        {/* Masonry Grid (2, 3, or 4 columns with 12px gap & 12px radius) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightboxAt(index)}
              className="group relative h-64 sm:h-72 rounded-[12px] overflow-hidden cursor-pointer border border-[rgba(217,178,111,0.2)] hover:border-gold hover:shadow-gold-glow transition-all duration-300 bg-[#161A40]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Navy Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F122E]/90 via-[#0F122E]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-[10px] font-mono font-bold text-gold/80 uppercase tracking-widest mb-1">
                  {photo.tag}
                </span>
                <h4 className="text-sm font-serif font-bold text-gold-light leading-snug drop-shadow">
                  {photo.caption}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#AEB3D6]">
                  <span>Click to expand</span>
                  <ZoomIn className="w-3.5 h-3.5 text-gold" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Follow CTA */}
        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-[#161A40] via-[#20255A] to-[#161A40] border border-gold/30 text-center max-w-2xl mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mx-auto mb-3 text-gold">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-black uppercase text-gold">
            Follow the Championship on Instagram
          </h3>
          <p className="text-xs sm:text-sm text-[#AEB3D6] mt-2 leading-relaxed">
            Stay tuned for daily reels, story highlights, player interviews, and podium celebrations from Shirpur.
          </p>
          <div className="mt-5">
            <a
              href={`https://instagram.com/${TOURNAMENT_CONFIG.instagramHandle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider"
            >
              <span>Follow {TOURNAMENT_CONFIG.instagramHandle}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        images={filteredPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() =>
          setLightboxIndex((prev) => (prev + 1) % filteredPhotos.length)
        }
        onPrev={() =>
          setLightboxIndex(
            (prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length
          )
        }
      />
    </NavyPatchBackground>
  );
}
