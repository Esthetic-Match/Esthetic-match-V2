// app/api/stripe/checkout/consultation/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ConsultationType } from "@prisma/client";

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
  }: {
    doctorProfileId: string;
    consultationType: ConsultationType;
  } = body;

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

  const currency = "eur";
  const amount = Math.round(price * 100);
  const platformFee = Math.round(amount * 0.1);
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
      },
    },

    metadata: {
      bookingId: booking.id,
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