import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized: Please log out and sign in again to verify your identity" }, { status: 401 });
  }

  const body = await req.json();

  const { specialtyIds, subcategoryIds, procedureIds, otherSpecialtyText } =
    body;

  await prisma.doctorProfile.update({
    where: {
      userId: session.user.id,
    },
    data: {
      specialtyIds,
      subcategoryIds,
      procedureIds,
      otherSpecialtyText,
    },
  });

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      onboardingCompleted: true,
    },
  });

  return NextResponse.json({ ok: true });
}

