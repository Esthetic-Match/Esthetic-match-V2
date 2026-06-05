import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.estheticmatch.com";

  const locales = ["en", "fr"];

  const publicRoutes = [
    "",
    "/doctors",
    "/categories",
    "/faq",
    "/contact",
    "/privacy",
    "/privacy-policy",
    "/terms-of-use",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
  ];

  const urls: MetadataRoute.Sitemap = [];

  /*
    STATIC PAGES
  */
  for (const locale of locales) {
    for (const route of publicRoutes) {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }
  }

  /*
    DOCTOR PROFILE PAGES
  */
  const doctors = await prisma.doctorProfile.findMany({
    where: {
      slug: {
        not: null,
      },
    },

    select: {
      slug: true,
      updatedAt: true,
    },
  });

  for (const doctor of doctors) {
    for (const locale of locales) {
      urls.push({
        url: `${baseUrl}/${locale}/doctors/${doctor.slug}`,
        lastModified: doctor.updatedAt,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
  }

  /*
    CATEGORY PAGES
    Replace later with real DB categories
  */
  const categoryIds = [
    "rhinoplasty",
    "veneers",
    "hair-transplant",
  ];

  for (const locale of locales) {
    for (const categoryId of categoryIds) {
      urls.push({
        url: `${baseUrl}/${locale}/categories/${categoryId}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return urls;
}