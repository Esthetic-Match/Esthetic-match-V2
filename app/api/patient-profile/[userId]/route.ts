import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};


const allowedFields = [
  "avatar",
  "gender",
  "phoneNumber",
  "city",
  "country",
  "zipCode",
  "address",
  "latitude",
  "longitude",
  "googlePlaceId",
  "preferredConsultationType",
  "preferredLanguage",
  "notes",
  "stripeCustomerId",
  "favorite"
] as const;

export async function GET(_req: Request, context: RouteContext) {
  const { userId } = await context.params;

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          dateOfBirth: true,
        },
      },
    },
  });

  if (!patientProfile) {
    return NextResponse.json(
      { error: "Patient profile not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ patientProfile });
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "You can only update your own profile." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if ("favorite" in body) {
      const currentProfile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
        select: { favorite: true },
      });
    
      const currentFavorites = currentProfile?.favorite ?? [];
      const doctorProfileId = Array.isArray(body.favorite)
        ? body.favorite[0]
        : body.favorite;
    
      if (typeof doctorProfileId === "string") {
        updateData.favorite = currentFavorites.includes(doctorProfileId)
          ? currentFavorites.filter((id) => id !== doctorProfileId)
          : [...currentFavorites, doctorProfileId];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const patientProfile = await prisma.patientProfile.update({
      where: {
        userId: session.user.id,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            dateOfBirth: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      patientProfile,
    });
  } catch (error) {
    console.error("PATCH patient profile error:", error);

    return NextResponse.json(
      { error: "Could not update patient profile" },
      { status: 500 }
    );
  }
}