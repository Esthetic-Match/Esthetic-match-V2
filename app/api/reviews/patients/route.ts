import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            "Sign in to access the patient list.",
          code:
            "PATIENT_OPTIONS_AUTH_REQUIRED",
        },
        {
          status: 401,
        }
      );
    }

    const patients =
      await prisma.user.findMany({
        where: {
          role: "PATIENT",
        },
        orderBy: [
          {
            name: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          patientProfile: {
            select: {
              avatar: true,
              preferredLanguage: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        patients: patients.map(
          (patient) => ({
            id: patient.id,
            name: patient.name,
            email: patient.email,
            image:
              patient.patientProfile
                ?.avatar ??
              patient.image,
            preferredLanguage:
              patient.patientProfile
                ?.preferredLanguage ??
              null,
            registeredAt:
              patient.createdAt.toISOString(),
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
      "Could not load patients:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load patients.",
        code:
          "PATIENT_OPTIONS_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}
