import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

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

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { categoryId } = await params;
    const identifier = categoryId.trim();

    if (!identifier) {
      return NextResponse.json(
        {
          error: "Category identifier is required.",
        },
        {
          status: 400,
        }
      );
    }

    const localeCandidates = getLocaleCandidates(request);

    const category = await prisma.category.findFirst({
      where: {
        isActive: true,
        OR: [{ slug: identifier }, { id: identifier }],
      },
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
              orderBy: [{ sortOrder: "asc" }, { procedureId: "asc" }],
              select: {
                procedure: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const categoryTranslation = getTranslation(
      category.translations,
      localeCandidates
    );

    return NextResponse.json({
      category: {
        id: category.id,
        slug: category.slug,
        href: category.href ?? `/categories/${category.slug}`,
        name: categoryTranslation?.name ?? category.id,
        description: categoryTranslation?.description ?? null,
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
            procedures: subcategory.procedureLinks.map(({ procedure }) => {
              const procedureTranslation = getTranslation(
                procedure.translations,
                localeCandidates
              );

              return {
                id: procedure.id,
                name: procedureTranslation?.name ?? procedure.id,
                description: procedureTranslation?.description ?? null,
              };
            }),
          };
        }),
      },
    });
  } catch (error) {
    console.error("Could not load public category:", error);

    return NextResponse.json(
      {
        error: "Could not load category.",
      },
      {
        status: 500,
      }
    );
  }
}