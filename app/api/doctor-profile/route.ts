import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

const allowedSpecialties = new Set<string>(DoctorCatalog.specialties.items);

const allowedServices = new Set<string>(
  DoctorCatalog.categories.flatMap((category) => category.items)
);

const allowedSubzones = new Set<string>([
  ...DoctorCatalog.subzones.faceAndGeneralAreas.items,
  ...DoctorCatalog.subzones.bodySubzones.items,
]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function getUniqueValues(values: string[]) {
  return [...new Set(values)];
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

  const rawSpecialties: unknown = body.specialties ?? body.specialtyIds;
  const rawServices: unknown = body.services ?? body.serviceIds;
  const rawSubzones: unknown = body.subzones ?? body.subzoneIds;

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

  const specialtyIds = getUniqueValues(rawSpecialties);
  const serviceIds = getUniqueValues(rawServices);
  const subzoneIds = getUniqueValues(rawSubzones);

  const invalidSpecialties = specialtyIds.filter(
    (value) => !allowedSpecialties.has(value)
  );

  if (invalidSpecialties.length > 0) {
    return NextResponse.json(
      {
        error: "One or more selected specialties are invalid.",
        invalidValues: invalidSpecialties,
      },
      { status: 400 }
    );
  }

  const invalidServices = serviceIds.filter(
    (value) => !allowedServices.has(value)
  );

  if (invalidServices.length > 0) {
    return NextResponse.json(
      {
        error: "One or more selected services are invalid.",
        invalidValues: invalidServices,
      },
      { status: 400 }
    );
  }

  const invalidSubzones = subzoneIds.filter(
    (value) => !allowedSubzones.has(value)
  );

  if (invalidSubzones.length > 0) {
    return NextResponse.json(
      {
        error: "One or more selected subzones are invalid.",
        invalidValues: invalidSubzones,
      },
      { status: 400 }
    );
  }

  if (specialtyIds.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one specialty." },
      { status: 400 }
    );
  }

  if (
    specialtyIds.includes("other specialty") &&
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
      specialtyIds,
      serviceIds,
      subzoneIds,
      otherSpecialtyText,
    },
    create: {
      userId: session.user.id,
      specialtyIds,
      serviceIds,
      subzoneIds,
      otherSpecialtyText,
    },
  });

  return NextResponse.json({ success: true, profile });
}