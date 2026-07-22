import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authorizationError = await requireAdmin(request);

    if (authorizationError) {
      return authorizationError;
    }

    const doctorProfiles = await prisma.doctorProfile.findMany({
      where: {
        user: {
          is: {
            role: "DOCTOR",
          },
        },
      },
      select: {
        id: true,
        userId: true,
        clinicName: true,
        avatar: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const doctors = doctorProfiles
      .map((doctorProfile) => ({
        userId: doctorProfile.userId,
        doctorProfileId: doctorProfile.id,
        name: doctorProfile.user.name,
        email: doctorProfile.user.email,
        clinicName: doctorProfile.clinicName,
        avatar: doctorProfile.avatar ?? doctorProfile.user.image,
      }))
      .sort((firstDoctor, secondDoctor) => {
        const firstLabel =
          firstDoctor.name?.trim() ||
          firstDoctor.clinicName.trim() ||
          firstDoctor.email;
        const secondLabel =
          secondDoctor.name?.trim() ||
          secondDoctor.clinicName.trim() ||
          secondDoctor.email;

        return firstLabel.localeCompare(secondLabel, undefined, {
          sensitivity: "base",
        });
      });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Could not load admin doctors:", error);

    return NextResponse.json(
      { error: "Could not load the doctors." },
      { status: 500 },
    );
  }
}