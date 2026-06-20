// app/api/public-pages/doctors-near-me/route.ts

import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

type GeocodeAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GeocodeResult = {
  address_components?: GeocodeAddressComponent[];
};

type GeocodeResponse = {
  status: string;
  results?: GeocodeResult[];
};

type DoctorsNearMeRequestBody = {
  latitude: number;
  longitude: number;
  locale?: string;
};

type DoctorCardDto = {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  clinicName: string;
  city: string | null;
  country: string | null;
  specialtyIds: string[];
  procedureIds: string[];
  topThree: string[];
  yearsOfExperience: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  currency: string;
  distanceKm: number | null;
};

// ── Select ────────────────────────────────────────────────────────────────────

const doctorNearMeSelect = Prisma.validator<Prisma.DoctorProfileSelect>()({
  id: true,
  slug: true,
  avatar: true,
  clinicName: true,
  city: true,
  country: true,
  specialtyIds: true,
  procedureIds: true,
  topThree: true,
  yearsOfExperience: true,
  googleRating: true,
  googleReviewCount: true,
  inClinicPrice: true,
  onlineConsulPrice: true,
  stripeConnectOnboardingComplete: true,
  onlineActive: true,
  currency: true,
  workLatitude: true,
  workLongitude: true,
  user: {
    select: {
      name: true,
      image: true,
    },
  },
});

type DoctorNearMeResult = Prisma.DoctorProfileGetPayload<{
  select: typeof doctorNearMeSelect;
}>;

// ── Guards ────────────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDoctorsNearMeBody(
  body: unknown
): DoctorsNearMeRequestBody | null {
  if (!isRecord(body)) return null;
  const { latitude, longitude, locale } = body;
  if (typeof latitude !== "number") return null;
  if (typeof longitude !== "number") return null;
  return {
    latitude,
    longitude,
    locale: typeof locale === "string" ? locale : undefined,
  };
}

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// ── Geo helpers ───────────────────────────────────────────────────────────────

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm({
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
}: {
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
}) {
  const R = 6371;
  const dLat = toRadians(toLatitude - fromLatitude);
  const dLon = toRadians(toLongitude - fromLongitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns a lat/lng bounding box for a given radius in km.
 * This lets Postgres filter rows before they hit Node.js memory —
 * replacing the previous take:300 + in-memory filter pattern.
 */
function boundingBox(latitude: number, longitude: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(toRadians(latitude)));
  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLng: longitude - lngDelta,
    maxLng: longitude + lngDelta,
  };
}

// ── Geocoding ─────────────────────────────────────────────────────────────────

function findAddressComponent(
  components: GeocodeAddressComponent[],
  acceptedTypes: string[]
) {
  return components.find((c) =>
    acceptedTypes.every((type) => c.types.includes(type))
  )?.long_name;
}

async function reverseGeocodeCity({
  latitude,
  longitude,
  locale,
}: {
  latitude: number;
  longitude: number;
  locale: string;
}): Promise<{ city: string | null; country: string | null }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { city: null, country: null };

  try {
    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: apiKey,
      language: locale === "fr" ? "fr" : "en",
    });

    // ✅ 5-second timeout — a hanging geocode call was keeping the request
    //    open and tying up a Node.js worker indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5_000);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      { cache: "no-store", signal: controller.signal }
    ).finally(() => clearTimeout(timeoutId));

    if (!response.ok) return { city: null, country: null };

    const data: GeocodeResponse = await response.json();
    if (data.status !== "OK" || !data.results?.length)
      return { city: null, country: null };

    const components = data.results.flatMap(
      (r) => r.address_components ?? []
    );

    const city =
      findAddressComponent(components, ["locality", "political"]) ||
      findAddressComponent(components, ["postal_town"]) ||
      findAddressComponent(components, [
        "administrative_area_level_2",
        "political",
      ]) ||
      findAddressComponent(components, ["sublocality", "political"]) ||
      null;

    const country =
      findAddressComponent(components, ["country", "political"]) || null;

    return { city, country };
  } catch {
    // Timeout or network error — degrade gracefully to radius search
    return { city: null, country: null };
  }
}

// ── Formatter ─────────────────────────────────────────────────────────────────

