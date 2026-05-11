import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedFields = [
  "clinicName",
  "clinicBanner",
  "avatar",
  "yearsOfExperience",
  "specialtyIds",
  "subcategoryIds",
  "procedureIds",
  "subzoneIds",
  "workAddress",
  "city",
  "country",
  "zipCode",
  "topThree",
  "workLatitude",
  "workLongitude",
  "googlePlaceId",
  "googleRating",
  "googleReviewCount",
  "googleMapsUri",
  "otherSpecialtyText",
  "inClinicPrice",
  "onlineConsulPrice",
  "socialMediaLink",
  "bookingLinks",
  "inClinicLink"
] as const;

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
  const yearsOfExperience = nullableNumber(body.yearsOfExperience) 

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  if (!clinicName) {
    return NextResponse.json({ error: "Clinic name is required." }, { status: 400 });
  }

  if (!workAddress) {
    return NextResponse.json({ error: "Clinic address is required." }, { status: 400 });
  }

  if (!city) {
    return NextResponse.json({ error: "City is required." }, { status: 400 });
  }

  if (!country) {
    return NextResponse.json({ error: "Country is required." }, { status: 400 });
  }

  if (!zipCode) {
    return NextResponse.json({ error: "Clinic zip code is required." }, { status: 400 });
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

  const profile = await prisma.doctorProfile.upsert({
    where: {
      userId,
    },
    update: {
      clinicName,
      workAddress,
      city,
      country,
      zipCode,
      workLatitude: nullableNumber(body.workLatitude),
      workLongitude: nullableNumber(body.workLongitude),
    },
    create: {
      userId,
      clinicName,
      workAddress,
      city,
      country,
      zipCode,
      yearsOfExperience,
      workLatitude: nullableNumber(body.workLatitude),
      workLongitude: nullableNumber(body.workLongitude),

      specialtyIds: [],
      subcategoryIds: [],
      procedureIds: [],
      subzoneIds: [],
    },
  });

  return NextResponse.json({ success: true, profile });
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const profile = await prisma.doctorProfile.update({
      where: {
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("PATCH doctor profile error:", error);

    return NextResponse.json(
      { error: "Could not update doctor profile" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.doctorProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET doctor profile error:", error);

    return NextResponse.json(
      { error: "Could not fetch doctor profile" },
      { status: 500 }
    );
  }
}