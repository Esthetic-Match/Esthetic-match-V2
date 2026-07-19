"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ChevronDown,
  ExternalLink,
  Star,
  Loader2,
  MapPin,
  MessageSquareQuote,
  RefreshCcw,
} from "lucide-react";
import {
  useFormatter,
  useTranslations,
} from "next-intl";

type RatingValue = 1 | 2 | 3 | 4 | 5;

type RatingDistribution = Record<
  RatingValue,
  number
>;

type DoctorReview = {
  id: string;
  title: string;
  review: string;
  rating: RatingValue;
  createdAt: string;
  patient: {
    name: string | null;
  };
};

type GoogleReviewsStatus =
  | "available"
  | "summary_only"
  | "not_connected";

type GoogleReview = {
  id: string;
  text: string;
  originalText: string | null;
  rating: number;
  publishTime: string | null;
  relativePublishTime: string | null;
  googleMapsUri: string | null;
  author: {
    name: string;
    uri: string | null;
    photoUri: string | null;
  };
};

type DoctorReviewsResponse = {
  summary: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: RatingDistribution;
  };
  reviews: DoctorReview[];
  google: {
    status: GoogleReviewsStatus;
    averageRating: number | null;
    totalReviews: number;
    mapsUri: string | null;
    reviews: GoogleReview[];
  };
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === "string" ? value : null;
}

function isRatingValue(
  value: unknown
): value is RatingValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function parsePatient(
  value: unknown
): DoctorReview["patient"] | null {
  if (!isRecord(value)) return null;

  if (
    value.name !== null &&
    typeof value.name !== "string"
  ) {
    return null;
  }

  return {
    name: value.name,
  };
}

function parseReview(
  value: unknown
): DoctorReview | null {
  if (!isRecord(value)) return null;

  const patient = parsePatient(value.patient);

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.review !== "string" ||
    !isRatingValue(value.rating) ||
    typeof value.createdAt !== "string" ||
    !patient
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    review: value.review,
    rating: value.rating,
    createdAt: value.createdAt,
    patient,
  };
}

function parseRatingDistribution(
  value: unknown
): RatingDistribution | null {
  if (!isRecord(value)) return null;

  const ratings: RatingValue[] = [1, 2, 3, 4, 5];

  for (const rating of ratings) {
    if (
      typeof value[String(rating)] !== "number"
    ) {
      return null;
    }
  }

  return {
    1: value["1"] as number,
    2: value["2"] as number,
    3: value["3"] as number,
    4: value["4"] as number,
    5: value["5"] as number,
  };
}

function parseGoogleAuthor(
  value: unknown
): GoogleReview["author"] | null {
  if (!isRecord(value)) return null;

  if (typeof value.name !== "string") {
    return null;
  }

  return {
    name: value.name,
    uri: readNullableString(value.uri),
    photoUri: readNullableString(
      value.photoUri
    ),
  };
}

function parseGoogleReview(
  value: unknown
): GoogleReview | null {
  if (!isRecord(value)) return null;

  const author = parseGoogleAuthor(
    value.author
  );

  if (
    typeof value.id !== "string" ||
    typeof value.text !== "string" ||
    typeof value.rating !== "number" ||
    !author
  ) {
    return null;
  }

  return {
    id: value.id,
    text: value.text,
    originalText: readNullableString(
      value.originalText
    ),
    rating: value.rating,
    publishTime: readNullableString(
      value.publishTime
    ),
    relativePublishTime: readNullableString(
      value.relativePublishTime
    ),
    googleMapsUri: readNullableString(
      value.googleMapsUri
    ),
    author,
  };
}

function isGoogleReviewsStatus(
  value: unknown
): value is GoogleReviewsStatus {
  return (
    value === "available" ||
    value === "summary_only" ||
    value === "not_connected"
  );
}

