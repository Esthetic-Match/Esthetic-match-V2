// app/api/admin/doctor-media/[doctorProfileId]/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type RouteContext = {
  params: Promise<{
    doctorProfileId: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { doctorProfileId } = await context.params;
  const body = await req.json();

  const updateData: {
    avatar?: string | null;
    clinicBanner?: string | null;
  } = {};

  if ("avatar" in body) {
    updateData.avatar = body.avatar;
  }

  if ("clinicBanner" in body) {
    updateData.clinicBanner = body.clinicBanner;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid media field provided." },
      { status: 400 }
    );
  }

  const doctorProfile = await prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: updateData,
    select: {
      id: true,
      userId: true,
      clinicName: true,
      avatar: true,
      clinicBanner: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    doctorProfile,
  });
}