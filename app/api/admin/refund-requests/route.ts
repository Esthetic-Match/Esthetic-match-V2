// app/api/admin/refund-requests/route.ts

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function requireAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
  const role = (session?.user as { role?: string | null } | undefined)?.role;

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  if (role !== "ADMIN") {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
}

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  requireAdmin(session);

  const refundRequests = await prisma.consultationRefundRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      booking: {
        include: {
          patientUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          doctorProfile: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return apiSuccess({
    refundRequests: refundRequests.map((request) => ({
      id: request.id,
      bookingId: request.bookingId,
      patientUserId: request.patientUserId,
      doctorProfileId: request.doctorProfileId,
      reason: request.reason,
      status: request.status,
      adminNote: request.adminNote,
      createdAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      refundedAt: request.refundedAt,
      booking: {
        id: request.booking.id,
        consultationType: request.booking.consultationType,
        amount: request.booking.amount,
        currency: request.booking.currency,
        status: request.booking.status,
        paidAt: request.booking.paidAt,
        refundedAt: request.booking.refundedAt,
        stripePaymentIntentId: request.booking.stripePaymentIntentId,
      },
      patient: {
        id: request.booking.patientUser.id,
        name: request.booking.patientUser.name,
        email: request.booking.patientUser.email,
        image: request.booking.patientUser.image,
      },
      doctor: {
        id: request.booking.doctorProfile.id,
        name: request.booking.doctorProfile.user.name,
        email: request.booking.doctorProfile.user.email,
        clinicName: request.booking.doctorProfile.clinicName,
        avatar:
          request.booking.doctorProfile.avatar ||
          request.booking.doctorProfile.user.image,
      },
    })),
  });
});