import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json(
        { error: "No Stripe customer found for this doctor" },
        { status: 400 }
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

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Stripe customer portal error:", error);

    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}