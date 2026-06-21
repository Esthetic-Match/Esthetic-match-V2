// app/api/public-pages/doctors-near-me/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

type QueryMode = "insensitive";

type StringFilter = {
  equals?: string;
  not?: string | null;
  mode?: QueryMode;
};

type NumberNullableFilter = {
  gte?: number;
  lte?: number;
};

type UserWhereInput = {
  role?: "DOCTOR";
  onboardingCompleted?: boolean;
};

type UserRelationFilter = {
  is?: UserWhereInput;
};

type DoctorProfileWhereInput = {
  slug?: StringFilter;
  city?: StringFilter;
  country?: StringFilter;
  workLatitude?: NumberNullableFilter;
  workLongitude?: NumberNullableFilter;
  user?: UserRelationFilter;
};

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

type DoctorNearMeResult = {
  id: string;
  slug: string | null;
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
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;
  currency: string;
  workLatitude: number | null;
  workLongitude: number | null;
  clinicBanner: string | null;
  user: {
    name: string | null;
    image: string | null;
  };
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
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;
  currency: string;
  distanceKm: number | null;
  clinicBanner: string | null;
  workLatitude: number | null;
  workLongitude: number | null;
};

const doctorNearMeSelect = {
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
  clinicBanner: true,
  user: {
    select: {
      name: true,
      image: true,
    },
  },
} as const;

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
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLatitude - fromLatitude);
  const dLon = toRadians(toLongitude - fromLongitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

function findAddressComponent(
  components: GeocodeAddressComponent[],
  acceptedTypes: string[]
) {
  return components.find((component: GeocodeAddressComponent) =>
    acceptedTypes.every((type: string) => component.types.includes(type))
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

  if (!apiKey) {
    return { city: null, country: null };
  }

  try {
    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: apiKey,
      language: locale === "fr" ? "fr" : "en",
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5_000);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      {
        cache: "no-store",
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return { city: null, country: null };
    }

    const data = (await response.json()) as GeocodeResponse;

    if (data.status !== "OK" || !data.results?.length) {
      return { city: null, country: null };
    }

    const components = data.results.flatMap((result: GeocodeResult) =>
      result.address_components ?? []
    );

    const city =
      findAddressComponent(components, ["locality", "political"]) ??
      findAddressComponent(components, ["postal_town"]) ??
      findAddressComponent(components, [
        "administrative_area_level_2",
        "political",
      ]) ??
      findAddressComponent(components, ["sublocality", "political"]) ??
      null;

    const country =
      findAddressComponent(components, ["country", "political"]) ?? null;

    return { city, country };
  } catch {
    return { city: null, country: null };
  }
}

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
    clinicBanner: doctor.clinicBanner,
    workLatitude: doctor.workLatitude,
    workLongitude: doctor.workLongitude,
  };
}

export async function POST(req: Request) {
  try {
    const rawBody = (await req.json().catch(() => null)) as unknown;
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

    const baseWhere: DoctorProfileWhereInput = {
      slug: {
        not: null,
      },
      user: {
        is: {
          role: "DOCTOR",
          onboardingCompleted: true,
        },
      },
    };

    let doctors: DoctorNearMeResult[] = [];
    let matchMode: "city" | "radius" = "city";
    const radiusKm = 50;

    if (city) {
      doctors = await prisma.doctorProfile.findMany({
        where: {
          ...baseWhere,
          city: {
            equals: city,
            mode: "insensitive",
          },
          ...(country
            ? {
                country: {
                  equals: country,
                  mode: "insensitive",
                },
              }
            : {}),
        },
        select: doctorNearMeSelect,
        take: 60,
      });
    }

    if (doctors.length === 0) {
      matchMode = "radius";

      const { minLat, maxLat, minLng, maxLng } = boundingBox(
        latitude,
        longitude,
        radiusKm
      );

      const candidates: DoctorNearMeResult[] =
        await prisma.doctorProfile.findMany({
          where: {
            ...baseWhere,
            workLatitude: {
              gte: minLat,
              lte: maxLat,
            },
            workLongitude: {
              gte: minLng,
              lte: maxLng,
            },
          },
          select: doctorNearMeSelect,
          take: 120,
        });

      doctors = candidates
        .filter((doctor: DoctorNearMeResult) => {
          if (doctor.workLatitude === null || doctor.workLongitude === null) {
            return false;
          }

          return (
            calculateDistanceKm({
              fromLatitude: latitude,
              fromLongitude: longitude,
              toLatitude: doctor.workLatitude,
              toLongitude: doctor.workLongitude,
            }) <= radiusKm
          );
        })
        .slice(0, 60);
    }

    const formattedDoctors = doctors
      .map((doctor: DoctorNearMeResult) =>
        formatDoctor({
          doctor,
          userLatitude: latitude,
          userLongitude: longitude,
        })
      )
      .sort((firstDoctor: DoctorCardDto, secondDoctor: DoctorCardDto) => {
        const firstDistance =
          firstDoctor.distanceKm ?? Number.MAX_SAFE_INTEGER;
        const secondDistance =
          secondDoctor.distanceKm ?? Number.MAX_SAFE_INTEGER;

        if (firstDistance !== secondDistance) {
          return firstDistance - secondDistance;
        }

        return (
          (secondDoctor.googleRating ?? 0) - (firstDoctor.googleRating ?? 0)
        );
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