import type { Metadata, Viewport } from "next";
import { Cinzel, Oswald, Inter } from "next/font/google";
import { TOURNAMENT_CONFIG } from "@/config/tournament";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nmimssports.com"),
  title: {
    default: `${TOURNAMENT_CONFIG.fullName}`,
    template: `%s | ${TOURNAMENT_CONFIG.fullName}`,
  },
  description:
    "Official website of SVKM's NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27. 27–31 October 2026 at Mukesh Patel Technology Park, Shirpur. Fixtures, Results, Leaderboards, MOTM awards & Gallery.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/nmims-logo-white.webp",
    apple: "/images/nmims-logo-white.webp",
  },
  openGraph: {
    title: TOURNAMENT_CONFIG.fullName,
    description:
      "Official website of SVKM's NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27 at MPTP Shirpur.",
    url: "https://nmimssports.com",
    siteName: TOURNAMENT_CONFIG.fullName,
    images: [
      {
        url: "/images/hero-campus.webp",
        width: 1200,
        height: 630,
        alt: "SVKM's NMIMS Inter Campus Sports Championship 2026-27",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TOURNAMENT_CONFIG.fullName,
    description: "Official portal for SVKM's NMIMS Inter Campus Sports Championship 2026-27.",
    images: ["/images/hero-campus.webp"],
  },
};

import LayoutShell from "@/components/layout/LayoutShell";

export const viewport: Viewport = {
  themeColor: "#1B1F4B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${oswald.variable} ${inter.variable}`}>
      <body className="bg-navy text-text-main antialiased selection:bg-gold selection:text-indigo-black flex flex-col min-h-screen">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
