import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      clinicName,
      workLatitude,
      workLongitude,
    } = await req.json();

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_PLACES_API_KEY" },
        { status: 500 }
      );
    }

    if (!clinicName) {
      return NextResponse.json(
        { error: "Missing clinicName" },
        { status: 400 }
      );
    }

    const body: Record<string, unknown> = {
      input: clinicName,
      includeQueryPredictions: false,
    };

    if (
      typeof workLatitude === "number" &&
      typeof workLongitude === "number"
    ) {
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
      console.error(data);

      return NextResponse.json(
        {
          error: "Autocomplete failed",
          details: data,
        },
        { status: googleRes.status }
      );
    }

    const places =
      data.suggestions
        ?.map((suggestion: any) => suggestion.placePrediction)
        .filter(Boolean)
        .map((prediction: any) => ({
          id:
            prediction.placeId ??
            prediction.place?.replace("places/", ""),

          name: prediction.place,

          displayName: {
            text:
              prediction.structuredFormat?.mainText?.text ??
              prediction.text?.text,
          },

          formattedAddress:
            prediction.structuredFormat?.secondaryText?.text ??
            null,
        })) ?? [];

    return NextResponse.json({
      places,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}