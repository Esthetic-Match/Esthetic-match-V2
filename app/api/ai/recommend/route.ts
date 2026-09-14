import {
  NextRequest,
  NextResponse,
} from "next/server";

import { GoogleGenAI } from "@google/genai";

const CHAT_MODEL = "gemini-3.6-flash";

const DEFAULT_PROCEDURE_LIMIT = 5;
const DEFAULT_DOCTOR_LIMIT = 5;

type RecommendRequestBody = {
  query?: unknown;
  locale?: unknown;

  city?: unknown;
  country?: unknown;
  onlineOnly?: unknown;

  procedureLimit?: unknown;
  doctorLimit?: unknown;
};

type ProcedureSearchResult = {
  procedureId: string;
  name: string;
  description: string | null;
  similarity: number;

  categories: {
    id: string;
    name: string;
  }[];

  subcategories: {
    id: string;
    name: string;
  }[];
};

type ProcedureSearchResponse = {
  success: boolean;
  query?: string;
  locale?: string;
  count?: number;
  results?: ProcedureSearchResult[];
  error?: string;
};

type DoctorSearchResult = {
  doctorProfileId: string;
  userId: string;

  slug: string | null;

  name: string | null;
  avatar: string | null;

  clinicName: string | null;

  city: string | null;
  country: string | null;

  yearsOfExperience: number | null;

  onlineActive: boolean;

  currency: string;

  inClinicPrice: number | null;
  onlineConsulPrice: number | null;

  googleRating: number | null;
  googleReviewCount: number | null;

  emRating: number | null;
  emReviewCount: number;

  matchedProcedureCount: number;

  matchedProcedures: {
    procedureId: string;
    name: string;
    similarity: number;
    topRank: number | null;
    price: number | null;
  }[];

  score: number;

  scoreBreakdown: {
    procedureMatch: number;
    topThree: number;
    reviews: number;
    experience: number;
  };
};

type DoctorSearchResponse = {
  success: boolean;

  filters?: {
    city: string | null;
    country: string | null;
    onlineOnly: boolean;
  };

  candidateCount?: number;
  count?: number;

  results?: DoctorSearchResult[];

  error?: string;
};

function normalizeString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed || null;
}

function normalizeLocale(
  value: unknown,
): string {
  const locale =
    normalizeString(value);

  if (!locale) {
    return "en";
  }

  return locale
    .toLowerCase()
    .slice(0, 10);
}

function normalizeLimit(
  value: unknown,
  fallback: number,
  max: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(
      1,
      Math.floor(value),
    ),
  );
}

async function postInternal<T>(
  request: NextRequest,
  path: string,
  body: unknown,
): Promise<T> {
  const url =
    new URL(
      path,
      request.nextUrl.origin,
    );

  const response =
    await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(body),

      cache: "no-store",
    });

  const data =
    (await response.json()) as T;

  if (!response.ok) {
    throw new Error(
      `Internal API ${path} returned ${response.status}.`,
    );
  }

  return data;
}

function buildGroundingContext(
  query: string,
  procedures: ProcedureSearchResult[],
  doctors: DoctorSearchResult[],
) {
  /*
   * Keep the LLM context compact.
   *
   * Gemini does NOT need all internal
   * scoreBreakdown information to write
   * the patient-facing explanation.
   */
  const procedureContext =
    procedures
      .slice(0, 5)
      .map(
        (
          procedure,
          index,
        ) => ({
          rank:
            index + 1,

          id:
            procedure.procedureId,

          name:
            procedure.name,

          description:
            procedure.description,

          similarity:
            Number(
              procedure.similarity.toFixed(
                4,
              ),
            ),

          categories:
            procedure.categories.map(
              (item) =>
                item.name,
            ),

          subcategories:
            procedure.subcategories.map(
              (item) =>
                item.name,
            ),
        }),
      );

  const doctorContext =
    doctors
      .slice(0, 5)
      .map(
        (
          doctor,
          index,
        ) => ({
          rank:
            index + 1,

          doctorProfileId:
            doctor.doctorProfileId,

          slug:
            doctor.slug,

          name:
            doctor.name,

          clinicName:
            doctor.clinicName,

          city:
            doctor.city,

          country:
            doctor.country,

          yearsOfExperience:
            doctor.yearsOfExperience,

          onlineActive:
            doctor.onlineActive,

          googleRating:
            doctor.googleRating,

          googleReviewCount:
            doctor.googleReviewCount,

          emRating:
            doctor.emRating,

          emReviewCount:
            doctor.emReviewCount,

          matchedProcedures:
            doctor.matchedProcedures.map(
              (procedure) => ({
                id:
                  procedure.procedureId,

                name:
                  procedure.name,

                topRank:
                  procedure.topRank,

                price:
                  procedure.price,
              }),
            ),
        }),
      );

  return {
    patientConcern: query,

    procedures:
      procedureContext,

    doctors:
      doctorContext,
  };
}

