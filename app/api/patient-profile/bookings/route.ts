// app/api/patient/bookings/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type PatientBookingRow = {
  id: string;
  consultationType: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: Date | null;
  cancelledAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  doctorProfile: {
    id: string;
    slug: string | null;
    clinicName: string | null;
    avatar: string | null;
    user: {
      name: string | null;
      image: string | null;
    };
  };
};

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings: PatientBookingRow[] =
      await prisma.consultationBooking.findMany({
        where: {
          patientUserId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          consultationType: true,
          amount: true,
          currency: true,
          status: true,
          paidAt: true,
          cancelledAt: true,
          refundedAt: true,
          createdAt: true,
          stripePaymentIntentId: true,
          stripeCheckoutSessionId: true,
          doctorProfile: {
            select: {
              id: true,
              slug: true,
              clinicName: true,
              avatar: true,
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      bookings: bookings.map((booking: PatientBookingRow) => ({
        id: booking.id,
        consultationType: booking.consultationType,
        amount: booking.amount,
        currency: booking.currency,
        status: booking.status,
        paidAt: booking.paidAt,
        cancelledAt: booking.cancelledAt,
        refundedAt: booking.refundedAt,
        createdAt: booking.createdAt,
        stripePaymentIntentId: booking.stripePaymentIntentId,
        stripeCheckoutSessionId: booking.stripeCheckoutSessionId,
        doctor: {
          id: booking.doctorProfile.id,
          slug: booking.doctorProfile.slug,
          name: booking.doctorProfile.user.name,
          clinicName: booking.doctorProfile.clinicName,
          avatar:
            booking.doctorProfile.avatar ?? booking.doctorProfile.user.image,
        },
      })),
    });
  } catch (error) {
    console.error("Patient bookings fetch error:", error);

    return NextResponse.json(
      { error: "Could not fetch booking history" },
      { status: 500 }
    );
  }
}