// app/api/stripe/connect/onboard/route.ts

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { stripe } from "@/lib/thirdParty/stripe";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function getStripeCountryFromDoctorProfile(country?: string | null) {
  const normalizedCountry = country?.trim().toLowerCase();

  const countryMap: Record<string, string> = {
    france: "FR",
    fr: "FR",

    switzerland: "CH",
    suisse: "CH",
    schweiz: "CH",
    svizzera: "CH",
    ch: "CH",

    estonia: "EE",
    ee: "EE",
  };

  return countryMap[normalizedCountry || ""] || "FR";
}

export const POST = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctorProfile) {
    throw new ApiError(
      "Doctor profile not found",
      404,
      "DOCTOR_PROFILE_NOT_FOUND"
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
    const stripeCountry = getStripeCountryFromDoctorProfile(
      doctorProfile.country
    );

    const account = await stripe.accounts.create({
      type: "express",
      country: stripeCountry,
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new ApiError(
      "Missing NEXT_PUBLIC_APP_URL",
      500,
      "NEXT_PUBLIC_APP_URL_MISSING"
    );
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/settings/payments?refresh=true`,
    return_url: `${appUrl}/dashboard/settings/payments?success=true`,
    type: "account_onboarding",
  });

  return apiSuccess({
    url: accountLink.url,
  });
});