function getLanguageInstruction(
  locale: string,
): string {
  if (
    locale.startsWith("fr")
  ) {
    return (
      "Respond in French."
    );
  }

  return "Respond in English.";
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as RecommendRequestBody;

    const query =
      normalizeString(
        body.query,
      );

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Query is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      query.length > 2000
    ) {
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
      normalizeLocale(
        body.locale,
      );

    const city =
      normalizeString(
        body.city,
      );

    const country =
      normalizeString(
        body.country,
      );

    const onlineOnly =
      body.onlineOnly ===
      true;

    const procedureLimit =
      normalizeLimit(
        body.procedureLimit,
        DEFAULT_PROCEDURE_LIMIT,
        10,
      );

    const doctorLimit =
      normalizeLimit(
        body.doctorLimit,
        DEFAULT_DOCTOR_LIMIT,
        10,
      );

    /*
     * ────────────────────────────────
     * STEP 1
     * Semantic procedure retrieval
     * ────────────────────────────────
     */
    const procedureResponse =
      await postInternal<ProcedureSearchResponse>(
        request,

        "/api/ai/search-procedures",

        {
          query,
          locale,
          limit:
            procedureLimit,
        },
      );

    if (
      !procedureResponse.success
    ) {
      throw new Error(
        procedureResponse.error ??
          "Procedure search failed.",
      );
    }

    const procedures =
      procedureResponse.results ??
      [];

    /*
     * Nothing useful was retrieved.
     */
    if (
      procedures.length === 0
    ) {
      return NextResponse.json({
        success: true,

        query,

        locale,

        answer:
          "I couldn't find a relevant procedure in the current Esthetic Match catalogue for this concern.",

        procedures: [],

        doctors: [],
      });
    }

    /*
     * ────────────────────────────────
     * STEP 2
     * Doctor retrieval
     * ────────────────────────────────
     *
     * Feed semantic procedure results
     * into the normalized doctor matcher.
     */
    const doctorResponse =
      await postInternal<DoctorSearchResponse>(
        request,

        "/api/ai/search-doctors",

        {
          procedures:
            procedures.map(
              (
                procedure,
              ) => ({
                procedureId:
                  procedure.procedureId,

                similarity:
                  procedure.similarity,
              }),
            ),

          locale,

          city,
          country,
          onlineOnly,

          limit:
            doctorLimit,
        },
      );

    if (
      !doctorResponse.success
    ) {
      throw new Error(
        doctorResponse.error ??
          "Doctor search failed.",
      );
    }

    const doctors =
      doctorResponse.results ??
      [];

    /*
     * ────────────────────────────────
     * STEP 3
     * Grounded Gemini explanation
     * ────────────────────────────────
     */

    const apiKey =
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      /*
       * Retrieval still worked.
       *
       * Return the actual results even
       * if generation isn't configured.
       */
      return NextResponse.json({
        success: true,

        query,
        locale,

        answer: null,

        warning:
          "Gemini API key is not configured. Retrieval completed without AI explanation.",

        procedures,
        doctors,
      });
    }

    const ai =
      new GoogleGenAI({
        apiKey,
      });

    const groundingContext =
      buildGroundingContext(
        query,
        procedures,
        doctors,
      );


