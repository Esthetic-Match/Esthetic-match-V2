import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import { prisma } from "@/lib/database/prisma";

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 1536;

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

type SearchRequestBody = {
  query?: unknown;
  locale?: unknown;
  limit?: unknown;
};

type VectorSearchRow = {
  procedureId: string;
  similarity: number;
};

function normalizeLocale(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "en";
  }

  return value
    .trim()
    .toLowerCase()
    .slice(0, 10);
}

function normalizeLimit(value: unknown): number {
  if (typeof value !== "number") {
    return DEFAULT_LIMIT;
  }

  if (!Number.isFinite(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(value)),
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as SearchRequestBody;

    const query =
      typeof body.query === "string"
        ? body.query.trim()
        : "";

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (query.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Query is too long. Maximum length is 2000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const locale =
      normalizeLocale(body.locale);

    const limit =
      normalizeLimit(body.limit);

    const apiKey =
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error(
        "Gemini API key is not configured.",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "AI service is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    /*
     * Create an embedding for the patient's query.
     *
     * IMPORTANT:
     * This must use the exact same model and
     * dimensions used when indexing procedures.
     */
    const embeddingResponse =
      await ai.models.embedContent({
        model: EMBEDDING_MODEL,

        contents: query,

        config: {
          outputDimensionality:
            EMBEDDING_DIMENSIONS,
        },
      });

    const embedding =
      embeddingResponse.embeddings?.[0]
        ?.values;

    if (!embedding) {
      throw new Error(
        "Gemini returned no query embedding.",
      );
    }

    if (
      embedding.length !==
      EMBEDDING_DIMENSIONS
    ) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} embedding dimensions, received ${embedding.length}.`,
      );
    }

    /*
     * pgvector accepts vectors in this format:
     *
     * [0.123,-0.456,...]
     */
    const vector =
      `[${embedding.join(",")}]`;

    /*
     * Cosine distance:
     *
     * embedding <=> queryVector
     *
     * Lower distance = more similar.
     *
     * Convert it to similarity:
     *
     * 1 - cosineDistance
     *
     * Higher similarity = better match.
     */
    const matches =
      await prisma.$queryRaw<
        VectorSearchRow[]
      >`
        SELECT
          pe."procedureId",
          (
            1 - (
              pe."embedding" <=> ${vector}::vector
            )
          )::float8 AS "similarity"
        FROM "procedure_embedding" pe
        INNER JOIN "procedure" p
          ON p."id" = pe."procedureId"
        WHERE
          p."isActive" = TRUE
        ORDER BY
          pe."embedding" <=> ${vector}::vector
        LIMIT ${limit}
      `;

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        results: [],
      });
    }

    const procedureIds =
      matches.map(
        (item) => item.procedureId,
      );

    /*
     * Retrieve normal procedure information
     * through Prisma.
     *
     * We deliberately don't join translation
     * tables inside the raw pgvector query.
     */
    const procedures =
      await prisma.procedure.findMany({
        where: {
          id: {
            in: procedureIds,
          },

          isActive: true,
        },

        select: {
          id: true,

          translations: {
            where: {
              localeCode: {
                in: Array.from(
                  new Set([
                    locale,
                    "en",
                  ]),
                ),
              },
            },

            select: {
              localeCode: true,
              name: true,
              description: true,
            },
          },

          subcategoryLinks: {
            where: {
              isActive: true,

              subcategory: {
                isActive: true,

                category: {
                  isActive: true,
                },
              },
            },

            select: {
              subcategory: {
                select: {
                  id: true,

                  translations: {
                    where: {
                      localeCode: {
                        in: Array.from(
                          new Set([
                            locale,
                            "en",
                          ]),
                        ),
                      },
                    },

                    select: {
                      localeCode:
                        true,
                      name: true,
                    },
                  },

                  category: {
                    select: {
                      id: true,

                      translations: {
                        where: {
                          localeCode: {
                            in: Array.from(
                              new Set([
                                locale,
                                "en",
                              ]),
                            ),
                          },
                        },

                        select: {
                          localeCode:
                            true,
                          name: true,
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

    const procedureMap =
      new Map(
        procedures.map(
          (procedure) => [
            procedure.id,
            procedure,
          ],
        ),
      );

    /*
     * Preserve pgvector's similarity ordering.
     */
    const results =
      matches
        .map((match) => {
          const procedure =
            procedureMap.get(
              match.procedureId,
            );

          if (!procedure) {
            return null;
          }

          const requestedTranslation =
            procedure.translations.find(
              (translation) =>
                translation.localeCode ===
                locale,
            );

          const englishTranslation =
            procedure.translations.find(
              (translation) =>
                translation.localeCode ===
                "en",
            );

          const translation =
            requestedTranslation ??
            englishTranslation ??
            procedure.translations[0] ??
            null;

          const categories =
            procedure.subcategoryLinks.map(
              (link) => {
                const category =
                  link.subcategory.category;

                const categoryTranslation =
                  category.translations.find(
                    (item) =>
                      item.localeCode ===
                      locale,
                  ) ??
                  category.translations.find(
                    (item) =>
                      item.localeCode ===
                      "en",
                  ) ??
                  category.translations[0] ??
                  null;

                return {
                  id: category.id,
                  name:
                    categoryTranslation?.name ??
                    category.id,
                };
              },
            );

          const subcategories =
            procedure.subcategoryLinks.map(
              (link) => {
                const subcategory =
                  link.subcategory;

                const subcategoryTranslation =
                  subcategory.translations.find(
                    (item) =>
                      item.localeCode ===
                      locale,
                  ) ??
                  subcategory.translations.find(
                    (item) =>
                      item.localeCode ===
                      "en",
                  ) ??
                  subcategory.translations[0] ??
                  null;

                return {
                  id: subcategory.id,
                  name:
                    subcategoryTranslation?.name ??
                    subcategory.id,
                };
              },
            );

          return {
            procedureId:
              procedure.id,

            name:
              translation?.name ??
              procedure.id,

            description:
              translation?.description ??
              null,

            similarity:
              match.similarity,

            categories:
              Array.from(
                new Map(
                  categories.map(
                    (category) => [
                      category.id,
                      category,
                    ],
                  ),
                ).values(),
              ),

            subcategories:
              Array.from(
                new Map(
                  subcategories.map(
                    (subcategory) => [
                      subcategory.id,
                      subcategory,
                    ],
                  ),
                ).values(),
              ),
          };
        })
        .filter(
          (
            result,
          ): result is NonNullable<
            typeof result
          > => result !== null,
        );

    return NextResponse.json({
      success: true,
      query,
      locale,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Failed to search procedures:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to search procedures.",
      },
      {
        status: 500,
      },
    );
  }
}