"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  MessageSquareQuote,
  Quote,
  Star,
} from "lucide-react";
import {
  useFormatter,
  useTranslations,
} from "next-intl";

type PublicReview = {
  id: string;
  title: string;
  review: string;
  rating: number;
  createdAt: string;
  patientName: string | null;
};

type PublicReviewsResponse = {
  summary: {
    totalReviews: number;
    averageRating: number;
  };
  reviews: PublicReview[];
};

type EstheticMatchReviewsProps = {
  doctorProfileId: string;
  className?: string;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

function parsePublicReview(
  value: unknown
): PublicReview | null {
  if (!isRecord(value)) {
    return null;
  }

  const patientName =
    readNullableString(value.patientName);

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.review !== "string" ||
    typeof value.rating !== "number" ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  if (
    value.patientName !== null &&
    patientName === null
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    review: value.review,
    rating: value.rating,
    createdAt: value.createdAt,
    patientName,
  };
}

function parseResponse(
  value: unknown
): PublicReviewsResponse | null {
  if (
    !isRecord(value) ||
    !isRecord(value.summary) ||
    !Array.isArray(value.reviews) ||
    typeof value.summary.totalReviews !==
      "number" ||
    typeof value.summary.averageRating !==
      "number"
  ) {
    return null;
  }

  const reviews = value.reviews
    .map(parsePublicReview)
    .filter(
      (review): review is PublicReview =>
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
    },
    reviews,
  };
}

function getInitials(
  patientName: string | null,
  fallback: string
): string {
  const source =
    patientName?.trim() || fallback;

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function RatingStars({
  rating,
  size = 18,
  label,
}: {
  rating: number;
  size?: number;
  label: string;
}) {
  const clampedRating = Math.max(
    0,
    Math.min(5, rating)
  );

  const roundedRating =
    Math.round(clampedRating * 2) / 2;

  const fullStars = Math.floor(
    roundedRating
  );

  const hasHalfStar =
    roundedRating - fullStars === 0.5;

  return (
    <div
      className="flex items-center gap-1"
      aria-label={label}
      title={label}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => {
          const isFull =
            star <= fullStars;

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
                  className="absolute inset-0 text-[#283C5D]/15"
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
              className="shrink-0 text-[#283C5D]/15"
              aria-hidden="true"
            />
          );
        }
      )}
    </div>
  );
}

export default function EstheticMatchReviews({
  doctorProfileId,
  className = "",
}: EstheticMatchReviewsProps) {
  const t = useTranslations(
    "doctor.publicDoctorReviews"
  );
  const format = useFormatter();

  const [data, setData] =
    useState<PublicReviewsResponse | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadReviews() {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/public-pages/doctor-reviews/${encodeURIComponent(
            doctorProfileId
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          if (isActive) {
            setData(null);
          }

          return;
        }

        const payload: unknown =
          await response
            .json()
            .catch(() => null);

        const parsed =
          parseResponse(payload);

        if (isActive) {
          setData(parsed);
        }
      } catch {
        if (isActive) {
          setData(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadReviews();

    return () => {
      isActive = false;
    };
  }, [doctorProfileId]);

  if (
    isLoading ||
    !data ||
    data.summary.totalReviews === 0 ||
    data.reviews.length === 0
  ) {
    return null;
  }

  return (
    <section
      className={`py-10 md:py-6 ${className}`}
      aria-labelledby="esthetic-match-reviews-title"
    >
      <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.08)]">

          <div className="relative z-10 border-b border-[#283C5D]/10 px-6 py-7 md:px-8 md:py-8 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-[#D8BD8D] shadow-sm">
                    <MessageSquareQuote
                      size={20}
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D8BD8D]">
                    {t("eyebrow")}
                  </p>
                </div>

                <h2
                  id="esthetic-match-reviews-title"
                  className="mt-5 text-2xl font-semibold tracking-tight text-[#283C5D] md:text-3xl"
                >
                  {t("title")}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-[#283C5D]/60">
                  {t("description")}
                </p>
              </div>

              <div className="min-w-[250px] rounded-3xl border border-[#283C5D]/10 bg-white p-5 shadow-sm md:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#283C5D]/45">
                  {t("averageRating")}
                </p>

                <div className="mt-3 flex items-end gap-4">
                  <p className="text-4xl font-semibold tracking-tight text-[#283C5D] md:text-5xl">
                    {data.summary.averageRating.toFixed(
                      1
                    )}
                  </p>

                  <div className="pb-1">
                    <RatingStars
                      rating={
                        data.summary.averageRating
                      }
                      size={20}
                      label={t("ratingLabel", {
                        rating:
                          data.summary.averageRating.toFixed(
                            1
                          ),
                      })}
                    />

                    <p className="mt-2 text-xs text-[#283C5D]/45">
                      {t("reviewCount", {
                        count:
                          data.summary.totalReviews,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 px-4 py-5 md:px-6 md:py-6 lg:px-8">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {data.reviews.map((review) => {
                const patientName =
                  review.patientName ||
                  t("anonymousPatient");

                return (
                  <article
                    key={review.id}
                    className="group relative flex h-[310px] w-[86vw] max-w-[390px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-[#283C5D]/10 bg-white p-5 shadow-[0_12px_35px_rgba(40,60,93,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[#D8BD8D]/65 hover:shadow-[0_18px_42px_rgba(40,60,93,0.1)] md:p-6"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D8BD8D] via-[#E8D9B8] to-transparent" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-xs font-bold text-[#D8BD8D]">
                          {getInitials(
                            review.patientName,
                            t("anonymousPatient")
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#283C5D]">
                            {patientName}
                          </p>

                          <p className="mt-1 text-xs text-[#283C5D]/40">
                            {format.dateTime(
                              new Date(
                                review.createdAt
                              ),
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <Quote
                        size={20}
                        className="shrink-0 text-[#D8BD8D]/80"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Star
                            key={star}
                            size={15}
                            className={
                              star <= review.rating
                                ? "fill-[#D8BD8D] text-[#D8BD8D]"
                                : "text-[#283C5D]/12"
                            }
                            aria-hidden="true"
                          />
                        )
                      )}
                    </div>

                    <p className="sr-only">
                      {t("ratingLabel", {
                        rating:
                          review.rating,
                      })}
                    </p>

                    <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-6 text-[#283C5D]">
                      {review.title}
                    </h3>

                    <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-2">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-[#283C5D]/62">
                        {review.review}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}