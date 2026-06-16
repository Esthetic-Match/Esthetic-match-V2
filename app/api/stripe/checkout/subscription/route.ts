import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type BillingInterval = "monthly" | "yearly";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const billingInterval = body.billingInterval as BillingInterval;

    if (billingInterval !== "monthly" && billingInterval !== "yearly") {
      return NextResponse.json(
        { error: "Invalid billing interval" },
        { status: 400 }
      );
    }

    const priceId =
      billingInterval === "monthly"
        ? process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
        : process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe ${billingInterval} price ID` },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { doctorProfile: true },
    });

    if (!user || user.role !== "DOCTOR" || !user.doctorProfile) {
      return NextResponse.json(
        { error: "Only doctors can subscribe" },
        { status: 403 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    let stripeCustomerId = user.doctorProfile.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
          doctorProfileId: user.doctorProfile.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.doctorProfile.update({
        where: { id: user.doctorProfile.id },
        data: { stripeCustomerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/settings/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        doctorProfileId: user.doctorProfile.id,
        billingInterval,
        plan: "premium",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          doctorProfileId: user.doctorProfile.id,
          billingInterval,
          plan: "premium",
        },
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create subscription checkout session",
      },
      { status: 500 }
    );
  }
}