function parseGoogleReviews(
  value: unknown
): DoctorReviewsResponse["google"] | null {
  if (
    !isRecord(value) ||
    !isGoogleReviewsStatus(value.status) ||
    typeof value.totalReviews !== "number" ||
    !Array.isArray(value.reviews)
  ) {
    return null;
  }

  if (
    value.averageRating !== null &&
    typeof value.averageRating !== "number"
  ) {
    return null;
  }

  const reviews = value.reviews
    .map(parseGoogleReview)
    .filter(
      (review): review is GoogleReview =>
        review !== null
    );

  if (reviews.length !== value.reviews.length) {
    return null;
  }

  return {
    status: value.status,
    averageRating: value.averageRating,
    totalReviews: value.totalReviews,
    mapsUri: readNullableString(value.mapsUri),
    reviews,
  };
}

function parseDoctorReviewsResponse(
  value: unknown
): DoctorReviewsResponse | null {
  if (
    !isRecord(value) ||
    !isRecord(value.summary)
  ) {
    return null;
  }

  const ratingDistribution =
    parseRatingDistribution(
      value.summary.ratingDistribution
    );

  const google = parseGoogleReviews(
    value.google
  );

  if (
    typeof value.summary.totalReviews !==
      "number" ||
    typeof value.summary.averageRating !==
      "number" ||
    !ratingDistribution ||
    !Array.isArray(value.reviews) ||
    !google
  ) {
    return null;
  }

  const reviews = value.reviews
    .map(parseReview)
    .filter(
      (review): review is DoctorReview =>
        review !== null
    );

  if (reviews.length !== value.reviews.length) {
    return null;
  }

  return {
    summary: {
      totalReviews:
        value.summary.totalReviews,
      averageRating:
        value.summary.averageRating,
      ratingDistribution,
    },
    reviews,
    google,
  };
}

