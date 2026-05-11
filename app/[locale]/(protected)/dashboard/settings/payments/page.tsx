import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

async function refreshStripeConnectStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return null;

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!doctorProfile?.stripeConnectAccountId) return null;

  const account = await stripe.accounts.retrieve(
    doctorProfile.stripeConnectAccountId
  );

  return prisma.doctorProfile.update({
    where: {
      id: doctorProfile.id,
    },
    data: {
      stripeConnectOnboardingComplete: account.details_submitted,
      stripeConnectChargesEnabled: account.charges_enabled,
      stripeConnectPayoutsEnabled: account.payouts_enabled,
    },
  });
}

export default async function PaymentsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ success?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { success } = await searchParams;
  const { locale } = await params;

  const t = await getTranslations("settings.settings.payments");

  let updatedDoctorProfile = null;

  if (success === "true") {
    updatedDoctorProfile = await refreshStripeConnectStatus();
  }

  if (success === "true") {
    const isReady =
      updatedDoctorProfile?.stripeConnectChargesEnabled &&
      updatedDoctorProfile?.stripeConnectPayoutsEnabled;

    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#FAF9F7] px-4 py-10">
        <div className="w-full max-w-xl rounded-[32px] border border-[#283C5D]/10 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-[#283C5D]/50">
            Stripe Connect
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[#283C5D] md:text-4xl">
            {isReady
              ? t("successTitle")
              : "Stripe onboarding submitted"}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#283C5D]/70">
            {isReady
              ? t("successDescription")
              : "Your Stripe account was connected, but Stripe may still be reviewing or missing some information before payouts and charges are enabled."}
          </p>

          <Link
            href={`/${locale}/dashboard`}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            {t("goToDashboard")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F7]">
      <p className="text-sm text-[#283C5D]/60">Payments Settings</p>
    </main>
  );
}