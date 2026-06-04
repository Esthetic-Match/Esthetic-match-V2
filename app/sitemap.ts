import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.estheticmatch.com";

  const staticRoutes = [
    "",
    "/en",
    "/fr",
    "/en/sign-in",
    "/fr/sign-in",
    "/en/sign-up",
    "/fr/sign-up",
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...staticUrls];
}