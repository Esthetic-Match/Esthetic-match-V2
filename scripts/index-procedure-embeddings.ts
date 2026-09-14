import { createHash } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 1536;

const REQUEST_DELAY_MS = 2000;
const MAX_RETRY_ATTEMPTS = 6;

type ExistingEmbeddingRow = {
  procedureId: string;
  contentHash: string;
};

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

function getLimit(): number | null {
  const index = process.argv.indexOf("--limit");

  if (index === -1) {
    return null;
  }

  const rawValue = process.argv[index + 1];

  const parsed = Number.parseInt(
    rawValue ?? "",
    10,
  );

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      "--limit must be a positive number.",
    );
  }

  return parsed;
}

function hashContent(
  content: string,
): string {
  return createHash("sha256")
    .update(content)
    .digest("hex");
}

function cleanText(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value.trim();

  return cleaned || null;
}

function buildProcedureContent(
  procedure: {
    id: string;

    translations: {
      localeCode: string;
      name: string;
      description: string | null;
    }[];

    subcategoryLinks: {
      subcategory: {
        id: string;

        translations: {
          localeCode: string;
          name: string;
          description: string | null;
        }[];

        category: {
          id: string;

          translations: {
            localeCode: string;
            name: string;
            description: string | null;
          }[];
        };
      };
    }[];
  },
): string {
  const lines: string[] = [];

  lines.push(
    "Represent this aesthetic medicine procedure for semantic retrieval based on patient concerns, goals, treatment interests, and desired outcomes.",
  );

  lines.push("");

  lines.push(
    `Procedure ID: ${procedure.id}`,
  );

  /*
   * Procedure translations
   */
  for (
    const translation of
    procedure.translations
  ) {
    const locale =
      translation.localeCode.toUpperCase();

    lines.push("");

    lines.push(
      `Procedure name (${locale}): ${translation.name}`,
    );

    const description = cleanText(
      translation.description,
    );

    if (description) {
      lines.push(
        `Procedure description (${locale}): ${description}`,
      );
    }
  }

  /*
   * Category / subcategory context
   */
  for (
    const link of
    procedure.subcategoryLinks
  ) {
    const subcategory =
      link.subcategory;

    const category =
      subcategory.category;

    lines.push("");

    lines.push(
      `Category ID: ${category.id}`,
    );

    for (
      const translation of
      category.translations
    ) {
      const locale =
        translation.localeCode.toUpperCase();

      lines.push(
        `Category (${locale}): ${translation.name}`,
      );

      const description = cleanText(
        translation.description,
      );

      if (description) {
        lines.push(
          `Category description (${locale}): ${description}`,
        );
      }
    }

    lines.push(
      `Subcategory ID: ${subcategory.id}`,
    );

    for (
      const translation of
      subcategory.translations
    ) {
      const locale =
        translation.localeCode.toUpperCase();

      lines.push(
        `Subcategory (${locale}): ${translation.name}`,
      );

      const description = cleanText(
        translation.description,
      );

      if (description) {
        lines.push(
          `Subcategory description (${locale}): ${description}`,
        );
      }
    }
  }

  return lines
    .join("\n")
    .trim();
}

function getErrorStatus(
  error: unknown,
): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const status = (
      error as {
        status?: unknown;
      }
    ).status;

    if (
      typeof status === "number"
    ) {
      return status;
    }
  }

  return undefined;
}

async function createEmbeddingWithRetry(
  ai: GoogleGenAI,
  content: string,
  procedureId: string,
): Promise<number[]> {
  for (
    let attempt = 1;
    attempt <= MAX_RETRY_ATTEMPTS;
    attempt++
  ) {
    try {
      const response =
        await ai.models.embedContent({
          model:
            EMBEDDING_MODEL,

          contents:
            content,

          config: {
            outputDimensionality:
              EMBEDDING_DIMENSIONS,
          },
        });

      const embedding =
        response.embeddings?.[0]
          ?.values;

      if (!embedding) {
        throw new Error(
          `Gemini returned no embedding for procedure "${procedureId}".`,
        );
      }

      if (
        embedding.length !==
        EMBEDDING_DIMENSIONS
      ) {
        throw new Error(
          `Unexpected embedding size for "${procedureId}". Expected ${EMBEDDING_DIMENSIONS}, received ${embedding.length}.`,
        );
      }

      return embedding;
    } catch (error: unknown) {
      const status =
        getErrorStatus(error);

      /*
       * Only automatically retry rate-limit /
       * temporary capacity errors.
       */
      if (
        status !== 429 ||
        attempt ===
          MAX_RETRY_ATTEMPTS
      ) {
        throw error;
      }

      /*
       * Exponential backoff:
       *
       * 2s
       * 4s
       * 8s
       * 16s
       * 32s
       *
       * capped at 60 seconds.
       */
      const waitMs =
        Math.min(
          60_000,
          2000 *
            2 **
              (attempt - 1),
        );

      console.log(
        `   ⚠️ Rate limited on "${procedureId}".`,
      );

      console.log(
        `   Waiting ${waitMs / 1000}s before retry ${attempt + 1}/${MAX_RETRY_ATTEMPTS}...`,
      );

      await sleep(waitMs);
    }
  }

  throw new Error(
    `Failed to generate embedding for "${procedureId}".`,
  );
}

