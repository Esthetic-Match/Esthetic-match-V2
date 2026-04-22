import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

type SpecialtyId = (typeof DoctorCatalog.specialties)[number]["id"];
type ServiceCategoryId = (typeof DoctorCatalog.serviceCategories)[number]["id"];
type ServiceId = (typeof DoctorCatalog.services)[number]["id"];
type SubzoneId = (typeof DoctorCatalog.subzones)[number]["id"];

const allowedSpecialtyIds = new Set<string>(
  DoctorCatalog.specialties.map((item) => item.id)
);

const allowedServiceCategoryIds = new Set<string>(
  DoctorCatalog.serviceCategories.map((item) => item.id)
);

const allowedServiceIds = new Set<string>(
  DoctorCatalog.services.map((item) => item.id)
);

const allowedSubzoneIds = new Set<string>(
  DoctorCatalog.subzones.map((item) => item.id)
);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSpecialtyId(value: string): value is SpecialtyId {
  return allowedSpecialtyIds.has(value);
}

function isServiceCategoryId(value: string): value is ServiceCategoryId {
  return allowedServiceCategoryIds.has(value);
}

function isServiceId(value: string): value is ServiceId {
  return allowedServiceIds.has(value);
}

function isSubzoneId(value: string): value is SubzoneId {
  return allowedSubzoneIds.has(value);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "DOCTOR") {
    return NextResponse.json(
      { error: "Only doctors can create a doctor profile." },
      { status: 403 }
    );
  }

  const body = await req.json();

  const rawSpecialties: unknown = body.specialties;
  const rawServiceCategories: unknown = body.serviceCategories;
  const rawServices: unknown = body.services;
  const rawSubzones: unknown = body.subzones;

  const otherSpecialtyText =
    typeof body.otherSpecialtyText === "string"
      ? body.otherSpecialtyText.trim()
      : null;

  if (!isStringArray(rawSpecialties)) {
    return NextResponse.json(
      { error: "Specialties must be an array." },
      { status: 400 }
    );
  }

  if (!isStringArray(rawServiceCategories)) {
    return NextResponse.json(
      { error: "Service categories must be an array." },
      { status: 400 }
    );
  }

  if (!isStringArray(rawServices)) {
    return NextResponse.json(
      { error: "Services must be an array." },
      { status: 400 }
    );
  }

  if (!isStringArray(rawSubzones)) {
    return NextResponse.json(
      { error: "Subzones must be an array." },
      { status: 400 }
    );
  }

  const invalidSpecialties = rawSpecialties.filter(
    (value) => !isSpecialtyId(value)
  );

  if (invalidSpecialties.length > 0) {
    return NextResponse.json(
      { error: "One or more selected specialties are invalid." },
      { status: 400 }
    );
  }

  const invalidServiceCategories = rawServiceCategories.filter(
    (value) => !isServiceCategoryId(value)
  );

  if (invalidServiceCategories.length > 0) {
    return NextResponse.json(
      { error: "One or more selected service categories are invalid." },
      { status: 400 }
    );
  }

  const invalidServices = rawServices.filter(
    (value) => !isServiceId(value)
  );

  if (invalidServices.length > 0) {
    return NextResponse.json(
      { error: "One or more selected services are invalid." },
      { status: 400 }
    );
  }

  const invalidSubzones = rawSubzones.filter(
    (value) => !isSubzoneId(value)
  );

  if (invalidSubzones.length > 0) {
    return NextResponse.json(
      { error: "One or more selected subzones are invalid." },
      { status: 400 }
    );
  }

  const specialties = rawSpecialties as SpecialtyId[];
  const serviceCategories = rawServiceCategories as ServiceCategoryId[];
  const services = rawServices as ServiceId[];
  const subzones = rawSubzones as SubzoneId[];

  if (specialties.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one specialty." },
      { status: 400 }
    );
  }

  if (
    specialties.includes("other_specialty") &&
    (!otherSpecialtyText || otherSpecialtyText.length === 0)
  ) {
    return NextResponse.json(
      { error: "Please specify the other specialty." },
      { status: 400 }
    );
  }

  const profile = await prisma.doctorProfile.upsert({
    where: {
      userId: session.user.id,
    },
    update: {
      specialties,
      serviceCategories,
      services,
      subzones,
      otherSpecialtyText,
    },
    create: {
      userId: session.user.id,
      specialties,
      serviceCategories,
      services,
      subzones,
      otherSpecialtyText,
    },
  });

  return NextResponse.json({ success: true, profile });
}