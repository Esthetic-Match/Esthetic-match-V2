"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Star } from "lucide-react";
import { useTranslations } from "next-intl";

type GoogleReviewAuthor = {
  displayName: string | null;
  uri: string | null;
  photoUri: string | null;
};

type GoogleReviewItem = {
  name: string | null;
  rating: number | null;
  relativePublishTimeDescription: string | null;
  text: string | null;
  textLanguageCode: string | null;
  originalText: string | null;
  originalTextLanguageCode: string | null;
  publishTime: string | null;
  author: GoogleReviewAuthor;
};

type GooglePlaceReviewsData = {
  googleRating: number | null;
  googleReviewCount: number | null;
  googleMapsUri: string | null;
  reviews: GoogleReviewItem[];
};

type GoogleReviewsListProps = {
  googlePlaceId?: string | null;
  limit?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function readReviews(value: unknown): GoogleReviewItem[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<GoogleReviewItem[]>((reviews, item: unknown) => {
    if (!isRecord(item)) return reviews;

    const author = isRecord(item.author) ? item.author : {};

    reviews.push({
      name: readNullableString(item.name),
      rating: readNullableNumber(item.rating),
      relativePublishTimeDescription: readNullableString(
        item.relativePublishTimeDescription
      ),
      text: readNullableString(item.text),
      textLanguageCode: readNullableString(item.textLanguageCode),
      originalText: readNullableString(item.originalText),
      originalTextLanguageCode: readNullableString(
        item.originalTextLanguageCode
      ),
      publishTime: readNullableString(item.publishTime),
      author: {
        displayName: readNullableString(author.displayName),
        uri: readNullableString(author.uri),
        photoUri: readNullableString(author.photoUri),
      },
    });

    return reviews;
  }, []);
}

function getPlaceFromPayload(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;

  if (isRecord(payload.place)) {
    return payload.place;
  }

  if (isRecord(payload.data) && isRecord(payload.data.place)) {
    return payload.data.place;
  }

  return null;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed;
  } catch {
    return { error: raw };
  }
}

