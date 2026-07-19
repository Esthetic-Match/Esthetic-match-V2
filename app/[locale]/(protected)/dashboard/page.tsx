import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import { auth } from "@/lib/auth/auth";
import { redirect } from "@/i18n/navigation";
import { headers } from "next/headers";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: "en" | "fr" }>;
}) {
  const { locale } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect({
      href: "/sign-in",
      locale,
    });
  }

  if (
    session?.user.role === "DOCTOR" &&
    !session.user.onboardingCompleted
  ) {
    redirect({
      href: "/dashboard/onboarding",
      locale,
    });
  }

  if (session?.user.role === "DOCTOR") {
    return <DoctorDashboard />;
  }

  if (session?.user.role === "PATIENT") {
    return <PatientDashboard />;
  }

  redirect({
    href: "/dashboard/adminPanel",
    locale,
  });
}