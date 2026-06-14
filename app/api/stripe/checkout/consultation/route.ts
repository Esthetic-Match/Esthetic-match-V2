// app/api/stripe/checkout/consultation/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { stripe } from "@/lib/thirdParty/stripe";
import { ConsultationType } from "@prisma/client";

const ALLOWED_CURRENCIES = ["eur", "usd", "gbp", "aed", "egp"];

function normalizeCurrency(currency?: string | null) {
  const normalized = currency?.trim().toLowerCase() || "eur";

  if (!ALLOWED_CURRENCIES.includes(normalized)) {
    return "eur";
  }

  return normalized;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    doctorProfileId,
    consultationType,
    currency: requestedCurrency,
  }: {
    doctorProfileId: string;
    consultationType: ConsultationType;
    currency?: string | null;
  } = body;

  const currency = normalizeCurrency(requestedCurrency);

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { id: doctorProfileId },
    include: { user: true },
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

  const amount = Math.round(price * 100);
  const PLATFORM_FEE_PERCENTAGE = 0.15;
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
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/booking/success?bookingId=${booking.id}`,
    cancel_url: `${appUrl}/doctor/${doctorProfile.userId}`,

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name:
              consultationType === "IN_CLINIC"
                ? `In-clinic consultation with ${doctorProfile.clinicName}`
                : `Online consultation with ${doctorProfile.clinicName}`,
            description: `Includes a 15% platform service fee.`,
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
      },
    },

    metadata: {
      bookingId: booking.id,
      currency,
    },
  });

  await prisma.consultationBooking.update({
    where: { id: booking.id },
    data: {
      stripeCheckoutSessionId: checkoutSession.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}