function GoogleRatingStars({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((starIndex: number) => {
        const fillPercentage =
          Math.min(Math.max(rating - starIndex, 0), 1) * 100;

        return (
          <span
            key={starIndex}
            className="relative shrink-0"
            style={{
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <Star
              size={size}
              className="absolute left-0 top-0 fill-[#E9E1D4] text-[#E9E1D4]"
            />

            <span
              className="absolute left-0 top-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                size={size}
                className="fill-[#D8BD8D] text-[#D8BD8D]"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function getReviewText(review: GoogleReviewItem): string | null {
  return review.text ?? review.originalText;
}

function getAuthorInitial(authorName: string | null): string {
  if (!authorName) return "G";

  return authorName.trim().charAt(0).toUpperCase();
}

export default function GoogleReviewsList({
  googlePlaceId,
  limit = 4,
}: GoogleReviewsListProps) {
  const normalizedGooglePlaceId = googlePlaceId?.trim();

  if (!normalizedGooglePlaceId) {
    return null;
  }

  return (
    <GoogleReviewsContent
      key={normalizedGooglePlaceId}
      googlePlaceId={normalizedGooglePlaceId}
      limit={limit}
    />
  );
}

type GoogleReviewsContentProps = {
  googlePlaceId: string;
  limit: number;
};

function GoogleReviewsContent({
  googlePlaceId,
  limit,
}: GoogleReviewsContentProps) {
  const t = useTranslations("doctor.doctor.profile");
  const [data, setData] = useState<GooglePlaceReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGoogleReviews(): Promise<void> {
      try {
        const response = await fetch("/api/google-places/details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            placeId: googlePlaceId,
          }),
          signal: controller.signal,
        });

        const payload = await parseJsonResponse(response);

        if (!response.ok) {
          throw new Error("Could not load Google reviews.");
        }

        const place = getPlaceFromPayload(payload);

        if (!place) {
          throw new Error("Invalid Google reviews response.");
        }

        if (controller.signal.aborted) {
          return;
        }

        setData({
          googleRating: readNullableNumber(place.rating),
          googleReviewCount: readNullableNumber(place.userRatingCount),
          googleMapsUri: readNullableString(place.googleMapsUri),
          reviews: readReviews(place.reviews),
        });
        setErrorMessage(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Google reviews request failed:", error);
        setData(null);
        setErrorMessage("Could not load Google reviews.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadGoogleReviews();

    return () => {
      controller.abort();
    };
  }, [googlePlaceId]);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1140px] rounded-[2rem] bg-white p-6 shadow-[0_24px_70px_rgba(40,60,93,0.10)]">
        <div className="h-5 w-36 animate-pulse rounded-full bg-[#E9E1D4]" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[0, 1].map((item: number) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-[1.5rem] bg-[#FAF9F7]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (errorMessage || !data) {
    return null;
  }

  const visibleReviews = data.reviews
    .filter((review: GoogleReviewItem) => getReviewText(review) != null)
    .slice(0, limit);

  if (visibleReviews.length === 0 && data.googleRating == null) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-[1150px] rounded-[2rem] bg-white p-5 shadow-[0_24px_70px_rgba(40,60,93,0.10)] md:p-7">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF9F7] text-[#D8BD8D]">
            <MessageCircle size={20} />
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D8BD8D]">
              {t("googleReviewsList.title")}
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#283C5D]">
              {t("googleReviewsList.subtitle")}
            </h2>
          </div>
        </div>

        {data.googleRating != null ? (
          <div className="rounded-2xl border border-[#E7DDD0] bg-[#FAF9F7] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold leading-none text-[#283C5D]">
                {data.googleRating.toFixed(1)}
              </span>
        
              <div>
                <GoogleRatingStars rating={data.googleRating} size={16} />
        
                {data.googleReviewCount != null ? (
                  <p className="mt-1 text-xs font-medium text-[#283C5D]/55">
                    {t("googleReviewsList.basedOnReviews", {
                      count: data.googleReviewCount,
                    })}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      
      {visibleReviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleReviews.map((review: GoogleReviewItem) => {
            const reviewText = getReviewText(review);
          
            return (
              <article
                key={
                  review.name ??
                  `${review.author.displayName}-${review.publishTime}`
                }
                className="rounded-[1.5rem] border border-[#E7DDD0] bg-[#FAF9F7] p-5 transition duration-300 ease-out hover:border-[#D8BD8D] hover:bg-white hover:shadow-[0_18px_45px_rgba(40,60,93,0.10)]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-sm font-bold text-white">
                      {getAuthorInitial(review.author.displayName)}
                    </span>
              
                    <div className="min-w-0">
                      {review.author.uri ? (
                        <a
                          href={review.author.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1 text-sm font-semibold text-[#283C5D] transition hover:text-[#D8BD8D]"
                        >
                          <span className="truncate">
                            {review.author.displayName ??
                              t("googleReviewsList.googleUser")}
                          </span>
                          <ExternalLink size={13} className="shrink-0" />
                        </a>
                      ) : (
                        <p className="truncate text-sm font-semibold text-[#283C5D]">
                          {review.author.displayName ??
                            t("googleReviewsList.googleUser")}
                        </p>
                      )}

                      {review.relativePublishTimeDescription ? (
                        <p className="mt-0.5 text-xs text-[#283C5D]/50">
                          {review.relativePublishTimeDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>
                    
                  {review.rating != null ? (
                    <div className="shrink-0">
                      <GoogleRatingStars rating={review.rating} size={14} />
                    </div>
                  ) : null}
                </div>
                
                {reviewText ? (
                  <p className="text-sm leading-6 text-[#283C5D]/75">
                    “{reviewText}”
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}

      {data.googleMapsUri ? (
        <div className="mt-6 flex justify-center">
          <a
            href={data.googleMapsUri}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#D8BD8D] bg-white px-5 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#334665] hover:border-[#334665] hover:text-white"
          >
            {t("googleReviewsList.viewMore")}
          </a>
        </div>
      ) : null}
    </section>
  );
}