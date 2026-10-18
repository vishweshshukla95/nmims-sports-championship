"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CampusBackgroundProps {
  className?: string;
}

/**
 * Shared Campus Background component:
 * - next/image with /images/hero-campus.webp (fallback /images/shirpur-campus.webp)
 * - fill, priority, object-cover, object-position center
 * - filter blur(3px) brightness(0.55) saturate(1.1), scale(1.08)
 * - slow Ken Burns zoom animation (animate-ken-burns)
 * - overlay linear-gradient(180deg, rgba(15,18,46,0.55) 0%, rgba(27,31,75,0.65) 55%, rgba(15,18,46,0.92) 100%)
 * - Layered at absolute inset-0 -z-10 with pointer-events-none
 */
export default function CampusBackground({ className = "" }: CampusBackgroundProps) {
  const [imgSrc, setImgSrc] = useState("/images/hero-campus.webp");

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      <Image
        src={imgSrc}
        onError={() => setImgSrc("/images/shirpur-campus.webp")}
        alt="NMIMS MPTP Shirpur Campus Aerial View"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center animate-ken-burns"
        style={{
          filter: "blur(3px) brightness(0.55) saturate(1.1)",
          transform: "scale(1.08)",
        }}
      />

      {/* Overlay: linear-gradient(180deg, rgba(15,18,46,0.55) 0%, rgba(27,31,75,0.65) 55%, rgba(15,18,46,0.92) 100%) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,18,46,0.55) 0%, rgba(27,31,75,0.65) 55%, rgba(15,18,46,0.92) 100%)",
        }}
      />
    </div>
  );
}
