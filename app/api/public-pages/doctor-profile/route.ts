import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "_");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();
    const specialty = searchParams.get("specialty")?.trim();
    const category = searchParams.get("category")?.trim();
    const location = searchParams.get("location")?.trim();
    const minRating = searchParams.get("minRating")?.trim();

    const procedures = searchParams
      .get("procedures")
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const normalizedQ = q ? normalize(q) : undefined;
    const normalizedSpecialty = specialty ? normalize(specialty) : undefined;
    const normalizedCategory = category ? normalize(category) : undefined;

    const hasFilters =
      q ||
      specialty ||
      category ||
      location ||
      minRating ||
      (procedures && procedures.length > 0);

    const doctors = await prisma.doctorProfile.findMany({
      take: hasFilters ? undefined : 4,
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
                subcategoryIds: {
                  hasSome: [category, normalizedCategory].filter(
                    Boolean
                  ) as string[],
                },
              }
            : {},

          procedures && procedures.length > 0
            ? {
                procedureIds: {
                  hasSome: procedures,
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