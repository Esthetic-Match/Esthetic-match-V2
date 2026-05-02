import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function nullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function POST(req: Request) {
  const body = await req.json();

  const userId = requiredString(body.userId);
  const clinicName = requiredString(body.clinicName);
  const workAddress = requiredString(body.workAddress);
  const city = requiredString(body.city);
  const country = requiredString(body.country);
  const zipCode = requiredString(body.zipCode);

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  if (!clinicName) {
    return NextResponse.json(
      { error: "Clinic name is required." },
      { status: 400 }
    );
  }

  if (!workAddress) {
    return NextResponse.json(
      { error: "Work address is required." },
      { status: 400 }
    );
  }

  if (!city) {
    return NextResponse.json({ error: "City is required." }, { status: 400 });
  }

  if (!country) {
    return NextResponse.json(
      { error: "Country is required." },
      { status: 400 }
    );
  }

  if (!zipCode) {
    return NextResponse.json(
      { error: "Zip code is required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.role !== "DOCTOR") {
    return NextResponse.json(
      { error: "User is not registered as a doctor." },
      { status: 400 }
    );
  }

  const specialtyIds = stringArray(body.specialtyIds ?? body.specialties);
  const subcategoryIds = stringArray(
    body.subcategoryIds ?? body.serviceCategories
  );
  const procedureIds = stringArray(body.procedureIds ?? body.services);
  const subzoneIds = stringArray(body.subzoneIds ?? body.subzones);

  if (specialtyIds.length === 0) {
    return NextResponse.json(
      { error: "At least one specialty is required." },
      { status: 400 }
    );
  }

  const profile = await prisma.doctorProfile.upsert({
    where: {
      userId,
    },
    update: {
      clinicName,
      specialtyIds,
      subcategoryIds,
      procedureIds,
      subzoneIds,
      workAddress,
      city,
      country,
      zipCode,
      workLatitude: nullableNumber(body.workLatitude),
      workLongitude: nullableNumber(body.workLongitude),
      googlePlaceId: nullableString(body.googlePlaceId),
      otherSpecialtyText: nullableString(body.otherSpecialtyText),
    },
    create: {
      userId,
      clinicName,
      specialtyIds,
      subcategoryIds,
      procedureIds,
      subzoneIds,
      workAddress,
      city,
      country,
      zipCode,
      workLatitude: nullableNumber(body.workLatitude),
      workLongitude: nullableNumber(body.workLongitude),
      googlePlaceId: nullableString(body.googlePlaceId),
      otherSpecialtyText: nullableString(body.otherSpecialtyText),
    },
  });

  return NextResponse.json({ success: true, profile });
}