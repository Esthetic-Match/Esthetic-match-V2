import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        avatar: true,
        specialtyIds: true,
        city: true,
        country: true,
        googleRating: true,
        googleReviewCount: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.user.name ?? "Doctor",
      specialtyIds: doctor.specialtyIds.join(", "),
      googleRating: doctor.googleRating?.toString() ?? "",
      googleReviewCount: doctor.googleReviewCount?.toString() ?? "",
      country: [doctor.city, doctor.country].filter(Boolean).join(", "),
      avatar: doctor.avatar ?? doctor.user.image ?? "/images/default-doctor.png",
    }));

    return NextResponse.json(formattedDoctors);
  } catch (error) {
    console.error("Failed to fetch recent doctor profiles:", error);

    return NextResponse.json(
      { error: "Failed to fetch recent doctor profiles" },
      { status: 500 }
    );
  }
}