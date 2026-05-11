import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "@/i18n/navigation";
import Messenger from "@/components/dashboard/messenger/Messenger";

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

  return (
  <main>
    <Messenger/>
  </main>)
}