function formatDoctor({
  doctor,
  userLatitude,
  userLongitude,
}: {
  doctor: DoctorNearMeResult;
  userLatitude: number;
  userLongitude: number;
}): DoctorCardDto {
  const distanceKm =
    doctor.workLatitude !== null && doctor.workLongitude !== null
      ? calculateDistanceKm({
          fromLatitude: userLatitude,
          fromLongitude: userLongitude,
          toLatitude: doctor.workLatitude,
          toLongitude: doctor.workLongitude,
        })
      : null;

  return {
    id: doctor.id,
    slug: doctor.slug ?? "",
    name: doctor.user.name ?? "Doctor",
    avatar: doctor.avatar ?? doctor.user.image,
    clinicName: doctor.clinicName,
    city: doctor.city,
    country: doctor.country,
    specialtyIds: doctor.specialtyIds,
    procedureIds: doctor.procedureIds,
    topThree: doctor.topThree,
    yearsOfExperience: doctor.yearsOfExperience,
    googleRating: doctor.googleRating,
    googleReviewCount: doctor.googleReviewCount,
    inClinicPrice: doctor.inClinicPrice,
    onlineConsulPrice: doctor.onlineConsulPrice,
    stripeConnectOnboardingComplete: doctor.stripeConnectOnboardingComplete,
    onlineActive: doctor.onlineActive,
    currency: doctor.currency,
    distanceKm: distanceKm !== null ? Number(distanceKm.toFixed(1)) : null,
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const rawBody: unknown = await req.json().catch((): null => null);
    const body = parseDoctorsNearMeBody(rawBody);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { latitude, longitude } = body;
    const locale = body.locale ?? "en";

    if (!isValidCoordinate(latitude, longitude)) {
      return NextResponse.json(
        { error: "Invalid browser location." },
        { status: 400 }
      );
    }

    const { city, country } = await reverseGeocodeCity({
      latitude,
      longitude,
      locale,
    });

    const baseWhere: Prisma.DoctorProfileWhereInput = {
      slug: { not: null },
      user: {
        is: {
          role: UserRole.DOCTOR,
          onboardingCompleted: true,
        },
      },
    };

    let doctors: DoctorNearMeResult[] = [];
    let matchMode: "city" | "radius" = "city";
    const radiusKm = 50;

    // ── Pass 1: city match ──────────────────────────────────────────────
    if (city) {
      doctors = await prisma.doctorProfile.findMany({
        where: {
          ...baseWhere,
          city: { equals: city, mode: "insensitive" },
          ...(country
            ? { country: { equals: country, mode: "insensitive" } }
            : {}),
        },
        select: doctorNearMeSelect,
        take: 60,
      });
    }

    // ── Pass 2: bounding-box radius match ───────────────────────────────
    // ✅ Was: take:300 into Node.js memory, filter in JS
    // Now: Postgres filters by bounding box first, Node.js only receives
    //      candidates that are plausibly within range (~circumscribed square)
    //      then we do the precise Haversine check on that small set.
    if (doctors.length === 0) {
      matchMode = "radius";
      const { minLat, maxLat, minLng, maxLng } = boundingBox(
        latitude,
        longitude,
        radiusKm
      );

      const candidates = await prisma.doctorProfile.findMany({
        where: {
          ...baseWhere,
          workLatitude: { gte: minLat, lte: maxLat },
          workLongitude: { gte: minLng, lte: maxLng },
        },
        select: doctorNearMeSelect,
        take: 120, // bounding box is already tight — 120 is a safe ceiling
      });

      doctors = candidates
        .filter(
          (d) =>
            d.workLatitude !== null &&
            d.workLongitude !== null &&
            calculateDistanceKm({
              fromLatitude: latitude,
              fromLongitude: longitude,
              toLatitude: d.workLatitude,
              toLongitude: d.workLongitude,
            }) <= radiusKm
        )
        .slice(0, 60);
    }

    // ── Format & sort ───────────────────────────────────────────────────
    const formattedDoctors = doctors
      .map((doctor) => formatDoctor({ doctor, userLatitude: latitude, userLongitude: longitude }))
      .sort((a, b) => {
        const dA = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
        const dB = b.distanceKm ?? Number.MAX_SAFE_INTEGER;
        if (dA !== dB) return dA - dB;
        return (b.googleRating ?? 0) - (a.googleRating ?? 0);
      });

    return NextResponse.json({
      city,
      country,
      matchMode,
      radiusKm,
      doctors: formattedDoctors,
    });
  } catch (error: unknown) {
    console.error("[DOCTORS_NEAR_ME_ERROR]", error);
    return NextResponse.json(
      { error: "Could not load doctors near you." },
      { status: 500 }
    );
  }
}
