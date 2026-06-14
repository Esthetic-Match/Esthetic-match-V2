import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { stripe } from "@/lib/thirdParty/stripe";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(async () => {
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
    select: {
      stripeCustomerId: true,
    },
  });

  if (!doctorProfile?.stripeCustomerId) {
    throw new ApiError(
      "No Stripe customer found for this doctor",
      400,
      "STRIPE_CUSTOMER_NOT_FOUND"
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: doctorProfile.stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings/payments`,
  });

  return apiSuccess({
    url: portalSession.url,
  });
});