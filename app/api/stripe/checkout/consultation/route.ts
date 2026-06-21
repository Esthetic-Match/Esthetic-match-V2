// app/api/stripe/checkout/consultation/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { stripe } from "@/lib/thirdParty/stripe";

const ALLOWED_CURRENCIES = ["eur", "usd", "gbp", "aed", "egp"] as const;

const PLATFORM_FEE_PERCENTAGE = 0.15;

type ConsultationType = "IN_CLINIC" | "ONLINE";

type AllowedCurrency = (typeof ALLOWED_CURRENCIES)[number];

type ConsultationCheckoutBody = {
  doctorProfileId: string;
  consultationType: ConsultationType;
  currency?: string | null;
};

type PatientStripeCustomerProfile = {
  id: string;
  stripeCustomerId: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

type DoctorCheckoutProfile = {
  id: string;
  userId: string;
  clinicName: string | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  stripeConnectAccountId: string | null;
  stripeConnectChargesEnabled: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isConsultationType(value: unknown): value is ConsultationType {
  return value === "IN_CLINIC" || value === "ONLINE";
}

function parseCheckoutBody(value: unknown): ConsultationCheckoutBody | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.doctorProfileId !== "string" ||
    !value.doctorProfileId.trim()
  ) {
    return null;
  }

  if (!isConsultationType(value.consultationType)) {
    return null;
  }

  return {
    doctorProfileId: value.doctorProfileId.trim(),
    consultationType: value.consultationType,
    currency: typeof value.currency === "string" ? value.currency : null,
  };
}

function normalizeCurrency(currency?: string | null): AllowedCurrency {
  const normalized = currency?.trim().toLowerCase() || "eur";

  return ALLOWED_CURRENCIES.includes(normalized as AllowedCurrency)
    ? (normalized as AllowedCurrency)
    : "eur";
}

async function getOrCreatePatientStripeCustomer(userId: string) {
  const patientProfile: PatientStripeCustomerProfile =
    await prisma.patientProfile.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

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

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = (await req.json().catch(() => null)) as unknown;
    const body = parseCheckoutBody(rawBody);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid checkout request body" },
        { status: 400 }
      );
    }

    const { doctorProfileId, consultationType } = body;
    const currency = normalizeCurrency(body.currency);

    const doctorProfile: DoctorCheckoutProfile | null =
      await prisma.doctorProfile.findUnique({
        where: {
          id: doctorProfileId,
        },
        select: {
          id: true,
          userId: true,
          clinicName: true,
          inClinicPrice: true,
          onlineConsulPrice: true,
          stripeConnectAccountId: true,
          stripeConnectChargesEnabled: true,
        },
      });

    if (!doctorProfile) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    if (!doctorProfile.stripeConnectAccountId) {
      return NextResponse.json(
        { error: "Doctor has not connected Stripe yet" },
        { status: 400 }
      );
    }

    if (!doctorProfile.stripeConnectChargesEnabled) {
      return NextResponse.json(
        { error: "Doctor cannot receive payments yet" },
        { status: 400 }
      );
    }

    const price =
      consultationType === "IN_CLINIC"
        ? doctorProfile.inClinicPrice
        : doctorProfile.onlineConsulPrice;

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: "Doctor has not set a valid price for this consultation type" },
        { status: 400 }
      );
    }

    const stripeCustomerId = await getOrCreatePatientStripeCustomer(
      session.user.id
    );

    const amount = Math.round(price * 100);
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE);
    const doctorAmount = amount - platformFee;

    const booking = await prisma.consultationBooking.create({
      data: {
        patientUserId: session.user.id,
        doctorProfileId: doctorProfile.id,
        consultationType,
        amount,
        platformFee,
        doctorAmount,
        currency,
        status: "pending",
      },
      select: {
        id: true,
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,

      success_url: `${appUrl}/booking/success?bookingId=${booking.id}`,
      cancel_url: `${appUrl}/doctor/${doctorProfile.userId}`,

      invoice_creation: {
        enabled: true,
      },

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name:
                consultationType === "IN_CLINIC"
                  ? `In-clinic consultation with ${
                      doctorProfile.clinicName ?? "Doctor"
                    }`
                  : `Online consultation with ${
                      doctorProfile.clinicName ?? "Doctor"
                    }`,
              description: "Includes a 15% platform service fee.",
            },
          },
        },
      ],

      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: doctorProfile.stripeConnectAccountId,
        },
        metadata: {
          bookingId: booking.id,
          doctorProfileId: doctorProfile.id,
          patientUserId: session.user.id,
          consultationType,
          currency,
          stripeCustomerId,
        },
      },

      metadata: {
        bookingId: booking.id,
        currency,
        patientUserId: session.user.id,
        doctorProfileId: doctorProfile.id,
        consultationType,
        stripeCustomerId,
      },
    });

    await prisma.consultationBooking.update({
      where: {
        id: booking.id,
      },
      data: {
        stripeCheckoutSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Consultation checkout error:", error);

    return NextResponse.json(
      { error: "Could not create consultation checkout session" },
      { status: 500 }
    );
  }
}