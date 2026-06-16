// app/api/stripe/connect/status/route.ts

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { stripe } from "@/lib/thirdParty/stripe";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!doctorProfile?.stripeConnectAccountId) {
    throw new ApiError(
      "Stripe Connect account not found",
      404,
      "STRIPE_CONNECT_ACCOUNT_NOT_FOUND"
    );
  }

  const account = await stripe.accounts.retrieve(
    doctorProfile.stripeConnectAccountId
  );

  const updatedProfile = await prisma.doctorProfile.update({
    where: {
      id: doctorProfile.id,
    },
    data: {
      stripeConnectChargesEnabled: account.charges_enabled,
      stripeConnectPayoutsEnabled: account.payouts_enabled,
      stripeConnectOnboardingComplete:
        account.details_submitted && account.charges_enabled,
    },
  });

  return apiSuccess(updatedProfile);
});