import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Settings from "@/components/settings/Settings";

export default async function SettingsPage() {
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

  return <Settings user={user} />;
}