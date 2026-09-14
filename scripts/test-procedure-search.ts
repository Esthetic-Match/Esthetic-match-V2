import { loadEnvConfig } from "@next/env";
import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 1536;

type SearchResult = {
  procedureId: string;
  content: string;
  similarity: number;
};

async function main() {
  loadEnvConfig(
    process.cwd(),
    process.env.NODE_ENV !== "production",
  );

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

    const query = process.argv
      .slice(2)
      .join(" ")
      .trim();

    if (!query) {
      throw new Error(
        'Please provide a search query. Example: npx tsx scripts/test-procedure-search.ts "I have loose skin on my stomach"',
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    console.log("");
    console.log(`Searching for: "${query}"`);
    console.log("");

    /*
     * Turn the patient's query into
     * the SAME 1536-dimensional vector
     * format used for our procedures.
     */
    const response =
      await ai.models.embedContent({
        model: EMBEDDING_MODEL,

        contents: query,

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
        "Gemini returned no query embedding.",
      );
    }

    if (
      embedding.length !==
      EMBEDDING_DIMENSIONS
    ) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions but received ${embedding.length}.`,
      );
    }

    const vector =
      `[${embedding.join(",")}]`;

    /*
     * <=> is pgvector cosine distance.
     *
     * Smaller distance = closer match.
     *
     * We convert it to similarity:
     *
     * similarity = 1 - cosine distance
     *
     * Higher similarity = better match.
     */
    const results =
      await prisma.$queryRaw<
        SearchResult[]
      >`
        SELECT
          "procedureId",
          "content",
          (
            1 - (
              "embedding" <=> ${vector}::vector
            )
          )::float8 AS "similarity"
        FROM "procedure_embedding"
        ORDER BY
          "embedding" <=> ${vector}::vector
        LIMIT 5
      `;

    console.log(
      "Top matching procedures:",
    );

    console.log("");

    for (
      const [
        index,
        result,
      ] of results.entries()
    ) {
      console.log(
        `${index + 1}. ${result.procedureId}`,
      );

      console.log(
        `   Similarity: ${result.similarity.toFixed(4)}`,
      );

      console.log("");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(
  (error: unknown) => {
    console.error(
      "Procedure search failed:",
      error,
    );

    process.exitCode = 1;
  },
);