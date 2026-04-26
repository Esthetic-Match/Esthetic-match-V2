import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const specialtyIds = Array.isArray(body.specialtyIds)
    ? body.specialtyIds
    : Array.isArray(body.specialties)
    ? body.specialties
    : [];

  const subcategoryIds = Array.isArray(body.subcategoryIds)
    ? body.subcategoryIds
    : Array.isArray(body.serviceCategories)
    ? body.serviceCategories
    : [];

  const procedureIds = Array.isArray(body.procedureIds)
    ? body.procedureIds
    : Array.isArray(body.services)
    ? body.services
    : [];

  const otherSpecialtyText =
    typeof body.otherSpecialtyText === "string"
      ? body.otherSpecialtyText.trim()
      : null;

  const profile = await prisma.doctorProfile.upsert({
    where: {
      userId: session.user.id,
    },
    update: {
      specialtyIds,
      subcategoryIds,
      procedureIds,
      subzoneIds: [], // you said ignore subzones
      otherSpecialtyText,
    },
    create: {
      userId: session.user.id,
      specialtyIds,
      subcategoryIds,
      procedureIds,
      subzoneIds: [], // required by schema, just empty
      otherSpecialtyText,
    },
  });

  return NextResponse.json({ success: true, profile });
}