import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so a
// build without them ships a client that talks to a placeholder Supabase project
// (admin login silently fails). Fail the production build loudly instead.
function assertBuildEnv() {
  const missing = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
    (key) => !process.env[key]
  );
  if (missing.length > 0) {
    throw new Error(
      `[CRITICAL] Missing build-time environment variables: ${missing.join(", ")}. ` +
        "Set them in your host's environment settings (e.g. Render → Environment) and rebuild."
    );
  }
}

// Hosts allowed to invoke Server Actions in addition to the request's own host.
// Render sets RENDER_EXTERNAL_HOSTNAME automatically; NEXT_PUBLIC_SITE_URL covers custom domains.
function serverActionOrigins(): string[] {
  const origins = [
    "nmimssports.com",
    "www.nmimssports.com",
    "nmims-sports-championship.onrender.com",
    "localhost:3000",
  ];
  if (process.env.RENDER_EXTERNAL_HOSTNAME) origins.push(process.env.RENDER_EXTERNAL_HOSTNAME);
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      origins.push(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    } catch {
      // Ignore malformed NEXT_PUBLIC_SITE_URL; env.ts validation reports it.
    }
  }
  return Array.from(new Set(origins));
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
      allowedOrigins: serverActionOrigins(),
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://images.pexels.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "frame-src 'self' https://www.google.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) assertBuildEnv();
  return nextConfig;
}
