import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "@/i18n/navigation";

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
  searchParams: Promise<{ success?: string; refresh?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { success, refresh } = await searchParams;
  const { locale } = await params;

  if (success === "true") {
    await refreshStripeConnectStatus();

    redirect({
      href: "/dashboard/settings?stripe=success",
      locale,
    });
  }

  if (refresh === "true") {
    redirect({
      href: "/dashboard/settings?stripe=refresh",
      locale,
    });
  }

  const t = await getTranslations("settings.settings.payments");

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F7]">
      <p className="text-sm text-[#283C5D]/60">Payments Settings</p>
    </main>
  );
}