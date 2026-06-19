// app/api/admin/refund-requests/[requestId]/route.ts

import { headers } from "next/headers";
import Stripe from "stripe";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { stripe } from "@/lib/thirdParty/stripe";
import { sendEmail } from "@/lib/utils/email";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type RefundAction = "approve" | "deny";

function requireAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
  const role = (session?.user as { role?: string | null } | undefined)?.role;

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  if (role !== "ADMIN") {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function getConsultationTypeLabel(type: string) {
  return type === "IN_CLINIC"
    ? "In-clinic consultation"
    : "Online consultation";
}

async function sendRefundApprovedEmail({
  to,
  patientName,
  doctorName,
  amount,
  consultationType,
}: {
  to: string;
  patientName?: string | null;
  doctorName: string;
  amount: string;
  consultationType: string;
}) {
  await sendEmail({
    to,
    subject: "Your refund request has been approved",
    html: `
      <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.6;">
        <h1>Your refund has been approved</h1>

        <p>Hello ${patientName || "there"},</p>

        <p>Your refund request for your ${consultationType.toLowerCase()} with ${doctorName} has been approved.</p>

        <div style="background: #FAF9F7; padding: 16px; border-radius: 16px; margin: 24px 0;">
          <p><strong>Refund amount:</strong> ${amount}</p>
          <p><strong>Status:</strong> Approved</p>
        </div>

        <p>The refund has been submitted to Stripe. Depending on the payment method and bank, it may take several business days to appear on your statement.</p>

        <p>Thank you,<br />Esthetic Match</p>
      </div>
    `,
  });
}

async function sendRefundDeniedEmail({
  to,
  patientName,
  doctorName,
  amount,
  consultationType,
  adminNote,
}: {
  to: string;
  patientName?: string | null;
  doctorName: string;
  amount: string;
  consultationType: string;
  adminNote?: string | null;
}) {
  await sendEmail({
    to,
    subject: "Your refund request has been reviewed",
    html: `
      <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.6;">
        <h1>Your refund request was not approved</h1>

        <p>Hello ${patientName || "there"},</p>

        <p>Your refund request for your ${consultationType.toLowerCase()} with ${doctorName} has been reviewed and was not approved.</p>

        <div style="background: #FAF9F7; padding: 16px; border-radius: 16px; margin: 24px 0;">
          <p><strong>Booking amount:</strong> ${amount}</p>
          <p><strong>Status:</strong> Not approved</p>
          ${
            adminNote
              ? `<p><strong>Note:</strong> ${adminNote}</p>`
              : ""
          }
        </div>

        <p>If you believe this decision was made in error, please contact Esthetic Match support.</p>

        <p>Thank you,<br />Esthetic Match</p>
      </div>
    `,
  });
}

export const PATCH = withApiHandler(
  async (
    req: Request,
    { params }: { params: Promise<{ requestId: string }> }
  ) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    requireAdmin(session);

    const { requestId } = await params;
    const body = await req.json();

    const action = body.action as RefundAction;
    const adminNote =
      typeof body.adminNote === "string" ? body.adminNote.trim() : null;

    if (!["approve", "deny"].includes(action)) {
      throw new ApiError("Invalid refund action", 400, "INVALID_REFUND_ACTION");
    }

    const refundRequest = await prisma.consultationRefundRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        booking: {
          include: {
            patientUser: {
              select: {
                id: true,
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
        },
      },
    });

    if (!refundRequest) {
      throw new ApiError(
        "Refund request not found",
        404,
        "REFUND_REQUEST_NOT_FOUND"
      );
    }

    if (refundRequest.status !== "pending") {
      throw new ApiError(
        "This refund request has already been reviewed",
        400,
        "REFUND_REQUEST_ALREADY_REVIEWED"
      );
    }

    const booking = refundRequest.booking;

    if (!booking.patientUser.email) {
      throw new ApiError(
        "Patient email is missing",
        400,
        "PATIENT_EMAIL_MISSING"
      );
    }

    const amount = formatAmount(booking.amount, booking.currency);
    const consultationType = getConsultationTypeLabel(booking.consultationType);
    const doctorName =
      booking.doctorProfile.user.name ||
      booking.doctorProfile.clinicName ||
      "the doctor";

    if (action === "deny") {
      const updatedRequest = await prisma.consultationRefundRequest.update({
        where: {
          id: refundRequest.id,
        },
        data: {
          status: "rejected",
          adminNote,
          reviewedAt: new Date(),
        },
      });

      await sendRefundDeniedEmail({
        to: booking.patientUser.email,
        patientName: booking.patientUser.name,
        doctorName,
        amount,
        consultationType,
        adminNote,
      });

      return apiSuccess({
        refundRequest: updatedRequest,
      });
    }

    if (booking.status !== "paid" || !booking.paidAt) {
      throw new ApiError(
        "Only paid bookings can be refunded",
        400,
        "BOOKING_NOT_REFUNDABLE"
      );
    }

    if (booking.refundedAt) {
      throw new ApiError(
        "This booking has already been refunded",
        400,
        "BOOKING_ALREADY_REFUNDED"
      );
    }

    if (!booking.stripePaymentIntentId) {
      throw new ApiError(
        "Missing Stripe payment intent ID",
        400,
        "STRIPE_PAYMENT_INTENT_MISSING"
      );
    }

    let stripeRefund: Stripe.Refund;

    try {
      stripeRefund = await stripe.refunds.create(
        {
          payment_intent: booking.stripePaymentIntentId,
          reason: "requested_by_customer",
          reverse_transfer: true,
          refund_application_fee: true,
          metadata: {
            bookingId: booking.id,
            refundRequestId: refundRequest.id,
            patientUserId: booking.patientUserId,
            doctorProfileId: booking.doctorProfileId,
          },
        },
        {
          idempotencyKey: `consultation-refund-request-${refundRequest.id}`,
        }
      );
    } catch (error) {
      console.error("Stripe refund error:", error);

      throw new ApiError(
        "Could not create Stripe refund",
        500,
        "STRIPE_REFUND_FAILED",
        process.env.NODE_ENV === "development" ? error : undefined
      );
    }

    const now = new Date();

    const [updatedRequest, updatedBooking] = await prisma.$transaction([
      prisma.consultationRefundRequest.update({
        where: {
          id: refundRequest.id,
        },
        data: {
          status: "refunded",
          adminNote,
          reviewedAt: now,
          refundedAt: now,
        },
      }),
      prisma.consultationBooking.update({
        where: {
          id: booking.id,
        },
        data: {
          status: "refunded",
          refundedAt: now,
        },
      }),
    ]);

    await sendRefundApprovedEmail({
      to: booking.patientUser.email,
      patientName: booking.patientUser.name,
      doctorName,
      amount,
      consultationType,
    });

    return apiSuccess({
      refundRequest: updatedRequest,
      booking: updatedBooking,
      stripeRefund: {
        id: stripeRefund.id,
        status: stripeRefund.status,
        amount: stripeRefund.amount,
        currency: stripeRefund.currency,
      },
    });
  }
);