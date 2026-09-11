import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

type LocalizedValue = {
  localeCode: string;
  name: string;
  description: string | null;
};

function getLocaleCandidates(request: NextRequest) {
  const requestedLocale =
    request.nextUrl.searchParams.get("locale")?.trim().toLowerCase() ?? "en";

  const locale = /^[a-z]{2}(?:-[a-z0-9]{2,8})*$/.test(requestedLocale)
    ? requestedLocale
    : "en";

  return [...new Set([locale, locale.split("-")[0], "en"])];
}

function getTranslation(
  translations: LocalizedValue[],
  localeCandidates: string[]
) {
  for (const localeCode of localeCandidates) {
    const translation = translations.find(
      (item) => item.localeCode === localeCode
    );

    if (translation) {
      return translation;
    }
  }

  return translations[0];
}

export async function GET(request: NextRequest) {
  try {
    const localeCandidates = getLocaleCandidates(request);

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        slug: true,
        href: true,
        homeImage: true,
        icon: true,
        translations: {
          where: {
            localeCode: {
              in: localeCandidates,
            },
          },
          select: {
            localeCode: true,
            name: true,
            description: true,
          },
        },
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            translations: {
              where: {
                localeCode: {
                  in: localeCandidates,
                },
              },
              select: {
                localeCode: true,
                name: true,
                description: true,
              },
            },
            procedureLinks: {
              where: {
                isActive: true,
                procedure: {
                  isActive: true,
                },
              },
              select: {
                procedureId: true,
              },
            },
          },
        },
      },
    });

    const responseCategories = categories.map((category) => {
      const translation = getTranslation(
        category.translations,
        localeCandidates
      );

      return {
        id: category.id,
        slug: category.slug,
        name: translation?.name ?? category.id,
        description: translation?.description ?? null,
        href: category.href ?? `/categories/${category.slug}`,
        homeImage: category.homeImage,
        icon: category.icon,
        subcategories: category.subcategories.map((subcategory) => {
          const subcategoryTranslation = getTranslation(
            subcategory.translations,
            localeCandidates
          );

          return {
            id: subcategory.id,
            name: subcategoryTranslation?.name ?? subcategory.id,
            description: subcategoryTranslation?.description ?? null,
            procedureCount: subcategory.procedureLinks.length,
          };
        }),
      };
    });

    return NextResponse.json({
      categories: responseCategories,
    });
  } catch (error) {
    console.error("Could not load public categories:", error);

    return NextResponse.json(
      {
        error: "Could not load categories.",
      },
      {
        status: 500,
      }
    );
  }
}