async function main() {
  /*
   * Load .env before Prisma.
   */
  loadEnvConfig(
    process.cwd(),
    process.env.NODE_ENV !== "production",
  );

  /*
   * Dynamic import is required because
   * prisma.ts reads DB environment variables
   * immediately when imported.
   */
  const { prisma } = await import(
    "@/lib/database/prisma"
  );

  try {
    const apiKey =
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY or GOOGLE_API_KEY is not set.",
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const limit = getLimit();

    /*
     * Load active procedures with all
     * context needed for the embedding.
     */
    const procedures =
      await prisma.procedure.findMany({
        where: {
          isActive: true,
        },

        orderBy: {
          id: "asc",
        },

        ...(limit
          ? {
              take: limit,
            }
          : {}),

        select: {
          id: true,

          translations: {
            orderBy: {
              localeCode: "asc",
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

            orderBy: {
              sortOrder: "asc",
            },

            select: {
              subcategory: {
                select: {
                  id: true,

                  translations: {
                    orderBy: {
                      localeCode:
                        "asc",
                    },

                    select: {
                      localeCode:
                        true,

                      name:
                        true,

                      description:
                        true,
                    },
                  },

                  category: {
                    select: {
                      id: true,

                      translations: {
                        orderBy: {
                          localeCode:
                            "asc",
                        },

                        select: {
                          localeCode:
                            true,

                          name:
                            true,

                          description:
                            true,
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

    console.log(
      `Found ${procedures.length} active procedure(s).`,
    );

    if (
      procedures.length === 0
    ) {
      return;
    }

    /*
     * Load hashes only.
     *
     * We don't need to load vectors.
     */
    const existingRows =
      await prisma.$queryRaw<
        ExistingEmbeddingRow[]
      >`
        SELECT
          "procedureId",
          "contentHash"
        FROM "procedure_embedding"
      `;

    const existingHashByProcedure =
      new Map(
        existingRows.map(
          (row) => [
            row.procedureId,
            row.contentHash,
          ],
        ),
      );

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (
      const [
        index,
        procedure,
      ] of procedures.entries()
    ) {
      const position =
        `[${index + 1}/${procedures.length}]`;

      try {
        const content =
          buildProcedureContent(
            procedure,
          );

        const contentHash =
          hashContent(content);

        const existingHash =
          existingHashByProcedure.get(
            procedure.id,
          );

        /*
         * Already indexed and unchanged.
         */
        if (
          existingHash ===
          contentHash
        ) {
          skipped += 1;

          console.log(
            `${position} SKIP ${procedure.id}`,
          );

          continue;
        }

        console.log(
          `${position} EMBED ${procedure.id}`,
        );

        const embedding =
          await createEmbeddingWithRetry(
            ai,
            content,
            procedure.id,
          );

        /*
         * pgvector accepts:
         *
         * [0.123,-0.456,...]
         */
        const vector =
          `[${embedding.join(",")}]`;

        const existedBefore =
          existingHash !==
          undefined;

        /*
         * Prisma cannot directly write
         * Unsupported("vector"), so use
         * parameterized raw SQL.
         */
        await prisma.$executeRaw`
          INSERT INTO "procedure_embedding" (
            "procedureId",
            "content",
            "contentHash",
            "embeddingModel",
            "embedding",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${procedure.id},
            ${content},
            ${contentHash},
            ${EMBEDDING_MODEL},
            ${vector}::vector,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT ("procedureId")
          DO UPDATE SET
            "content" =
              EXCLUDED."content",

            "contentHash" =
              EXCLUDED."contentHash",

            "embeddingModel" =
              EXCLUDED."embeddingModel",

            "embedding" =
              EXCLUDED."embedding",

            "updatedAt" =
              CURRENT_TIMESTAMP
        `;

        /*
         * Update our in-memory hash map too.
         */
        existingHashByProcedure.set(
          procedure.id,
          contentHash,
        );

        if (existedBefore) {
          updated += 1;
        } else {
          created += 1;
        }

        console.log(
          `   ✅ Saved ${procedure.id}`,
        );

        /*
         * Intentionally throttle requests.
         *
         * We only have ~240 procedures, so
         * reliability is more important than
         * raw speed.
         */
        await sleep(
          REQUEST_DELAY_MS,
        );
      } catch (error: unknown) {
        failed += 1;

        console.error(
          `   ❌ Failed ${procedure.id}`,
        );

        console.error(error);

        /*
         * IMPORTANT:
         *
         * Don't kill the whole indexing run
         * because one procedure failed.
         *
         * Continue with the next procedure.
         */
        console.log(
          "   Continuing with next procedure...",
        );

        /*
         * Give the API some additional time
         * after a hard failure.
         */
        await sleep(5000);
      }
    }

    console.log("");
    console.log(
      "Procedure embedding indexing complete.",
    );

    console.table({
      total:
        procedures.length,

      created,
      updated,
      skipped,
      failed,
    });

    if (failed > 0) {
      console.log("");
      console.log(
        `${failed} procedure(s) failed. Run the script again later.`,
      );

      console.log(
        "Successfully indexed procedures will be skipped automatically.",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(
  (error: unknown) => {
    console.error(
      "Procedure embedding indexing failed:",
      error,
    );

    process.exitCode = 1;
  },
);