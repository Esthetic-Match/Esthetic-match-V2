import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing doctor profile id" },
        { status: 400 }
      );
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doctorProfile);
  } catch (error) {
    console.error("Failed to fetch single public doctor profile:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor profile" },
      { status: 500 }
    );
  }
}