import React from "react";

interface CampusBadgeProps {
  shortCode: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isHost?: boolean;
}

export default function CampusBadge({
  shortCode,
  size = "md",
  className = "",
  isHost = false,
}: CampusBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-9 text-xs",
    md: "w-12 h-14 text-sm font-bold",
    lg: "w-16 h-20 text-lg font-bold",
    xl: "w-20 h-24 text-xl font-black",
  }[size];

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      {/* Shield shape */}
      <div
        className={`${sizeClasses} relative flex items-center justify-center bg-gradient-to-b from-[#20255A] via-[#161A40] to-[#0F122E] border-2 border-gold/70 shadow-lg text-gold font-mono tracking-wider transition-all duration-300 group-hover:border-gold group-hover:shadow-[0_0_15px_rgba(217,178,111,0.4)]`}
        style={{
          clipPath:
            "polygon(50% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%, 0% 0%)",
        }}
      >
        {/* Subtle inner sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold/10 to-transparent pointer-events-none" />
        <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {shortCode}
        </span>
      </div>

      {isHost && size !== "sm" && (
        <span className="absolute -bottom-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold text-[9px] font-black text-indigo-black uppercase tracking-wider shadow-md">
          HOST
        </span>
      )}
    </div>
  );
}
