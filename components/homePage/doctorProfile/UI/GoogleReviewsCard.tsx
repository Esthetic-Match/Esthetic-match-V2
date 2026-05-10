import { Star } from "lucide-react";

type GoogleReviewsCardProps = {
  googleRating: number | null;
  googleReviewCount: number | null;
  googleMapsUri: string | null;
};

export default function GoogleReviewsCard({
  googleRating,
  googleReviewCount,
  googleMapsUri,
}: GoogleReviewsCardProps) {
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
        <Star size={22} className="fill-[#d8bd8d] text-[#d8bd8d]" />

        <h2
          id="google-reviews-title"
          className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
        >
          Google Reviews
        </h2>
      </div>

        {hasReviews ? (
          <div
            itemProp="aggregateRating"
            itemScope
            itemType="https://schema.org/AggregateRating"
            className="mt-14 text-center"
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

                      <div className="absolute overflow-hidden w-1/2">
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
              Based on{" "}
              <span itemProp="reviewCount">
                {googleReviewCount}
              </span>{" "}
              Google reviews
            </p>
          
            {googleMapsUri?.trim() ? (
              <a
                href={googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-16 inline-flex w-full items-center justify-center rounded-full border border-[#d8bd8d]/60 px-6 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#53637d] hover:text-white"
              >
                View on Google
              </a>
            ) : null}
          </div>
        ) : (
        <p className="mt-10 text-sm leading-relaxed text-[#283C5D]/60">
          The doctor has not allowed Google reviews yet.
        </p>
      )}
    </article>
  );
}