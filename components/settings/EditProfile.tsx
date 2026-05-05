
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PatientEditProfile from "./PatientEditProfile";
import DoctorEditProfile from "./DoctorEditProfile";

export default async function EditProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      patientProfile: true,
      doctorProfile: true,
    },
  });

  if (!user) {
    return null;
  }

  if (user.role === "DOCTOR") {
    return <DoctorEditProfile user={user} doctorProfile={user.doctorProfile} />;
  }

  return <PatientEditProfile user={user} patientProfile={user.patientProfile} />;
}