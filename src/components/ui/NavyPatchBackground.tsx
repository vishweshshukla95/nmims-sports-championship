import React from "react";

interface NavyPatchBackgroundProps {
  className?: string;
  variant?: "full" | "calm" | "hero";
  children?: React.ReactNode;
}

export default function NavyPatchBackground({
  className = "",
  variant = "calm",
  children,
}: NavyPatchBackgroundProps) {
  // Opacity variations
  const opacityConfig = {
    hero: {
      patch1: "opacity-25",
      patch2: "opacity-20",
      patch3: "opacity-20",
      patch4: "opacity-15",
    },
    full: {
      patch1: "opacity-25",
      patch2: "opacity-20",
      patch3: "opacity-20",
      patch4: "opacity-15",
    },
    calm: {
      patch1: "opacity-12",
      patch2: "opacity-10",
      patch3: "opacity-10",
      patch4: "opacity-8",
    },
  }[variant];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background base */}
      <div className="absolute inset-0 bg-[#1B1F4B] -z-20 pointer-events-none" />

      {/* Layered angled patches */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Angled Patch 1: Top Right Royal polygon */}
        <div
          className={`absolute -top-32 -right-24 w-[130%] h-[550px] bg-gradient-to-br from-[#1E3FA8] via-[#2447C4] to-transparent ${opacityConfig.patch1} transform -rotate-12 transform-gpu filter blur-[1px]`}
          style={{
            clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 80%)",
          }}
        />

        {/* Angled Patch 2: Mid-left Cobalt band */}
        <div
          className={`absolute top-1/4 -left-40 w-[120%] h-[420px] bg-gradient-to-r from-[#2447C4] via-[#1E3FA8] to-transparent ${opacityConfig.patch2} transform rotate-24 transform-gpu`}
          style={{
            clipPath: "polygon(0% 20%, 90% 0%, 100% 80%, 10% 100%)",
          }}
        />

        {/* Angled Patch 3: Lower right band */}
        <div
          className={`absolute bottom-[-100px] -right-32 w-[110%] h-[500px] bg-gradient-to-tl from-[#1E3FA8] via-[#0F122E] to-transparent ${opacityConfig.patch3} transform -rotate-15 transform-gpu`}
          style={{
            clipPath: "polygon(20% 0%, 100% 15%, 80% 100%, 0% 85%)",
          }}
        />

        {/* Fold shadows with Indigo-Black */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0F122E]/40 to-[#0F122E]/80 mix-blend-multiply" />

        {/* Subtle fabric weave texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(217, 178, 111, 0.4) 1px, transparent 1px), radial-gradient(rgba(244, 239, 227, 0.3) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        />
      </div>

      {children}
    </div>
  );
}
