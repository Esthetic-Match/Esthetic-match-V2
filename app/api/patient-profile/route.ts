import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(req: Request) {
  const body = await req.json();

  const userId = requiredString(body.userId);

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found." },
      { status: 404 }
    );
  }

  if (user.role !== "PATIENT") {
    return NextResponse.json(
      { error: "User is not registered as a patient." },
      { status: 400 }
    );
  }

  const patientProfile = await prisma.patientProfile.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      userId,
    },
  });

  return NextResponse.json({
    success: true,
    patientProfile,
  });
}