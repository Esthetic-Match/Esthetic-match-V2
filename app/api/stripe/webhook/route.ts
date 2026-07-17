// app/api/stripe/webhook/route.ts

import Stripe from "stripe";

import { stripe } from "@/lib/thirdParty/stripe";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiError, apiSuccess } from "@/lib/api/error-handler";
import { sendEmail } from "@/lib/utils/email";

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = subscription.items.data[0]?.current_period_end;

  return periodEnd ? new Date(periodEnd * 1000) : null;
}

function isPremiumStatus(status: Stripe.Subscription.Status) {
  return ["active", "trialing"].includes(status);
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function getConsultationTypeLabel(consultationType: string) {
  return consultationType === "IN_CLINIC"
    ? "In-clinic consultation"
    : "Online consultation";
}

async function getBookingEmailContext(bookingId: string) {
  const booking = await prisma.consultationBooking.findUnique({
    where: { id: bookingId },
    include: {
      doctorProfile: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!booking) return null;

  const patient = await prisma.user.findUnique({
    where: {
      id: booking.patientUserId,
    },
  });

  if (!patient?.email) return null;

  return {
    booking,
    patient,
    doctor: booking.doctorProfile,
  };
}

function escapeHtml(value?: string | null) {
  if (!value) return "";

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendDoctorPaidConsultationEmail(bookingId: string) {
  const booking = await prisma.consultationBooking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      patientUser: {
        select: {
          name: true,
          email: true,
        },
      },
      doctorProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!booking) return;

  const doctorEmail = booking.doctorProfile.user.email;

  if (!doctorEmail) return;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  const dashboardUrl = `${appUrl}/dashboard`;

  const doctorName = escapeHtml(
    booking.doctorProfile.user.name || booking.doctorProfile.clinicName
  );

  const patientName = escapeHtml(booking.patientUser.name || "A patient");
  const patientEmail = escapeHtml(booking.patientUser.email || "Not available");
  const clinicName = escapeHtml(booking.doctorProfile.clinicName);
  const consultationType = getConsultationTypeLabel(booking.consultationType);
  const amount = formatAmount(booking.amount, booking.currency);

  await sendEmail({
    to: doctorEmail,
    subject: "New paid consultation booking",
    html: `
      <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">New paid consultation booking</h1>

        <p>Hello ${doctorName || "Doctor"},</p>

        <p>A patient has completed payment for a consultation on Esthetic Match.</p>

        <div style="background: #FAF9F7; padding: 16px; border-radius: 16px; margin: 24px 0;">
          <p><strong>Patient:</strong> ${patientName}</p>
          <p><strong>Patient email:</strong> ${patientEmail}</p>
          <p><strong>Clinic:</strong> ${clinicName}</p>
          <p><strong>Consultation type:</strong> ${consultationType}</p>
          <p><strong>Paid amount:</strong> ${amount}</p>
        </div>

        <p>You can view and manage this consultation from your dashboard.</p>

        <p style="margin: 28px 0;">
          <a
            href="${dashboardUrl}"
            style="background: #283C5D; color: #ffffff; padding: 12px 20px; border-radius: 999px; text-decoration: none; display: inline-block;"
          >
            Open dashboard
          </a>
        </p>

        <p>Thank you,<br />Esthetic Match</p>
      </div>
    `,
  });
}

async function sendConsultationPaymentConfirmedEmail(bookingId: string) {
  const context = await getBookingEmailContext(bookingId);

  if (!context) return;

  const { booking, patient, doctor } = context;

  const amount = formatAmount(booking.amount, booking.currency);
  const consultationType = getConsultationTypeLabel(booking.consultationType);

  await sendEmail({
    to: patient.email,
    subject: "Your consultation payment was successful",
    html: `
      <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">Payment successful</h1>

        <p>Hello ${patient.name || "there"},</p>

        <p>Your payment for your ${consultationType.toLowerCase()} has been confirmed.</p>

        <div style="background: #FAF9F7; padding: 16px; border-radius: 16px; margin: 24px 0;">
          <p><strong>Clinic:</strong> ${doctor.clinicName || "Doctor clinic"}</p>
          <p><strong>Consultation type:</strong> ${consultationType}</p>
          <p><strong>Amount paid:</strong> ${amount}</p>
        </div>

        ${
          booking.consultationType === "ONLINE"
            ? "<p>Your online consultation chat access is now active. You can message the doctor from your dashboard.</p>"
            : "<p>You can now view this doctor’s clinic and contact details from your booking confirmation page.</p>"
        }

        <p>Thank you,<br />Esthetic Match</p>
      </div>
    `,
  });
}

async function sendConsultationPaymentProcessingEmail(bookingId: string) {
  const context = await getBookingEmailContext(bookingId);

  if (!context) return;

  const { booking, patient, doctor } = context;

  const amount = formatAmount(booking.amount, booking.currency);
  const consultationType = getConsultationTypeLabel(booking.consultationType);

  await sendEmail({
    to: patient.email,
    subject: "Your consultation payment is being processed",
    html: `
      <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">Payment is being confirmed</h1>

        <p>Hello ${patient.name || "there"},</p>

        <p>Your payment for your ${consultationType.toLowerCase()} is currently being processed by Stripe.</p>

        <div style="background: #FAF9F7; padding: 16px; border-radius: 16px; margin: 24px 0;">
          <p><strong>Clinic:</strong> ${doctor.clinicName || "Doctor clinic"}</p>
          <p><strong>Consultation type:</strong> ${consultationType}</p>
          <p><strong>Amount:</strong> ${amount}</p>
        </div>

        <p>Once Stripe confirms the payment, your access will be unlocked automatically.</p>

        <p>Thank you,<br />Esthetic Match</p>
      </div>
    `,
  });
}

async function sendConsultationPaymentFailedEmail(bookingId: string) {
  const context = await getBookingEmailContext(bookingId);

  if (!context) return;

  const { booking, patient, doctor } = context;

  const amount = formatAmount(booking.amount, booking.currency);
  const consultationType = getConsultationTypeLabel(booking.consultationType);

  await sendEmail({
    to: patient.email,
    subject: "Your consultation payment could not be completed",
    html: `
      <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">Payment could not be completed</h1>

        <p>Hello ${patient.name || "there"},</p>

        <p>Your payment for your ${consultationType.toLowerCase()} could not be confirmed.</p>

        <div style="background: #FAF9F7; padding: 16px; border-radius: 16px; margin: 24px 0;">
          <p><strong>Clinic:</strong> ${doctor.clinicName || "Doctor clinic"}</p>
          <p><strong>Consultation type:</strong> ${consultationType}</p>
          <p><strong>Amount:</strong> ${amount}</p>
        </div>

        <p>No consultation access has been unlocked. You may try the payment again from the doctor profile.</p>

        <p>Thank you,<br />Esthetic Match</p>
      </div>
    `,
  });
}

async function syncDoctorSubscription(subscription: Stripe.Subscription) {
  const doctorProfileId = subscription.metadata?.doctorProfileId;

  if (!doctorProfileId) return;

  const isPremium = isPremiumStatus(subscription.status);

  await prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: {
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

async function unlockConsultationAccess(booking: {
  id: string;
  patientUserId: string;
  doctorProfileId: string;
  consultationType: string;
}) {
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

async function handleConsultationPaymentConfirmed({
  bookingId,
  stripePaymentIntentId,
}: {
  bookingId: string;
  stripePaymentIntentId: string | null;
}) {
  const existingBooking = await prisma.consultationBooking.findUnique({
    where: { id: bookingId },
  });

  if (!existingBooking) return;

  const isFirstPaidConfirmation = !existingBooking.paidAt;
  const shouldSendPatientEmail = !existingBooking.paymentConfirmedEmailSentAt;
  const shouldSendDoctorEmail = isFirstPaidConfirmation;

  const booking = await prisma.consultationBooking.update({
    where: { id: bookingId },
    data: {
      status: "paid",
      stripePaymentIntentId,
      paidAt: existingBooking.paidAt ?? new Date(),
      cancelledAt: null,
    },
  });

  await unlockConsultationAccess(booking);

  if (shouldSendPatientEmail) {
    try {
      await sendConsultationPaymentConfirmedEmail(booking.id);

      await prisma.consultationBooking.update({
        where: { id: booking.id },
        data: {
          paymentConfirmedEmailSentAt: new Date(),
        },
      });
    } catch (emailError) {
      console.error("Patient payment confirmation email failed:", emailError);
    }
  }

  if (shouldSendDoctorEmail) {
    try {
      await sendDoctorPaidConsultationEmail(booking.id);
    } catch (emailError) {
      console.error("Doctor paid consultation email failed:", emailError);
    }
  }
}

async function handleConsultationPaymentProcessing({
  bookingId,
  stripePaymentIntentId,
}: {
  bookingId: string;
  stripePaymentIntentId: string | null;
}) {
  const existingBooking = await prisma.consultationBooking.findUnique({
    where: { id: bookingId },
  });

  if (!existingBooking) return;

  if (existingBooking.status === "paid" || existingBooking.paidAt) return;

  const shouldSendEmail = !existingBooking.stripePaymentIntentId;

  const booking = await prisma.consultationBooking.update({
    where: { id: bookingId },
    data: {
      status: "pending",
      stripePaymentIntentId,
    },
  });

  if (shouldSendEmail) {
    await sendConsultationPaymentProcessingEmail(booking.id);
  }
}

async function handleConsultationPaymentFailed({
  bookingId,
  stripePaymentIntentId,
}: {
  bookingId: string;
  stripePaymentIntentId: string | null;
}) {
  const existingBooking = await prisma.consultationBooking.findUnique({
    where: { id: bookingId },
  });

  if (!existingBooking) return;

  if (existingBooking.status === "paid" || existingBooking.paidAt) return;

  const shouldSendEmail = !existingBooking.cancelledAt;

  const booking = await prisma.consultationBooking.update({
    where: { id: bookingId },
    data: {
      status: "failed",
      stripePaymentIntentId,
      cancelledAt: existingBooking.cancelledAt ?? new Date(),
    },
  });

  if (shouldSendEmail) {
    await sendConsultationPaymentFailedEmail(booking.id);
  }
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

  if (checkoutSession.payment_status === "paid") {
    await handleConsultationPaymentConfirmed({
      bookingId,
      stripePaymentIntentId,
    });

    return;
  }

  await handleConsultationPaymentProcessing({
    bookingId,
    stripePaymentIntentId,
  });
}

async function handleConsultationAsyncPaymentSucceeded(
  checkoutSession: Stripe.Checkout.Session
) {
  const bookingId = checkoutSession.metadata?.bookingId;

  if (!bookingId) return;

  const stripePaymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id ?? null;

  await handleConsultationPaymentConfirmed({
    bookingId,
    stripePaymentIntentId,
  });
}

async function handleConsultationAsyncPaymentFailed(
  checkoutSession: Stripe.Checkout.Session
) {
  const bookingId = checkoutSession.metadata?.bookingId;

  if (!bookingId) return;

  const stripePaymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id ?? null;

  await handleConsultationPaymentFailed({
    bookingId,
    stripePaymentIntentId,
  });
}

async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent
) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) return;

  await handleConsultationPaymentProcessing({
    bookingId,
    stripePaymentIntentId: paymentIntent.id,
  });
}

async function handlePaymentIntentPaymentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) return;

  await handleConsultationPaymentFailed({
    bookingId,
    stripePaymentIntentId: paymentIntent.id,
  });
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

      case "checkout.session.async_payment_succeeded": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        await handleConsultationAsyncPaymentSucceeded(checkoutSession);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        await handleConsultationAsyncPaymentFailed(checkoutSession);
        break;
      }

      case "payment_intent.processing": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await handlePaymentIntentProcessing(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await handlePaymentIntentPaymentFailed(paymentIntent);
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