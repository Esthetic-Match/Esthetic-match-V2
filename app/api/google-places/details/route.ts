import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type GooglePlaceDetails = {
  id?: string;
  name?: string;
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  types?: string[];
  primaryType?: string;
  businessStatus?: string;
};

function normalizePlaceResource(placeId: string) {
  const trimmed = placeId.trim();

  if (trimmed.startsWith("places/")) {
    return trimmed;
  }

  return `places/${trimmed}`;
}

export const POST = withApiHandler(async (req: Request) => {
  const { placeId } = await req.json();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      "Missing GOOGLE_PLACES_API_KEY",
      500,
      "GOOGLE_PLACES_API_KEY_MISSING"
    );
  }

  if (!placeId || typeof placeId !== "string") {
    throw new ApiError(
      "Missing or invalid placeId",
      400,
      "INVALID_PLACE_ID",
      {
        received: placeId,
      }
    );
  }

  const placeResource = normalizePlaceResource(placeId);

  const googleRes = await fetch(
    `https://places.googleapis.com/v1/${placeResource}`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "id",
          "name",
          "displayName",
          "formattedAddress",
          "rating",
          "userRatingCount",
          "googleMapsUri",
          "types",
          "primaryType",
          "businessStatus",
        ].join(","),
      },
    }
  );

  const raw = await googleRes.text();

  let data: GooglePlaceDetails | { error?: unknown; raw?: string };

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  if (!googleRes.ok) {
    throw new ApiError(
      "Google Places details failed",
      googleRes.status,
      "GOOGLE_PLACES_DETAILS_FAILED",
      data
    );
  }

  const place = data as GooglePlaceDetails;

  return apiSuccess({
    place: {
      id: place.id ?? null,
      name: place.name ?? placeResource,
      displayName: place.displayName ?? null,
      formattedAddress: place.formattedAddress ?? null,
      rating: typeof place.rating === "number" ? place.rating : null,
      userRatingCount:
        typeof place.userRatingCount === "number"
          ? place.userRatingCount
          : null,
      googleMapsUri: place.googleMapsUri ?? null,
      types: place.types ?? [],
      primaryType: place.primaryType ?? null,
      businessStatus: place.businessStatus ?? null,
    },
  });
});