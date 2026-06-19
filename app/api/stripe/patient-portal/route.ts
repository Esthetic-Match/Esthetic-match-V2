// app/api/stripe/patient-portal/route.ts

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { stripe } from "@/lib/thirdParty/stripe";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

async function getOrCreatePatientStripeCustomer(userId: string) {
  const patientProfile = await prisma.patientProfile.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!patientProfile.user?.email) {
    throw new ApiError(
      "Patient email is required to create a Stripe customer",
      400,
      "PATIENT_EMAIL_MISSING"
    );
  }

  if (patientProfile.stripeCustomerId) {
    return patientProfile.stripeCustomerId;
  }

  const stripeCustomer = await stripe.customers.create({
    email: patientProfile.user.email,
    name: patientProfile.user.name || undefined,
    metadata: {
      userId: patientProfile.user.id,
      patientProfileId: patientProfile.id,
      role: "PATIENT",
    },
  });

  await prisma.patientProfile.update({
    where: {
      id: patientProfile.id,
    },
    data: {
      stripeCustomerId: stripeCustomer.id,
    },
  });

  return stripeCustomer.id;
}

export const POST = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const stripeCustomerId = await getOrCreatePatientStripeCustomer(
    session.user.id
  );

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/dashboard/payments`,
  });

  return apiSuccess({
    url: portalSession.url,
  });
});