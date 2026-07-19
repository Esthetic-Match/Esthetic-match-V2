import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

function getPublicPatientName(
  name: string | null
): string | null {
  const normalized = name
    ?.trim()
    .replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  const parts = normalized.split(" ");

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastName =
    parts[parts.length - 1];

  return `${firstName} ${lastName
    .slice(0, 1)
    .toUpperCase()}.`;
}

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { doctorId } =
      await context.params;

    const normalizedDoctorProfileId =
      doctorId.trim();

    if (
      !normalizedDoctorProfileId ||
      normalizedDoctorProfileId.length > 191
    ) {
      return NextResponse.json(
        {
          error:
            "A valid doctor profile ID is required.",
          code:
            "INVALID_DOCTOR_PROFILE_ID",
        },
        {
          status: 400,
        }
      );
    }

    const doctorProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          id: normalizedDoctorProfileId,
        },
        select: {
          id: true,
        },
      });

    if (!doctorProfile) {
      return NextResponse.json(
        {
          error:
            "Doctor profile not found.",
          code:
            "DOCTOR_PROFILE_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    const reviews =
      await prisma.review.findMany({
        where: {
          doctorProfileId:
            doctorProfile.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          review: true,
          rating: true,
          createdAt: true,
          patientUser: {
            select: {
              name: true,
            },
          },
        },
      });

    const totalReviews =
      reviews.length;

    const ratingTotal =
      reviews.reduce(
        (total, review) =>
          total + review.rating,
        0
      );

    const averageRating =
      totalReviews > 0
        ? ratingTotal / totalReviews
        : 0;

    return NextResponse.json(
      {
        summary: {
          totalReviews,
          averageRating,
        },
        reviews: reviews.map(
          (review) => ({
            id: review.id,
            title: review.title,
            review: review.review,
            rating: review.rating,
            createdAt:
              review.createdAt.toISOString(),
            patientName:
              getPublicPatientName(
                review.patientUser.name
              ),
          })
        ),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error(
      "Could not load public doctor reviews:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load doctor reviews.",
        code:
          "PUBLIC_DOCTOR_REVIEWS_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}