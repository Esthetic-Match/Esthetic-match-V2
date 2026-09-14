import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

type ProcedureMatchInput = {
  procedureId?: unknown;
  similarity?: unknown;
};

type SearchDoctorsBody = {
  procedures?: unknown;
  locale?: unknown;
  limit?: unknown;

  city?: unknown;
  country?: unknown;
  onlineOnly?: unknown;
};

type NormalizedProcedureMatch = {
  procedureId: string;
  similarity: number;
};

function normalizeLocale(
  value: unknown,
): string {
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

function normalizeLimit(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Math.floor(value),
    ),
  );
}

function normalizeOptionalString(
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

function normalizeProcedureMatches(
  value: unknown,
): NormalizedProcedureMatch[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const matches =
    value
      .map(
        (
          item,
        ): NormalizedProcedureMatch | null => {
          if (
            typeof item !== "object" ||
            item === null
          ) {
            return null;
          }

          const candidate =
            item as ProcedureMatchInput;

          if (
            typeof candidate.procedureId !==
              "string" ||
            !candidate.procedureId.trim()
          ) {
            return null;
          }

          const similarity =
            typeof candidate.similarity ===
              "number" &&
            Number.isFinite(
              candidate.similarity,
            )
              ? candidate.similarity
              : 1;

          return {
            procedureId:
              candidate.procedureId.trim(),

            similarity:
              Math.max(
                0,
                Math.min(
                  1,
                  similarity,
                ),
              ),
          };
        },
      )
      .filter(
        (
          item,
        ): item is NormalizedProcedureMatch =>
          item !== null,
      );

  /*
   * Remove duplicates while keeping
   * the highest similarity for each
   * procedure.
   */
  const unique =
    new Map<
      string,
      NormalizedProcedureMatch
    >();

  for (
    const match of matches
  ) {
    const existing =
      unique.get(
        match.procedureId,
      );

    if (
      !existing ||
      match.similarity >
        existing.similarity
    ) {
      unique.set(
        match.procedureId,
        match,
      );
    }
  }

  return Array.from(
    unique.values(),
  );
}

function getTopRankScore(
  topRank: number | null,
): number {
  if (topRank === 1) {
    return 1;
  }

  if (topRank === 2) {
    return 0.7;
  }

  if (topRank === 3) {
    return 0.4;
  }

  return 0;
}

function getAverage(
  values: number[],
): number | null {
  if (
    values.length === 0
  ) {
    return null;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    values.length
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as SearchDoctorsBody;

    const procedureMatches =
      normalizeProcedureMatches(
        body.procedures,
      );

    if (
      procedureMatches.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "At least one procedure match is required.",
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

    const limit =
      normalizeLimit(
        body.limit,
      );

    const city =
      normalizeOptionalString(
        body.city,
      );

    const country =
      normalizeOptionalString(
        body.country,
      );

    const onlineOnly =
      body.onlineOnly === true;

    const procedureIds =
      procedureMatches.map(
        (item) =>
          item.procedureId,
      );

    const similarityByProcedure =
      new Map(
        procedureMatches.map(
          (item) => [
            item.procedureId,
            item.similarity,
          ],
        ),
      );

    /*
     * Sum of all semantic similarities.
     *
     * We use this to calculate how much
     * of the user's procedure intent each
     * doctor covers.
     */
    const totalPossibleSimilarity =
      procedureMatches.reduce(
        (sum, item) =>
          sum +
          item.similarity,
        0,
      );

    /*
     * Candidate doctors:
     *
     * Must offer at least one of the
     * retrieved procedures.
     */
    const doctors =
      await prisma.doctorProfile.findMany({
        where: {
          procedures: {
            some: {
              procedureId: {
                in: procedureIds,
              },
            },
          },

          ...(city
            ? {
                city: {
                  equals: city,
                  mode: "insensitive",
                },
              }
            : {}),

          ...(country
            ? {
                country: {
                  equals:
                    country,
                  mode:
                    "insensitive",
                },
              }
            : {}),

          ...(onlineOnly
            ? {
                onlineActive:
                  true,
              }
            : {}),
        },

        select: {
          id: true,
          userId: true,
          slug: true,

          avatar: true,
          clinicName: true,

          yearsOfExperience:
            true,

          city: true,
          country: true,

          currency: true,

          inClinicPrice: true,
          onlineConsulPrice:
            true,

          onlineActive: true,

          googleRating: true,
          googleReviewCount:
            true,

          user: {
            select: {
              name: true,
            },
          },

          reviews: {
            select: {
              rating: true,
            },
          },

          procedures: {
            where: {
              procedureId: {
                in: procedureIds,
              },
            },

            select: {
              procedureId: true,
              topRank: true,
              price: true,

              procedure: {
                select: {
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
      });

    const rankedDoctors =
      doctors.map(
        (doctor) => {
          /*
           * ─────────────────────────────
           * PROCEDURE MATCH SCORE
           * ─────────────────────────────
           *
           * Example:
           *
           * query matches:
           *
           * tummy tuck       0.74
           * mommy makeover   0.70
           * body lift        0.69
           *
           * A doctor offering more of
           * these procedures receives
           * better coverage.
           */
          let matchedSimilarity =
            0;

          let bestTopRankScore =
            0;

          const matchedProcedures =
            doctor.procedures.map(
              (
                doctorProcedure,
              ) => {
                const similarity =
                  similarityByProcedure.get(
                    doctorProcedure.procedureId,
                  ) ?? 0;

                matchedSimilarity +=
                  similarity;

                const topRankScore =
                  getTopRankScore(
                    doctorProcedure.topRank,
                  );

                bestTopRankScore =
                  Math.max(
                    bestTopRankScore,
                    topRankScore,
                  );

                const translations =
                  doctorProcedure
                    .procedure
                    .translations;

                const translation =
                  translations.find(
                    (item) =>
                      item.localeCode ===
                      locale,
                  ) ??
                  translations.find(
                    (item) =>
                      item.localeCode ===
                      "en",
                  ) ??
                  translations[0] ??
                  null;

                return {
                  procedureId:
                    doctorProcedure.procedureId,

                  name:
                    translation?.name ??
                    doctorProcedure.procedureId,

                  similarity,

                  topRank:
                    doctorProcedure.topRank,

                  price:
                    doctorProcedure.price
                      ? Number(
                          doctorProcedure.price,
                        )
                      : null,
                };
              },
            );

          /*
           * 0 → 1
           *
           * Measures how much of the
           * retrieved semantic intent
           * this doctor covers.
           */
          const procedureMatchScore =
            totalPossibleSimilarity >
            0
              ? Math.min(
                  1,
                  matchedSimilarity /
                    totalPossibleSimilarity,
                )
              : 0;

          /*
           * ─────────────────────────────
           * EXPERIENCE SCORE
           * ─────────────────────────────
           *
           * 20+ years = maximum.
           */
          const experienceScore =
            Math.min(
              1,
              Math.max(
                0,
                (
                  doctor.yearsOfExperience ??
                  0
                ) / 20,
              ),
            );

          /*
           * ─────────────────────────────
           * ESTHETIC MATCH REVIEWS
           * ─────────────────────────────
           */
          const emRatings =
            doctor.reviews.map(
              (review) =>
                review.rating,
            );

          const emRating =
            getAverage(
              emRatings,
            );

          const emReviewCount =
            emRatings.length;

          /*
           * ─────────────────────────────
           * REVIEW SCORE
           * ─────────────────────────────
           *
           * Combine EM + Google ratings
           * using their review counts.
           */
          const googleRating =
            doctor.googleRating;

          const googleReviewCount =
            doctor.googleReviewCount ??
            0;

          let reviewScore = 0;

          const totalReviewCount =
            emReviewCount +
            googleReviewCount;

          if (
            totalReviewCount >
            0
          ) {
            const emPoints =
              (emRating ?? 0) *
              emReviewCount;

            const googlePoints =
              (googleRating ??
                0) *
              googleReviewCount;

            const combinedRating =
              (emPoints +
                googlePoints) /
              totalReviewCount;

            /*
             * Ratings are out of 5.
             */
            reviewScore =
              Math.min(
                1,
                Math.max(
                  0,
                  combinedRating /
                    5,
                ),
              );
          }

          /*
           * ─────────────────────────────
           * FINAL SCORE
           * ─────────────────────────────
           *
           * Procedure relevance dominates.
           *
           * 65% matched procedures
           * 15% doctor top-three expertise
           * 10% reviews
           * 10% experience
           */
          const finalScore =
            procedureMatchScore *
              0.65 +
            bestTopRankScore *
              0.15 +
            reviewScore *
              0.1 +
            experienceScore *
              0.1;

          /*
           * Sort matched procedures by
           * semantic relevance.
           */
          matchedProcedures.sort(
            (left, right) =>
              right.similarity -
              left.similarity,
          );

          return {
            doctorProfileId:
              doctor.id,

            userId:
              doctor.userId,

            slug:
              doctor.slug,

            name:
              doctor.user.name,

            avatar:
              doctor.avatar,

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

            currency:
              doctor.currency,

            inClinicPrice:
              doctor.inClinicPrice,

            onlineConsulPrice:
              doctor.onlineConsulPrice,

            googleRating:
              doctor.googleRating,

            googleReviewCount:
              doctor.googleReviewCount,

            emRating,

            emReviewCount,

            matchedProcedureCount:
              matchedProcedures.length,

            matchedProcedures,

            /*
             * Useful while we're testing
             * ranking quality.
             */
            score:
              finalScore,

            scoreBreakdown: {
              procedureMatch:
                procedureMatchScore,

              topThree:
                bestTopRankScore,

              reviews:
                reviewScore,

              experience:
                experienceScore,
            },
          };
        },
      );

    rankedDoctors.sort(
      (left, right) =>
        right.score -
        left.score,
    );

    const results =
      rankedDoctors.slice(
        0,
        limit,
      );

    return NextResponse.json({
      success: true,

      filters: {
        city,
        country,
        onlineOnly,
      },

      searchedProcedures:
        procedureMatches,

      candidateCount:
        doctors.length,

      count:
        results.length,

      results,
    });
  } catch (error) {
    console.error(
      "Failed to search doctors:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to search doctors.",
      },
      {
        status: 500,
      },
    );
  }
}