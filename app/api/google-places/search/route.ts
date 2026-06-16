import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type GooglePlacePrediction = {
  placeId?: string;
  place?: string;
  text?: {
    text?: string;
  };
  structuredFormat?: {
    mainText?: {
      text?: string;
    };
    secondaryText?: {
      text?: string;
    };
  };
};

type GoogleSuggestion = {
  placePrediction?: GooglePlacePrediction;
};

export const POST = withApiHandler(async (req: Request) => {
  const { clinicName, workLatitude, workLongitude } = await req.json();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      "Missing GOOGLE_PLACES_API_KEY",
      500,
      "GOOGLE_PLACES_API_KEY_MISSING"
    );
  }

  if (!clinicName) {
    throw new ApiError("Missing clinicName", 400, "CLINIC_NAME_REQUIRED");
  }

  const body: Record<string, unknown> = {
    input: clinicName,
    includeQueryPredictions: false,
  };

  if (typeof workLatitude === "number" && typeof workLongitude === "number") {
    body.locationBias = {
      circle: {
        center: {
          latitude: workLatitude,
          longitude: workLongitude,
        },
        radius: 5000,
      },
    };
  }

  const googleRes = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await googleRes.json();

  if (!googleRes.ok) {
    throw new ApiError(
      "Autocomplete failed",
      googleRes.status,
      "GOOGLE_PLACES_AUTOCOMPLETE_FAILED",
      data
    );
  }

  const suggestions = data.suggestions as GoogleSuggestion[] | undefined;

  const places =
    suggestions
      ?.map((suggestion) => suggestion.placePrediction)
      .filter((prediction): prediction is GooglePlacePrediction =>
        Boolean(prediction)
      )
      .map((prediction) => ({
        id: prediction.placeId ?? prediction.place?.replace("places/", ""),

        name: prediction.place,

        displayName: {
          text:
            prediction.structuredFormat?.mainText?.text ??
            prediction.text?.text,
        },

        formattedAddress:
          prediction.structuredFormat?.secondaryText?.text ?? null,
      })) ?? [];

  return apiSuccess({
    places,
  });
});