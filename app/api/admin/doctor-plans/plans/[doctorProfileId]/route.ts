// app/api/admin/doctor-profiles/plans/[doctorProfileId]/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    doctorProfileId: string;
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

  const { doctorProfileId } = await context.params;
  const body = await req.json();

  if (typeof body.isStandard !== "boolean") {
    return NextResponse.json(
      { error: "isStandard must be a boolean." },
      { status: 400 }
    );
  }

  const doctorProfile = await prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: {
      paidPlan: body.isStandard ? "standard" : "free",
    },
    select: {
      id: true,
      clinicName: true,
      paidPlan: true,
      subscriptionPlan: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    doctorProfile,
  });
}