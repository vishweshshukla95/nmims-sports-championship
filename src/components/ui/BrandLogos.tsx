import React from "react";
import Image from "next/image";
import Link from "next/link";

export type LogoSize = "sm" | "md" | "lg" | "xl";

interface SizeSpec {
  px: number;
  boxClass: string;
}

const SIZE_SPECS: Record<LogoSize, SizeSpec> = {
  sm: { px: 48, boxClass: "w-12 h-12" },
  md: { px: 72, boxClass: "w-[72px] h-[72px]" },
  lg: { px: 96, boxClass: "w-24 h-24" },
  xl: { px: 120, boxClass: "w-[120px] h-[120px]" },
};

function getDimensions(size: LogoSize, mobileSize?: LogoSize) {
  const desktop = SIZE_SPECS[size];
  if (!mobileSize || mobileSize === size) {
    return {
      boxClass: desktop.boxClass,
      sizesAttr: `${desktop.px}px`,
    };
  }

  const mobile = SIZE_SPECS[mobileSize];
  return {
    boxClass: `${mobile.boxClass} md:${desktop.boxClass}`,
    sizesAttr: `(max-width: 768px) ${mobile.px}px, ${desktop.px}px`,
  };
}

export interface LogoItemProps {
  size?: LogoSize;
  mobileSize?: LogoSize;
  href?: string;
  className?: string;
}

/**
 * SVKM Logo in a fixed square box with object-contain.
 */
export function SvkmLogo({
  size = "md",
  mobileSize,
  href = "/home",
  className = "",
}: LogoItemProps) {
  const { boxClass, sizesAttr } = getDimensions(size, mobileSize);

  const content = (
    <div
      className={`relative ${boxClass} flex-shrink-0 flex items-center justify-start overflow-visible ${className}`}
    >
      <div className="relative w-full h-full">
        <Image
          src="/images/svkm-logo.webp"
          alt="SVKM - Shri Vile Parle Kelavani Mandal"
          fill
          sizes={sizesAttr}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded flex items-center"
        title="SVKM - Shri Vile Parle Kelavani Mandal"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * NMIMS Logo in a fixed square box with object-contain, scaled up visually by 1.25
 * so its circular crest and delicate wordmark equal the visual mass of the SVKM logo.
 */
export function NmimsLogo({
  size = "md",
  mobileSize,
  href = "/home",
  className = "",
}: LogoItemProps) {
  const { boxClass, sizesAttr } = getDimensions(size, mobileSize);

  const content = (
    <div
      className={`relative ${boxClass} flex-shrink-0 flex items-center justify-end overflow-visible ${className}`}
    >
      {/* Visual equalisation: scale up by 1.25 to balance visual weight against SVKM */}
      <div className="relative w-full h-full transform scale-[1.25] origin-center">
        <Image
          src="/images/nmims-logo-white.webp"
          alt="NMIMS Deemed to be University"
          fill
          sizes={sizesAttr}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded flex items-center"
        title="NMIMS Deemed to be University"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export interface BrandLogosProps {
  size?: LogoSize;
  mobileSize?: LogoSize;
  href?: string;
  className?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * BrandLogos: Equal-looking logos component with SVKM at far left and NMIMS at far right.
 * Sizes:
 * - xl = 120x120 (Starting page)
 * - lg = 96x96 (Navbar desktop, Admin login)
 * - md = 72x72 (Navbar mobile, Footer)
 * - sm = 48x48 (Admin sidebar)
 */
export default function BrandLogos({
  size = "md",
  mobileSize,
  href = "/home",
  className = "",
  leftAddon,
  rightAddon,
  children,
}: BrandLogosProps) {
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {/* FAR LEFT: SVKM */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <SvkmLogo size={size} mobileSize={mobileSize} href={href} />
        {leftAddon}
      </div>

      {/* CENTRE: Optional children (e.g. Navbar links or titles) */}
      {children}

      {/* FAR RIGHT: NMIMS + optional right addon */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {rightAddon}
        <NmimsLogo size={size} mobileSize={mobileSize} href={href} />
      </div>
    </div>
  );
}
