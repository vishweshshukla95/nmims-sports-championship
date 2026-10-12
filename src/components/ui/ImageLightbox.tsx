"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut } from "lucide-react";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.caption || currentImage.alt,
          text: `SVKM'S NMIMS Inter Campus Sports Championship 2026-27 - ${currentImage.caption || ""}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = currentImage.src;
    a.download = currentImage.src.split("/").pop() || "championship-photo.webp";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F122E]/95 backdrop-blur-xl flex flex-col justify-between select-none animate-fadeIn">
      {/* Top action bar */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-[rgba(217,178,111,0.2)] text-gold z-10">
        <div className="text-sm font-mono font-medium tracking-wider">
          {currentIndex + 1} / {images.length}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.3))}
            className="p-2 rounded-full hover:bg-[#161A40] transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gold-light" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.3))}
            className="p-2 rounded-full hover:bg-[#161A40] transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gold-light" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-[#161A40] transition-colors"
            title="Download image"
            aria-label="Download image"
          >
            <Download className="w-5 h-5 text-gold-light" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-[#161A40] transition-colors"
            title="Share image"
            aria-label="Share image"
          >
            <Share2 className="w-5 h-5 text-gold-light" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#161A40] hover:bg-gold hover:text-indigo-black border border-gold/40 transition-colors"
            title="Close Lightbox"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image area with navigation */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {onPrev && images.length > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161A40]/80 hover:bg-[#20255A] text-gold border border-gold/30 transition-all z-20 shadow-lg"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center transition-transform duration-200 cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>

        {onNext && images.length > 1 && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161A40]/80 hover:bg-[#20255A] text-gold border border-gold/30 transition-all z-20 shadow-lg"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Caption bar */}
      <div className="p-4 md:p-6 bg-[#161A40]/80 border-t border-[rgba(217,178,111,0.2)] text-center">
        <h4 className="text-base sm:text-lg font-serif font-bold text-gold-light">
          {currentImage.caption || currentImage.alt}
        </h4>
        {currentImage.credit && (
          <p className="text-xs text-[#AEB3D6] mt-1">{currentImage.credit}</p>
        )}
      </div>
    </div>
  );
}
