import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

    const searchOrFiltersRaw: (Prisma.DoctorProfileWhereInput | null)[] = [
      q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" } } },
              { clinicName: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { country: { contains: q, mode: "insensitive" } },
              {
                specialtyIds: {
                  hasSome: [q, normalizedQ].filter(
                    (value): value is string => Boolean(value)
                  ),
                },
              },
              {
                subcategoryIds: {
                  hasSome: [q, normalizedQ].filter(
                    (value): value is string => Boolean(value)
                  ),
                },
              },
              {
                procedureIds: {
                  hasSome: [q, normalizedQ].filter(
                    (value): value is string => Boolean(value)
                  ),
                },
              },
            ],
          }
        : null,
        
      specialty
        ? {
            specialtyIds: {
              hasSome: [specialty, normalizedSpecialty].filter(
                (value): value is string => Boolean(value)
              ),
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
    ];

    const searchOrFilters = searchOrFiltersRaw.filter(
      (filter): filter is Prisma.DoctorProfileWhereInput => filter !== null
    );

    const where: Prisma.DoctorProfileWhereInput = {
      AND: [
        searchOrFilters.length > 0
          ? {
              OR: searchOrFilters,
            }
          : {},
          
        location
          ? {
              OR: [
                { city: { contains: location, mode: "insensitive" } },
                {
                  country: {
                    contains: location,
                    mode: "insensitive",
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
      slug: true,
      avatar: true,
      specialtyIds: true,

      city: true,
      country: true,

      yearsOfExperience: true,
      inClinicPrice: true,
      onlineConsulPrice: true,
      currency: true,

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
      slug: doctor.slug,
      name: doctor.user.name ?? "Doctor",
    
      specialtyIds: doctor.specialtyIds,
    
      city: doctor.city,
      country: doctor.country,
    
      googleRating: doctor.googleRating,
      googleReviewCount: doctor.googleReviewCount,
    
      yearsOfExperience: doctor.yearsOfExperience,
    
      inClinicPrice: doctor.inClinicPrice,
      onlineConsulPrice: doctor.onlineConsulPrice,
      currency: doctor.currency,
    
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