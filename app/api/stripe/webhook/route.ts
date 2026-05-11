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
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    const bookingId = checkoutSession.metadata?.bookingId;

    if (bookingId) {
      await prisma.consultationBooking.update({
        where: { id: bookingId },
        data: {
          status: "paid",
          stripePaymentIntentId:
            typeof checkoutSession.payment_intent === "string"
              ? checkoutSession.payment_intent
              : checkoutSession.payment_intent?.id,
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
        stripeConnectOnboardingComplete:
          account.details_submitted ?? false,
        stripeConnectChargesEnabled:
          account.charges_enabled ?? false,
        stripeConnectPayoutsEnabled:
          account.payouts_enabled ?? false,
      },
    });
  }

  return NextResponse.json({ received: true });
}