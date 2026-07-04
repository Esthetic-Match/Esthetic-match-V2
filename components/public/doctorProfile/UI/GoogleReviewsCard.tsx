import { Star, StarOff  } from "lucide-react";
import { getTranslations } from "next-intl/server";

type GoogleReviewsCardProps = {
  googleRating: number | null;
  googleReviewCount: number | null;
  googleMapsUri: string | null;
};

export default async function GoogleReviewsCard({
  googleRating,
  googleReviewCount,
  googleMapsUri,
}: GoogleReviewsCardProps) {
  const t = await getTranslations("doctor.doctor.profile.reviews");

  const hasReviews =
    googleRating !== null &&
    googleRating !== undefined &&
    googleReviewCount !== null &&
    googleReviewCount !== undefined &&
    googleReviewCount > 0;

  return (
    <article
      aria-labelledby="google-reviews-title"
      className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
      <div className="flex items-center gap-3">
        <Star
          size={22}
          className="fill-[#d8bd8d] text-[#d8bd8d]"
        />

        <h2
          id="google-reviews-title"
          className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
        >
          {t("title")}
        </h2>
      </div>

      {hasReviews ? (
        <div
          itemProp="aggregateRating"
          itemScope
          itemType="https://schema.org/AggregateRating"
          className="mt-20 text-center"
        >
          <div className="mb-5 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const fullStars = Math.floor(googleRating);
              const decimal = googleRating - fullStars;

              const isFull = star <= fullStars;
              const isHalf =
                star === fullStars + 1 && decimal >= 0.5;

              if (isFull) {
                return (
                  <Star
                    key={star}
                    size={24}
                    className="fill-[#d8bd8d] text-[#d8bd8d]"
                  />
                );
              }

              if (isHalf) {
                return (
                  <div key={star} className="relative h-6 w-6">
                    <Star
                      size={24}
                      className="absolute text-gray-300"
                    />

                    <div className="absolute w-1/2 overflow-hidden">
                      <Star
                        size={24}
                        className="fill-[#d8bd8d] text-[#d8bd8d]"
                      />
                    </div>
                  </div>
                );
              }

              return (
                <Star
                  key={star}
                  size={24}
                  className="text-gray-300"
                />
              );
            })}
          </div>

          <p className="text-4xl font-bold text-[#283C5D]">
            <span itemProp="ratingValue">{googleRating}</span>

            <span className="text-lg font-semibold text-[#283C5D]/50">
              {" "}
              / 5
            </span>
          </p>

          <p className="mt-3 text-sm text-[#283C5D]/60">
            {t("basedOn", {
              count: googleReviewCount,
            })}
          </p>

          <meta
            itemProp="reviewCount"
            content={String(googleReviewCount)}
          />

        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 border-t border-[#d8bd8d]/60 items-center justify-center rounded-full bg-gradient-to-br from-[#F6C467]/20 to-[#d8bd8d]/10 shadow-inner">
            <StarOff size={34} className="text-[#d8bd8d]" />
          </div>

          <p className="mt-12 max-w-sm rounded-full text-sm font-medium leading-relaxed text-[#283C5D]/60">
            {t("notAllowed")}
          </p>
        </div>
      )}
    </article>
  );
}