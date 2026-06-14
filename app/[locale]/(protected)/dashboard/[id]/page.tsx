import { headers } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth/auth";

import DoctorProfile from "@/components/dashboard/profile/DoctorProfile";
import PatientProfile from "@/components/dashboard/profile/PatientProfile";

type PageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { id, locale } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect({
      href: "/sign-in",
      locale,
    });
  }

  if (session?.user.id !== id) {
    redirect({
      href: "/dashboard",
      locale,
    });
  }

  if (session?.user.role === "DOCTOR") {
    return <DoctorProfile user={session.user} />;
  }

  if (session?.user.role === "PATIENT") {
    return <PatientProfile user={session.user} />;
  }

  redirect({
    href: "/dashboard",
    locale,
  });
}