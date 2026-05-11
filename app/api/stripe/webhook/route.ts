// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    const bookingId = checkoutSession.metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId in checkout metadata" },
        { status: 400 }
      );
    }

    const stripePaymentIntentId =
      typeof checkoutSession.payment_intent === "string"
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent?.id ?? null;

    const booking = await prisma.consultationBooking.update({
      where: { id: bookingId },
      data: {
        status: "paid",
        stripePaymentIntentId,
        paidAt: new Date(),
      },
    });

    if (booking.consultationType === "IN_CLINIC") {
      await prisma.inClinicConsultationAccess.upsert({
        where: {
          bookingId: booking.id,
        },
        update: {
          approvedToView: true,
          approvedAt: new Date(),
        },
        create: {
          bookingId: booking.id,
          patientUserId: booking.patientUserId,
          doctorProfileId: booking.doctorProfileId,
          approvedToView: true,
          approvedAt: new Date(),
        },
      });
    }

    if (booking.consultationType === "ONLINE") {
      await prisma.onlineConsultationAccess.upsert({
        where: {
          bookingId: booking.id,
        },
        update: {
          activeChat: true,
          activatedAt: new Date(),
          closedAt: null,
        },
        create: {
          bookingId: booking.id,
          patientUserId: booking.patientUserId,
          doctorProfileId: booking.doctorProfileId,
          activeChat: true,
          activatedAt: new Date(),
          conversation: {
            create: {
              patientUserId: booking.patientUserId,
              doctorProfileId: booking.doctorProfileId,
              status: "ACTIVE",
            },
          },
        },
      });
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    await prisma.doctorProfile.updateMany({
      where: {
        stripeConnectAccountId: account.id,
      },
      data: {
        stripeConnectOnboardingComplete: account.details_submitted ?? false,
        stripeConnectChargesEnabled: account.charges_enabled ?? false,
        stripeConnectPayoutsEnabled: account.payouts_enabled ?? false,
      },
    });
  }

  return NextResponse.json({ received: true });
}