// app/api/public-pages/doctors-near-me/route.ts

import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

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

type DoctorDistanceResult = {
  doctor: DoctorNearMeResult;
  distanceKm: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDoctorsNearMeBody(
  body: unknown
): DoctorsNearMeRequestBody | null {
  if (!isRecord(body)) return null;

  const latitude = body.latitude;
  const longitude = body.longitude;
  const locale = body.locale;

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

  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findAddressComponent(
  components: GeocodeAddressComponent[],
  acceptedTypes: string[]
) {
  return components.find((component) =>
    acceptedTypes.every((type) => component.types.includes(type))
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
}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      city: null,
      country: null,
    };
  }

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: apiKey,
    language: locale === "fr" ? "fr" : "en",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return {
      city: null,
      country: null,
    };
  }

  const data: GeocodeResponse = await response.json();

  if (data.status !== "OK" || !data.results?.length) {
    return {
      city: null,
      country: null,
    };
  }

  const components = data.results.flatMap(
    (result) => result.address_components ?? []
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

  return {
    city,
    country,
  };
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
  };
}

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
      slug: {
        not: null,
      },
      user: {
        is: {
          role: UserRole.DOCTOR,
          onboardingCompleted: true,
        },
      },
    };

    let doctors: DoctorNearMeResult[] = [];

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

    let matchMode: "city" | "radius" = "city";
    const radiusKm = 50;

    if (doctors.length === 0) {
      matchMode = "radius";

      const candidates: DoctorNearMeResult[] =
        await prisma.doctorProfile.findMany({
          where: {
            ...baseWhere,
            workLatitude: {
              not: null,
            },
            workLongitude: {
              not: null,
            },
          },
          select: doctorNearMeSelect,
          take: 300,
        });

      const nearbyDoctors: DoctorDistanceResult[] = candidates
        .filter(
          (doctor) =>
            doctor.workLatitude !== null && doctor.workLongitude !== null
        )
        .map((doctor) => ({
          doctor,
          distanceKm: calculateDistanceKm({
            fromLatitude: latitude,
            fromLongitude: longitude,
            toLatitude: doctor.workLatitude as number,
            toLongitude: doctor.workLongitude as number,
          }),
        }))
        .filter((item) => item.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 60);

      doctors = nearbyDoctors.map((item) => item.doctor);
    }

    const formattedDoctors = doctors
      .map((doctor) =>
        formatDoctor({
          doctor,
          userLatitude: latitude,
          userLongitude: longitude,
        })
      )
      .sort((a, b) => {
        const distanceA = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
        const distanceB = b.distanceKm ?? Number.MAX_SAFE_INTEGER;

        if (distanceA !== distanceB) return distanceA - distanceB;

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