import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { doctorId } = await context.params;
  const normalizedDoctorId = doctorId.trim();

  if (!normalizedDoctorId) {
    return NextResponse.json(
      { error: "A doctor ID is required." },
      { status: 400 },
    );
  }

  const profile = await prisma.doctorProfile.findFirst({
    where: {
      OR: [
        { id: normalizedDoctorId },
        { userId: normalizedDoctorId },
        { slug: normalizedDoctorId },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Doctor profile not found." },
      { status: 404 },
    );
  }

  const links = await prisma.doctorSocialMedia.findMany({
    where: {
      doctorProfileId: profile.id,
      isVisible: true,
    },
    select: {
      id: true,
      platform: true,
      url: true,
      username: true,
      label: true,
      sortOrder: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ links });
}