type GeneratedRecommendation = {
  answer: string;

  procedureInsights: {
    procedureId: string;
    description: string;
  }[];
};

let answer: string | null =
  null;

let procedureInsights: {
  procedureId: string;
  description: string;
}[] = [];

let generationWarning:
  | string
  | null = null;

try {
  const response =
    await ai.models.generateContent({
      model: CHAT_MODEL,

      contents: `
PATIENT MESSAGE:

${query}


RETRIEVED ESTHETIC MATCH DATA:

${JSON.stringify(
  groundingContext,
  null,
  2,
)}
      `.trim(),

      config: {
        responseMimeType:
          "application/json",

        responseSchema: {
          type: "object",

          properties: {
            answer: {
              type: "string",
              description:
                "A concise overall response to the patient's concern. Do not list doctors or procedures here in detail because they will be displayed separately.",
            },

            procedureInsights: {
              type: "array",

              items: {
                type: "object",

                properties: {
                  procedureId: {
                    type: "string",
                    description:
                      "The exact procedure ID from the retrieved data.",
                  },

                  description: {
                    type: "string",
                    description:
                      "A concise patient-friendly explanation, ideally 1-3 sentences, explaining why this specific procedure may be relevant to the concern.",
                  },
                },

                required: [
                  "procedureId",
                  "description",
                ],
              },
            },
          },

          required: [
            "answer",
            "procedureInsights",
          ],
        },

        systemInstruction: `
You are Lumi, the Esthetic Match educational assistant.

Use ONLY the procedures and doctors supplied in the retrieved Esthetic Match data.

The interface will separately display procedure cards and doctor cards.

Therefore:

- The "answer" should be a concise overall explanation of the user's concern and the general treatment direction.
- Do not repeat a long list of procedures inside the answer.
- Do not repeat a long list of doctors inside the answer.
- Keep the answer clear, warm, elegant and useful.
- Do not diagnose.
- Do not guarantee results.
- Do not claim a procedure is definitely suitable.
- Never invent procedures or doctors.

For "procedureInsights":

- Return one item for each of the most relevant retrieved procedures.
- procedureId MUST exactly match a procedure ID supplied in the retrieved data.
- Each description should explain why that procedure may relate to THIS user's concern.
- Keep each description concise: roughly 1-3 sentences.
- Do not provide generic catalogue copy.
- Do not claim medical suitability.
- Do not invent benefits unsupported by the retrieved data.

${getLanguageInstruction(locale)}
        `.trim(),
      },
    });

  if (!response.text) {
    throw new Error(
      "Gemini returned no response.",
    );
  }

  const generated =
    JSON.parse(
      response.text,
    ) as GeneratedRecommendation;

  answer =
    generated.answer?.trim() ||
    null;

  const validProcedureIds =
    new Set(
      procedures.map(
        (procedure) =>
          procedure.procedureId,
      ),
    );

  procedureInsights =
    (
      generated.procedureInsights ??
      []
    ).filter(
      (insight) =>
        validProcedureIds.has(
          insight.procedureId,
        ) &&
        Boolean(
          insight.description?.trim(),
        ),
    );
} catch (error) {
  console.error(
    "Gemini recommendation generation failed:",
    error,
  );

  generationWarning =
    "Procedure and doctor retrieval succeeded, but the AI explanation could not be generated.";
}

    return NextResponse.json({
      success: true,

      query,
      locale,

      answer,
      procedureInsights,

      ...(generationWarning
        ? {
            warning:
              generationWarning,
          }
        : {}),

      retrieval: {
        procedureCount:
          procedures.length,

        doctorCount:
          doctors.length,

        doctorCandidateCount:
          doctorResponse.candidateCount ??
          doctors.length,
      },

      procedures,
      doctors,
    });
  } catch (error) {
    console.error(
      "AI recommendation failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Failed to generate recommendations.",
      },
      {
        status: 500,
      },
    );
  }
}