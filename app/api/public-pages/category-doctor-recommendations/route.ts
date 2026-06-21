import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

type CategoryDoctorRecommendationRow = {
  id: string;
  avatar: string | null;
  specialtyIds: string[];
  city: string | null;
  country: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  user: {
    name: string | null;
    image: string | null;
  };
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();

    if (!category) {
      return NextResponse.json(
        { error: "Missing category" },
        { status: 400 }
      );
    }

    const doctors: CategoryDoctorRecommendationRow[] =
      await prisma.doctorProfile.findMany({
        take: 4,
        where: {
          subcategoryIds: {
            has: category,
          },
          googleRating: {
            gte: 4,
          },
        },
        orderBy: [
          {
            googleRating: "desc",
          },
          {
            googleReviewCount: "desc",
          },
        ],
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

    const formattedDoctors = doctors.map(
      (doctor: CategoryDoctorRecommendationRow) => ({
        id: doctor.id,
        name: doctor.user.name ?? "Doctor",
        specialtyIds: doctor.specialtyIds.join(", "),
        googleRating: doctor.googleRating?.toString() ?? "",
        googleReviewCount: doctor.googleReviewCount?.toString() ?? "",
        country: [doctor.city, doctor.country].filter(Boolean).join(", "),
        avatar:
          doctor.avatar ??
          doctor.user.image ??
          "/images/default-doctor.png",
      })
    );

    return NextResponse.json(formattedDoctors);
  } catch (error) {
    console.error("Failed to fetch category doctor recommendations:", error);

    return NextResponse.json(
      { error: "Failed to fetch category doctor recommendations" },
      { status: 500 }
    );
  }
}