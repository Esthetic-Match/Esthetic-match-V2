// app/api/admin/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;
  const body = await req.json();

  const updateData: {
    emailVerified?: boolean;
    onboardingCompleted?: boolean;
  } = {};

  if (typeof body.emailVerified === "boolean") {
    updateData.emailVerified = body.emailVerified;
  }

  if (typeof body.onboardingCompleted === "boolean") {
    updateData.onboardingCompleted = body.onboardingCompleted;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided." },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      onboardingCompleted: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, user });
}