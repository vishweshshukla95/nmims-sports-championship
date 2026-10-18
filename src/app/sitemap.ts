import { MetadataRoute } from "next";
import { SPORTS_CONFIG } from "@/config/tournament";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nmimssports.com";

  const staticRoutes = [
    "",
    "/home",
    "/sports",
    "/standings",
    "/teams",
    "/campuses",
    "/gallery",
    "/travel",
    "/rules",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" || route === "/home" ? 1.0 : 0.8,
  }));

  const sportRoutes = SPORTS_CONFIG.map((sport) => ({
    url: `${baseUrl}/sports/${sport.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...sportRoutes];
}
