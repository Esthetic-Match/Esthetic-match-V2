// app/api/doctor-profile/social-link/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "en";

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      slug: true,
      paidPlan: true,
      socialMediaLink: true,
    },
  });

  if (!doctorProfile) {
    return NextResponse.json(
      { error: "Doctor profile not found" },
      { status: 404 }
    );
  }

  if (doctorProfile.paidPlan !== "standard") {
    return NextResponse.json(
      { error: "Social profile link is only available on the standard plan" },
      { status: 403 }
    );
  }

  if (!doctorProfile.slug) {
    return NextResponse.json(
      { error: "Doctor profile slug not found" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_APP_URL" },
      { status: 500 }
    );
  }

  const correctLink = `${appUrl}/${locale}/doctor-profile/${doctorProfile.slug}`;

  const isOldBrokenLink =
    doctorProfile.socialMediaLink?.includes("/doctors/") ||
    doctorProfile.socialMediaLink?.includes(doctorProfile.id);

  if (doctorProfile.socialMediaLink && !isOldBrokenLink) {
    return NextResponse.json({
      socialMediaLink: doctorProfile.socialMediaLink,
    });
  }

  const updatedDoctorProfile = await prisma.doctorProfile.update({
    where: {
      id: doctorProfile.id,
    },
    data: {
      socialMediaLink: correctLink,
    },
  });

  return NextResponse.json({
    socialMediaLink: updatedDoctorProfile.socialMediaLink,
  });
}