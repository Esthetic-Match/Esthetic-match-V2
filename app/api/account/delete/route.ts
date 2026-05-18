import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        doctorProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (user.doctorProfile?.id) {
        await tx.beforeAfterCase.deleteMany({
          where: {
            doctorId: user.doctorProfile.id,
          },
        });
      }

      await tx.beforeAfterCase.deleteMany({
        where: {
          patientId: userId,
        },
      });

      await tx.user.delete({
        where: {
          id: userId,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);

    return NextResponse.json(
      {
        error: "Failed to delete account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}