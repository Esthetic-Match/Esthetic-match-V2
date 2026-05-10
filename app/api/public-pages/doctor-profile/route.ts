import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();
    const specialty = searchParams.get("specialty")?.trim();
    const category = searchParams.get("category")?.trim();
    const location = searchParams.get("location")?.trim();
    const minRating = searchParams.get("minRating")?.trim();

    const normalizedQ = q?.toLowerCase().replace(/\s+/g, "_");
    const normalizedProcedure = category?.toLowerCase().replace(/\s+/g, "_");
    const normalizedSpecialty = specialty?.toLowerCase().replace(/\s+/g, "_");

    const doctors = await prisma.doctorProfile.findMany({
      take: q || specialty || category || location || minRating ? undefined : 4,
      where: {
        AND: [
          q
            ? {
                OR: [
                  { user: { name: { contains: q, mode: "insensitive" } } },
                  { clinicName: { contains: q, mode: "insensitive" } },
                  { city: { contains: q, mode: "insensitive" } },
                  { country: { contains: q, mode: "insensitive" } },
                  {
                    specialtyIds: {
                      hasSome: [q, normalizedQ].filter(Boolean) as string[],
                    },
                  },
                  {
                    subcategoryIds: {
                      hasSome: [q, normalizedQ].filter(Boolean) as string[],
                    },
                  },
                  {
                    procedureIds: {
                      hasSome: [q, normalizedQ].filter(Boolean) as string[],
                    },
                  },
                ],
              }
            : {},
          specialty
            ? {
                specialtyIds: {
                  hasSome: [specialty, normalizedSpecialty].filter(
                    Boolean
                  ) as string[],
                },
              }
            : {},
          category
            ? {
                procedureIds: {
                  hasSome: [category, normalizedProcedure].filter(
                    Boolean
                  ) as string[],
                },
              }
            : {},
          location
            ? {
                OR: [
                  { city: { contains: location, mode: "insensitive" } },
                  { country: { contains: location, mode: "insensitive" } },
                ],
              }
            : {},
          minRating
            ? {
                googleRating: {
                  gte: Number(minRating),
                },
              }
            : {},
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        avatar: true,
        specialtyIds: true,
        subcategoryIds: true,
        procedureIds: true,
        city: true,
        country: true,
        clinicName: true,
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
    console.error("Failed to fetch public doctor profiles:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor profiles" },
      { status: 500 }
    );
  }
}