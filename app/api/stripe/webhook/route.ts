// app/api/stripe/webhook/route.ts

import Stripe from "stripe";
import { stripe } from "@/lib/thirdParty/stripe";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiError, apiSuccess } from "@/lib/api/error-handler";

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = subscription.items.data[0]?.current_period_end;

  return periodEnd ? new Date(periodEnd * 1000) : null;
}

function isPremiumStatus(status: Stripe.Subscription.Status) {
  return ["active", "trialing"].includes(status);
}

async function syncDoctorSubscription(subscription: Stripe.Subscription) {
  const doctorProfileId = subscription.metadata?.doctorProfileId;

  if (!doctorProfileId) return;

  const isPremium = isPremiumStatus(subscription.status);

  await prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: {
      paidPlan: isPremium ? "standard" : "free",
      subscriptionPlan: isPremium ? "premium" : "free",
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
      stripeCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
    },
  });
}

async function handleConsultationCheckoutCompleted(
  checkoutSession: Stripe.Checkout.Session
) {
  const bookingId = checkoutSession.metadata?.bookingId;

  if (!bookingId) {
    throw new ApiError(
      "Missing bookingId in checkout metadata",
      400,
      "STRIPE_BOOKING_ID_MISSING"
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

async function handleSubscriptionCheckoutCompleted(
  checkoutSession: Stripe.Checkout.Session
) {
  const subscriptionId =
    typeof checkoutSession.subscription === "string"
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncDoctorSubscription(subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const doctorProfileId = subscription.metadata?.doctorProfileId;

  if (!doctorProfileId) return;

  await prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: {
      paidPlan: "free",
      subscriptionPlan: "free",
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    },
  });
}

async function handleFailedInvoice(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  await prisma.doctorProfile.updateMany({
    where: {
      stripeCustomerId: customerId,
    },
    data: {
      stripeSubscriptionStatus: "payment_failed",
    },
  });
}

async function handleStripeConnectAccountUpdated(account: Stripe.Account) {
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

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new ApiError("Missing signature", 400, "STRIPE_SIGNATURE_MISSING");
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new ApiError(
        "Missing STRIPE_WEBHOOK_SECRET",
        500,
        "STRIPE_WEBHOOK_SECRET_MISSING"
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      throw new ApiError(
        "Invalid webhook signature",
        400,
        "INVALID_STRIPE_WEBHOOK_SIGNATURE",
        process.env.NODE_ENV === "development" ? error : undefined
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        if (checkoutSession.mode === "subscription") {
          await handleSubscriptionCheckoutCompleted(checkoutSession);
          break;
        }

        await handleConsultationCheckoutCompleted(checkoutSession);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncDoctorSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleFailedInvoice(invoice);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleStripeConnectAccountUpdated(account);
        break;
      }

      default:
        break;
    }

    return apiSuccess({
      received: true,
    });
  } catch (error) {
    return apiError(error, {
      method: req.method,
      url: req.url,
    });
  }
}

