import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

type RatingValue = 1 | 2 | 3 | 4 | 5;

type RatingDistribution = Record<RatingValue, number>;

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

type GoogleReviewsData = {
  status: GoogleReviewsStatus;
  averageRating: number | null;
  totalReviews: number;
  mapsUri: string | null;
  reviews: GoogleReview[];
};

type DoctorGoogleProfile = {
  googlePlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleMapsUri: string | null;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(
  value: unknown
): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(
  value: unknown
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function readLocalizedText(
  value: unknown
): string | null {
  if (!isRecord(value)) return null;

  return readString(value.text);
}

function isRatingValue(
  value: number
): value is RatingValue {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function createGoogleFallback(
  doctorProfile: DoctorGoogleProfile,
  status: GoogleReviewsStatus
): GoogleReviewsData {
  return {
    status,
    averageRating: doctorProfile.googleRating,
    totalReviews:
      doctorProfile.googleReviewCount ?? 0,
    mapsUri: doctorProfile.googleMapsUri,
    reviews: [],
  };
}

function parseGoogleReview(
  value: unknown,
  index: number
): GoogleReview | null {
  if (!isRecord(value)) return null;

  const rating = readNumber(value.rating);
  const text =
    readLocalizedText(value.text) ??
    readLocalizedText(value.originalText);

  if (rating === null || !text) {
    return null;
  }

  const authorAttribution = isRecord(
    value.authorAttribution
  )
    ? value.authorAttribution
    : null;

  const authorName =
    readString(authorAttribution?.displayName) ??
    "Google user";

  return {
    id:
      readString(value.name) ??
      `google-review-${index}`,
    text,
    originalText:
      readLocalizedText(value.originalText),
    rating,
    publishTime:
      readString(value.publishTime),
    relativePublishTime:
      readString(
        value.relativePublishTimeDescription
      ),
    googleMapsUri:
      readString(value.googleMapsUri),
    author: {
      name: authorName,
      uri: readString(authorAttribution?.uri),
      photoUri: readString(
        authorAttribution?.photoUri
      ),
    },
  };
}

function parseGooglePlaceResponse(
  value: unknown,
  fallback: DoctorGoogleProfile
): GoogleReviewsData | null {
  if (!isRecord(value)) return null;

  const rawReviews = Array.isArray(value.reviews)
    ? value.reviews
    : [];

  const reviews = rawReviews
    .map(parseGoogleReview)
    .filter(
      (review): review is GoogleReview =>
        review !== null
    );

  return {
    status: "available",
    averageRating:
      readNumber(value.rating) ??
      fallback.googleRating,
    totalReviews:
      readNumber(value.userRatingCount) ??
      fallback.googleReviewCount ??
      0,
    mapsUri:
      readString(value.googleMapsUri) ??
      fallback.googleMapsUri,
    reviews,
  };
}

async function getGoogleReviews({
  doctorProfile,
  languageCode,
}: {
  doctorProfile: DoctorGoogleProfile;
  languageCode: "en" | "fr";
}): Promise<GoogleReviewsData> {
  if (!doctorProfile.googlePlaceId) {
    return createGoogleFallback(
      doctorProfile,
      "not_connected"
    );
  }

  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ??
    process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error(
      "Google reviews were not loaded because GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY is missing."
    );

    return createGoogleFallback(
      doctorProfile,
      "summary_only"
    );
  }

  try {
    const placeId = encodeURIComponent(
      doctorProfile.googlePlaceId
    );

    const url = new URL(
      `https://places.googleapis.com/v1/places/${placeId}`
    );

    url.searchParams.set(
      "languageCode",
      languageCode
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "rating,userRatingCount,googleMapsUri,reviews",
      },
      cache: "no-store",
    });

    const payload: unknown = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      console.error(
        "Google Places review request failed:",
        payload
      );

      return createGoogleFallback(
        doctorProfile,
        "summary_only"
      );
    }

    return (
      parseGooglePlaceResponse(
        payload,
        doctorProfile
      ) ??
      createGoogleFallback(
        doctorProfile,
        "summary_only"
      )
    );
  } catch (error) {
    console.error(
      "Could not load Google reviews:",
      error
    );

    return createGoogleFallback(
      doctorProfile,
      "summary_only"
    );
  }
}

export async function GET() {
  try {
    const requestHeaders = await headers();

    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          role: true,
          doctorProfile: {
            select: {
              id: true,
              googlePlaceId: true,
              googleRating: true,
              googleReviewCount: true,
              googleMapsUri: true,
            },
          },
        },
      });

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (currentUser.role !== "DOCTOR") {
      return NextResponse.json(
        {
          error:
            "Only doctors can access this metric.",
        },
        {
          status: 403,
        }
      );
    }

    if (!currentUser.doctorProfile) {
      return NextResponse.json(
        {
          error: "Doctor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        doctorProfileId:
          currentUser.doctorProfile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        review: true,
        rating: true,
        createdAt: true,
        patientUser: {
          select: {
            name: true,
          },
        },
      },
    });

    const ratingDistribution: RatingDistribution =
      {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

    let ratingTotal = 0;

    for (const review of reviews) {
      ratingTotal += review.rating;

      if (isRatingValue(review.rating)) {
        ratingDistribution[review.rating] += 1;
      }
    }

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? ratingTotal / totalReviews
        : 0;

    const acceptLanguage =
      requestHeaders.get("accept-language") ?? "";

    const languageCode: "en" | "fr" =
      acceptLanguage
        .trim()
        .toLowerCase()
        .startsWith("fr")
        ? "fr"
        : "en";

    const google = await getGoogleReviews({
      doctorProfile: currentUser.doctorProfile,
      languageCode,
    });

    return NextResponse.json(
      {
        summary: {
          totalReviews,
          averageRating,
          ratingDistribution,
        },
        reviews: reviews.map((review) => ({
          id: review.id,
          title: review.title,
          review: review.review,
          rating: review.rating,
          createdAt:
            review.createdAt.toISOString(),
          patient: {
            name: review.patientUser.name,
          },
        })),
        google,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Could not load doctor reviews:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not load doctor reviews.",
      },
      {
        status: 500,
      }
    );
  }
}