// app/api/admin/refund-requests/route.ts

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type AdminRefundRequestRow = {
  id: string;
  bookingId: string;
  patientUserId: string;
  doctorProfileId: string;
  reason: string;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  refundedAt: Date | null;
  booking: {
    id: string;
    consultationType: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date | null;
    refundedAt: Date | null;
    stripePaymentIntentId: string | null;
    patientUser: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    doctorProfile: {
      id: string;
      clinicName: string | null;
      avatar: string | null;
      user: {
        name: string | null;
        email: string | null;
        image: string | null;
      };
    };
  };
};

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

  const refundRequests: AdminRefundRequestRow[] =
    await prisma.consultationRefundRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        bookingId: true,
        patientUserId: true,
        doctorProfileId: true,
        reason: true,
        status: true,
        adminNote: true,
        createdAt: true,
        reviewedAt: true,
        refundedAt: true,
        booking: {
          select: {
            id: true,
            consultationType: true,
            amount: true,
            currency: true,
            status: true,
            paidAt: true,
            refundedAt: true,
            stripePaymentIntentId: true,
            patientUser: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            doctorProfile: {
              select: {
                id: true,
                clinicName: true,
                avatar: true,
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

  const formattedRefundRequests = refundRequests.map(
    (request: AdminRefundRequestRow) => ({
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
          request.booking.doctorProfile.avatar ??
          request.booking.doctorProfile.user.image,
      },
    })
  );

  return apiSuccess({
    refundRequests: formattedRefundRequests,
  });
});