import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const { placeId } = await req.json();

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_PLACES_API_KEY" },
        { status: 500 }
      );
    }

    if (!placeId || typeof placeId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid placeId", received: placeId },
        { status: 400 }
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
      console.error("Google Places Details Error:", data);

      return NextResponse.json(
        {
          error: "Google Places details failed",
          details: data,
        },
        { status: googleRes.status }
      );
    }

    const place = data as GooglePlaceDetails;

    return NextResponse.json({
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
  } catch (error) {
    console.error("Google Places Details Route Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}