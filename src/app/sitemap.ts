import { MetadataRoute } from "next";
import { SPORTS_CONFIG } from "@/config/tournament";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://nmimssports.com";

  const staticRoutes = [
    "",
    "/sports",
    "/teams",
    "/leaderboard",
    "/gallery",
    "/previous-edition",
    "/travel",
    "/rules",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const sportRoutes = SPORTS_CONFIG.map((sport) => ({
    url: `${baseUrl}/sports/${sport.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...sportRoutes];
}
