import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NavPanel } from "@/components/dashboard/NavPanel";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // onboarding guard
  if (
    session.user.role === "DOCTOR" &&
    !session.user.onboardingCompleted
  ) {
    redirect("/dashboard/onboarding");
  }

  return (
    <main>
      <NavPanel />
    </main>
  );
}