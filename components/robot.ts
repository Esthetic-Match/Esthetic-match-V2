import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",

        disallow: [
          "/api/",
          "/en/(protected)/",
          "/fr/(protected)/",
          "/en/booking/",
          "/fr/booking/",
        ],
      },
    ],

    sitemap: "https://www.estheticmatch.com/sitemap.xml",
  };
}