import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "_");
}

function parseList(value: string | null) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();
    const specialty = searchParams.get("specialty")?.trim();
    const location = searchParams.get("location")?.trim();
    const minRating = searchParams.get("minRating")?.trim();

    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || "10"), 1),
      50
    );

    const skip = (page - 1) * limit;

    const categories = parseList(searchParams.get("category"));
    const procedures = parseList(searchParams.get("procedures"));

    const normalizedQ = q ? normalize(q) : undefined;
    const normalizedSpecialty = specialty ? normalize(specialty) : undefined;

    const searchOrFilters = [
      q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" as const } } },
              { clinicName: { contains: q, mode: "insensitive" as const } },
              { city: { contains: q, mode: "insensitive" as const } },
              { country: { contains: q, mode: "insensitive" as const } },
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
        : null,

      specialty
        ? {
            specialtyIds: {
              hasSome: [specialty, normalizedSpecialty].filter(
                Boolean
              ) as string[],
            },
          }
        : null,

      categories && categories.length > 0
        ? {
            subcategoryIds: {
              hasSome: categories,
            },
          }
        : null,

      procedures && procedures.length > 0
        ? {
            procedureIds: {
              hasSome: procedures,
            },
          }
        : null,
    ].filter(Boolean);

    const where = {
      AND: [
        searchOrFilters.length > 0
          ? {
              OR: searchOrFilters as any,
            }
          : {},

        location
          ? {
              OR: [
                { city: { contains: location, mode: "insensitive" as const } },
                {
                  country: {
                    contains: location,
                    mode: "insensitive" as const,
                  },
                },
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
    };

    const doctors = await prisma.doctorProfile.findMany({
      skip,
      take: limit + 1,
      where,
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

    const hasMore = doctors.length > limit;

    const formattedDoctors = doctors.slice(0, limit).map((doctor) => ({
      id: doctor.id,
      name: doctor.user.name ?? "Doctor",
      specialtyIds: doctor.specialtyIds.join(", "),
      googleRating: doctor.googleRating?.toString() ?? "",
      googleReviewCount: doctor.googleReviewCount?.toString() ?? "",
      country: [doctor.city, doctor.country].filter(Boolean).join(", "),
      avatar: doctor.avatar ?? doctor.user.image ?? "/images/default-doctor.png",
    }));

    return NextResponse.json({
      doctors: formattedDoctors,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error("Failed to fetch public doctor profiles:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor profiles" },
      { status: 500 }
    );
  }
}