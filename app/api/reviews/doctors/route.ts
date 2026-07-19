import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const doctors =
      await prisma.doctorProfile.findMany({
        orderBy: [
          {
            clinicName: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: {
          id: true,
          clinicName: true,
          avatar: true,
          city: true,
          country: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        doctors: doctors.map(
          (doctor) => ({
            id: doctor.id,
            name: doctor.user.name,
            clinicName:
              doctor.clinicName,
            avatar: doctor.avatar,
            city: doctor.city,
            country: doctor.country,
          })
        ),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Could not load doctors:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load doctors.",
        code:
          "DOCTOR_OPTIONS_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}
