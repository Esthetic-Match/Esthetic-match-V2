import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function unique(values: string[]) {
  return [...new Set(values)];
}

const validSpecialties = new Set<string>(DoctorCatalog.specialties.items);

const validServiceCategories = new Set<string>(
  DoctorCatalog.categories.flatMap((category) =>
    category.subcategories.map((subcategory) => subcategory.subcategory)
  )
);

const validServices = new Set<string>(
  DoctorCatalog.categories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      subcategory.procedures.map((procedure) => procedure.id)
    )
  )
);

function filterValidValues(values: string[], validValues: Set<string>) {
  return unique(values).filter((value) => validValues.has(value));
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

  const body: unknown = await req.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = body as {
    specialties?: unknown;
    serviceCategories?: unknown;
    services?: unknown;
    otherSpecialtyText?: unknown;
  };

  const specialties = filterValidValues(
    isStringArray(payload.specialties) ? payload.specialties : [],
    validSpecialties
  );

  const serviceCategories = filterValidValues(
    isStringArray(payload.serviceCategories) ? payload.serviceCategories : [],
    validServiceCategories
  );

  const services = filterValidValues(
    isStringArray(payload.services) ? payload.services : [],
    validServices
  );

  const otherSpecialtyText =
    typeof payload.otherSpecialtyText === "string"
      ? payload.otherSpecialtyText.trim()
      : null;

  if (specialties.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one specialty." },
      { status: 400 }
    );
  }

  if (services.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one procedure." },
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
      otherSpecialtyText,
    },
    create: {
      userId: session.user.id,
      specialties,
      serviceCategories,
      services,
      otherSpecialtyText,
    },
  });

  return NextResponse.json({ success: true, profile });
}