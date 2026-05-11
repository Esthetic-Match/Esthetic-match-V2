// app/api/stripe/connect/status/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctorProfile?.stripeConnectAccountId) {
    return NextResponse.json({
      connected: false,
      onboardingComplete: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    });
  }

  const account = await stripe.accounts.retrieve(
    doctorProfile.stripeConnectAccountId
  );

  const updatedDoctorProfile = await prisma.doctorProfile.update({
    where: { id: doctorProfile.id },
    data: {
      stripeConnectOnboardingComplete: account.details_submitted,
      stripeConnectChargesEnabled: account.charges_enabled,
      stripeConnectPayoutsEnabled: account.payouts_enabled,
    },
  });

  return NextResponse.json({
    connected: true,
    onboardingComplete: updatedDoctorProfile.stripeConnectOnboardingComplete,
    chargesEnabled: updatedDoctorProfile.stripeConnectChargesEnabled,
    payoutsEnabled: updatedDoctorProfile.stripeConnectPayoutsEnabled,
  });
}