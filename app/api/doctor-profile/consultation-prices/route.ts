// app/api/doctor-profile/consultation-prices/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const inClinicPrice = Number(body.inClinicPrice);
  const onlineConsulPrice = Number(body.onlineConsulPrice);

  if (!inClinicPrice || inClinicPrice <= 0) {
    return NextResponse.json(
      { error: "Invalid in-clinic consultation price" },
      { status: 400 }
    );
  }

  if (!onlineConsulPrice || onlineConsulPrice <= 0) {
    return NextResponse.json(
      { error: "Invalid online consultation price" },
      { status: 400 }
    );
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!doctorProfile) {
    return NextResponse.json(
      { error: "Doctor profile not found" },
      { status: 404 }
    );
  }

  const updatedDoctorProfile = await prisma.doctorProfile.update({
    where: {
      id: doctorProfile.id,
    },
    data: {
      inClinicPrice,
      onlineConsulPrice,
    },
  });

  return NextResponse.json({
    success: true,
    doctorProfile: updatedDoctorProfile,
  });
}