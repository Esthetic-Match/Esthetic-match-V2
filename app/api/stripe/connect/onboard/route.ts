// app/api/stripe/connect/onboard/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctorProfile) {
    return NextResponse.json(
      { error: "Doctor profile not found" },
      { status: 404 }
    );
  }

  let accountId = doctorProfile.stripeConnectAccountId;

  if (accountId) {
    try {
      await stripe.accounts.retrieve(accountId);
    } catch {
      accountId = null;

      await prisma.doctorProfile.update({
        where: { id: doctorProfile.id },
        data: {
          stripeConnectAccountId: null,
          stripeConnectOnboardingComplete: false,
          stripeConnectChargesEnabled: false,
          stripeConnectPayoutsEnabled: false,
        },
      });
    }
  }

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        doctorProfileId: doctorProfile.id,
        userId: session.user.id,
      },
    });

    accountId = account.id;

    await prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: {
        stripeConnectAccountId: accountId,
      },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/settings/payments?refresh=true`,
    return_url: `${appUrl}/dashboard/settings/payments?success=true`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}