function RatingStars({
  rating,
  label,
  compact = false,
}: {
  rating: number;
  label: string;
  compact?: boolean;
}) {
  const stars: RatingValue[] = [1, 2, 3, 4, 5];
  const size = compact ? 17 : 24;

  const clampedRating = Math.max(
    0,
    Math.min(5, rating)
  );

  const roundedRating =
    Math.round(clampedRating * 2) / 2;

  const fullStars = Math.floor(roundedRating);
  const hasHalfStar =
    roundedRating - fullStars === 0.5;

  return (
    <div
      className="flex items-center gap-1"
      aria-label={label}
      title={label}
    >
      {stars.map((star) => {
        const isFull = star <= fullStars;

        const isHalf =
          star === fullStars + 1 &&
          hasHalfStar;

        if (isFull) {
          return (
            <Star
              key={star}
              size={size}
              className="shrink-0 fill-[#D8BD8D] text-[#D8BD8D]"
              aria-hidden="true"
            />
          );
        }

        if (isHalf) {
          return (
            <span
              key={star}
              className="relative block shrink-0"
              style={{
                width: size,
                height: size,
              }}
            >
              <Star
                size={size}
                className="absolute inset-0 text-[#283C5D]/20"
                aria-hidden="true"
              />

              <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                <Star
                  size={size}
                  className="absolute left-0 top-0 fill-[#D8BD8D] text-[#D8BD8D]"
                  aria-hidden="true"
                />
              </span>
            </span>
          );
        }

        return (
          <Star
            key={star}
            size={size}
            className="shrink-0 text-[#283C5D]/20"
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

function getInitials(
  name: string | null,
  fallback: string
): string {
  if (!name?.trim()) {
    return fallback
      .slice(0, 1)
      .toUpperCase();
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#283C5D]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#283C5D] shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
        alt=""
        className="h-4 w-4"
      />
      Google
    </span>
  );
}

export default function DoctorReviewDash() {
  const t = useTranslations(
    "mainDashboard.doctorReviews"
  );
  const format = useFormatter();

  const [data, setData] =
    useState<DoctorReviewsResponse | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadReviews =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          "/api/dashboard/doctor/reviews",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const payload: unknown =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(t("loadError"));
        }

        const parsedPayload =
          parseDoctorReviewsResponse(payload);

        if (!parsedPayload) {
          throw new Error(t("loadError"));
        }

        setData(parsedPayload);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t("loadError")
        );
      } finally {
        setIsLoading(false);
      }
    }, [t]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const ratings: RatingValue[] = [
    5, 4, 3, 2, 1,
  ];

  const totalReviews =
    data?.summary.totalReviews ?? 0;

  const google = data?.google;

  return (
    <section className="relative mt-4 flex h-[980px] flex-col overflow-hidden rounded-3xl border border-[#283C5D]/10 bg-white p-6 shadow-lg shadow-[#283C5D]/5 md:p-8 lg:h-[920px]">
      <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-[#D8BD8D] shadow-md">
              <MessageSquareQuote
                size={22}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8BD8D]">
                {t("eyebrow")}
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#283C5D]">
                {t("title")}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#283C5D]/60">
                {t("description")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadReviews()
            }
            disabled={isLoading}
            aria-label={t("refresh")}
            title={t("refresh")}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-[#283C5D] transition hover:border-[#D8BD8D] hover:bg-[#283C5D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2
                size={17}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <RefreshCcw
                size={17}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadReviews()
              }
              className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D]"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl bg-[#283C5D] p-6 text-white">
                <div className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-[#D8BD8D]/20 blur-2xl" />

                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                    {t(
                      "estheticMatchAverageRating"
                    )}
                  </p>

                  {isLoading ? (
                    <div className="mt-5 h-14 w-32 animate-pulse rounded-2xl bg-white/10" />
                  ) : (
                    <div className="mt-4 flex items-end gap-2">
                      <p className="text-5xl font-semibold tracking-tight text-[#D8BD8D] md:text-6xl">
                        {data?.summary.averageRating.toFixed(
                          1
                        )}
                      </p>

                      <span className="pb-2 text-sm font-medium text-white/45">
                        {t("outOfFive")}
                      </span>
                    </div>
                  )}

                  <div className="mt-5">
                    <RatingStars
                      rating={
                        data?.summary.averageRating ??
                        0
                      }
                      label={t(
                        "ratingLabel",
                        {
                          rating:
                            data?.summary.averageRating.toFixed(
                              1
                            ) ?? "0.0",
                        }
                      )}
                    />
                  </div>

                  <p className="mt-5 text-sm leading-6 text-white/65">
                    {isLoading
                      ? t("loading")
                      : t("reviewCount", {
                          count:
                            totalReviews,
                        })}
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/45">
                      {t(
                        "googleAverageRating"
                      )}
                    </p>

                    {isLoading ? (
                      <div className="mt-5 h-14 w-32 animate-pulse rounded-2xl bg-[#283C5D]/10" />
                    ) : (
                      <div className="mt-4 flex items-end gap-2">
                        <p className="text-5xl font-semibold tracking-tight text-[#283C5D] md:text-6xl">
                          {google?.averageRating !==
                          null
                            ? google?.averageRating.toFixed(
                                1
                              )
                            : "—"}
                        </p>

                        <span className="pb-2 text-sm font-medium text-[#283C5D]/40">
                          {t("outOfFive")}
                        </span>
                      </div>
                    )}
                  </div>

                  <GoogleBadge />
                </div>

                <div className="mt-5">
                  <RatingStars
                    rating={
                      google?.averageRating ?? 0
                    }
                    label={t(
                      "googleRatingLabel",
                      {
                        rating:
                          google?.averageRating?.toFixed(
                            1
                          ) ?? "0.0",
                      }
                    )}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <p className="text-sm leading-6 text-[#283C5D]/60">
                    {isLoading
                      ? t("loading")
                      : t(
                          "googleReviewCount",
                          {
                            count:
                              google?.totalReviews ??
                              0,
                          }
                        )}
                  </p>

                  {google?.mapsUri && (
                    <a
                      href={google.mapsUri}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#283C5D] underline decoration-[#D8BD8D] decoration-2 underline-offset-4 transition hover:text-[#D8BD8D]"
                    >
                      {t("viewOnGoogle")}
                      <ExternalLink
                        size={13}
                        aria-hidden="true"
                      />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-6">
              <p className="text-sm font-semibold text-[#283C5D]">
                {t("ratingBreakdown")}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#283C5D]/45">
                {t(
                  "ratingBreakdownDescription"
                )}
              </p>

              <div className="mt-5 space-y-3">
                {ratings.map((rating) => {
                  const count =
                    data?.summary
                      .ratingDistribution[
                      rating
                    ] ?? 0;

                  const percentage =
                    totalReviews > 0
                      ? (count /
                          totalReviews) *
                        100
                      : 0;

                  return (
                    <div
                      key={rating}
                      className="grid grid-cols-[34px_1fr_40px] items-center gap-3"
                    >
                      <span className="text-sm font-semibold text-[#283C5D]">
                        {rating}
                      </span>

                      <div className="h-2 overflow-hidden rounded-full bg-[#283C5D]/8">
                        <div
                          className="h-full rounded-full bg-[#D8BD8D] transition-[width] duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="text-right text-xs font-medium text-[#283C5D]/50">
                        {isLoading
                          ? "—"
                          : count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <details open className="group mt-8 border-t border-[#283C5D]/10 pt-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl bg-[#FAF9F7] px-4 py-3 transition hover:bg-[#F4F1EC] [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-[#283C5D]">
                    {t("estheticMatchReviews")}
                  </h3>

                  <p className="mt-1 truncate text-sm text-[#283C5D]/50">
                    {t("newestFirst")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {!isLoading && (
                    <span className="rounded-full bg-[#FAF2DE] px-3 py-1.5 text-xs font-semibold text-[#283C5D]">
                      {t("reviewCount", {
                        count: totalReviews,
                      })}
                    </span>
                  )}

                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="text-[#283C5D]/55 transition-transform duration-300 group-open:rotate-180"
                  />
                </div>
              </summary>

              {isLoading ? (
                <div className="mt-5 space-y-4">
                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-3xl border border-[#283C5D]/8 p-5"
                      >
                        <div className="h-4 w-40 rounded bg-[#283C5D]/10" />
                        <div className="mt-4 h-3 w-full rounded bg-[#283C5D]/8" />
                        <div className="mt-2 h-3 w-4/5 rounded bg-[#283C5D]/8" />
                      </div>
                    )
                  )}
                </div>
              ) : data?.reviews.length ===
                0 ? (
                <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#283C5D]/12 bg-[#FAF9F7] p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#D8BD8D] shadow-sm">
                    <MessageSquareQuote
                      size={24}
                      aria-hidden="true"
                    />
                  </div>

                  <h4 className="mt-5 text-base font-semibold text-[#283C5D]">
                    {t("emptyTitle")}
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#283C5D]/55">
                    {t(
                      "emptyDescription"
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-5 h-[340px] space-y-4 overflow-y-auto overscroll-contain pr-2">
                  {data?.reviews.map(
                    (review) => {
                      const patientName =
                        review.patient.name?.trim() ||
                        t(
                          "anonymousPatient"
                        );

                      return (
                        <article
                          key={review.id}
                          className="rounded-3xl border border-[#283C5D]/10 bg-white p-5 transition hover:border-[#D8BD8D]/60 hover:shadow-md hover:shadow-[#283C5D]/5 md:p-6"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-sm font-semibold text-[#D8BD8D]">
                                {getInitials(
                                  review
                                    .patient
                                    .name,
                                  t(
                                    "anonymousPatient"
                                  )
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#283C5D]">
                                  {
                                    patientName
                                  }
                                </p>

                                <p className="mt-1 text-xs text-[#283C5D]/45">
                                  {t(
                                    "receivedOn",
                                    {
                                      date: format.dateTime(
                                        new Date(
                                          review.createdAt
                                        ),
                                        {
                                          year:
                                            "numeric",
                                          month:
                                            "short",
                                          day:
                                            "numeric",
                                        }
                                      ),
                                    }
                                  )}
                                </p>
                              </div>
                            </div>

                            <RatingStars
                              rating={
                                review.rating
                              }
                              compact
                              label={t(
                                "ratingLabel",
                                {
                                  rating:
                                    review.rating,
                                }
                              )}
                            />
                          </div>

                          <h4 className="mt-5 text-base font-semibold text-[#283C5D]">
                            {review.title}
                          </h4>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#283C5D]/65">
                            {review.review}
                          </p>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </details>

            <details open className="group mt-8 border-t border-[#283C5D]/10 pt-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl bg-[#FAF9F7] px-4 py-3 transition hover:bg-[#F4F1EC] [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-base font-semibold text-[#283C5D]">
                      {t("googleReviews")}
                    </h3>

                    <GoogleBadge />
                  </div>

                  <p className="mt-1 truncate text-sm text-[#283C5D]/50">
                    {t("googleReviewsDescription")}
                  </p>
                </div>

                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#283C5D]/55 transition-transform duration-300 group-open:rotate-180"
                />
              </summary>

              {google?.mapsUri && (
                <div className="mt-4 flex justify-end">
                  <a
                    href={google.mapsUri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#283C5D] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D]"
                  >
                    <MapPin
                      size={14}
                      aria-hidden="true"
                    />
                    {t("viewOnGoogle")}
                  </a>
                </div>
              )}

              {!isLoading &&
              google?.status ===
                "not_connected" ? (
                <div className="mt-5 rounded-3xl border-2 border-dashed border-[#283C5D]/12 bg-[#FAF9F7] p-7 text-center">
                  <h4 className="text-base font-semibold text-[#283C5D]">
                    {t(
                      "googleNotConnectedTitle"
                    )}
                  </h4>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#283C5D]/55">
                    {t(
                      "googleNotConnectedDescription"
                    )}
                  </p>
                </div>
              ) : !isLoading &&
                google?.reviews.length ===
                  0 ? (
                <div className="mt-5 rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-7 text-center">
                  <h4 className="text-base font-semibold text-[#283C5D]">
                    {t(
                      "googleNoWrittenReviewsTitle"
                    )}
                  </h4>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#283C5D]/55">
                    {google?.status ===
                    "summary_only"
                      ? t(
                          "googleSummaryOnlyDescription"
                        )
                      : t(
                          "googleNoWrittenReviewsDescription"
                        )}
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid h-[340px] gap-4 overflow-y-auto overscroll-contain pr-2 lg:grid-cols-2">
                  {google?.reviews.map(
                    (review) => {
                      const dateLabel =
                        review.relativePublishTime ??
                        (review.publishTime
                          ? format.dateTime(
                              new Date(
                                review.publishTime
                              ),
                              {
                                year:
                                  "numeric",
                                month:
                                  "short",
                                day:
                                  "numeric",
                              }
                            )
                          : null);

                      const reviewLink =
                        review.googleMapsUri ??
                        google.mapsUri;

                      return (
                        <article
                          key={review.id}
                          className="flex h-full flex-col rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5 transition hover:border-[#D8BD8D]/70 hover:bg-white hover:shadow-md hover:shadow-[#283C5D]/5 md:p-6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              {review.author
                                .photoUri ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={
                                      review
                                        .author
                                        .photoUri
                                    }
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                                  />
                                </>
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#283C5D] shadow-sm">
                                  {getInitials(
                                    review
                                      .author
                                      .name,
                                    "G"
                                  )}
                                </div>
                              )}

                              <div className="min-w-0">
                                {review.author
                                  .uri ? (
                                  <a
                                    href={
                                      review
                                        .author
                                        .uri
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block truncate text-sm font-semibold text-[#283C5D] hover:underline"
                                  >
                                    {
                                      review
                                        .author
                                        .name
                                    }
                                  </a>
                                ) : (
                                  <p className="truncate text-sm font-semibold text-[#283C5D]">
                                    {
                                      review
                                        .author
                                        .name
                                    }
                                  </p>
                                )}

                                {dateLabel && (
                                  <p className="mt-1 text-xs text-[#283C5D]/45">
                                    {
                                      dateLabel
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <GoogleBadge />
                          </div>

                          <div className="mt-4">
                            <RatingStars
                              rating={
                                review.rating
                              }
                              compact
                              label={t(
                                "googleRatingLabel",
                                {
                                  rating:
                                    review.rating,
                                }
                              )}
                            />
                          </div>

                          <p className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-7 text-[#283C5D]/65">
                            {review.text}
                          </p>

                          {reviewLink && (
                            <a
                              href={
                                reviewLink
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="mt-5 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[#283C5D] underline decoration-[#D8BD8D] decoration-2 underline-offset-4 transition hover:text-[#D8BD8D]"
                            >
                              {t(
                                "openGoogleReview"
                              )}
                              <ExternalLink
                                size={13}
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </details>
          </div>
        )}
      </div>
    </section>
  );
}