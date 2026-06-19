// app/api/patient/bookings/[bookingId]/refund-request/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const body = await req.json();

    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!reason) {
      return NextResponse.json(
        { error: "Refund reason is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.consultationBooking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.patientUserId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have access to this booking" },
        { status: 403 }
      );
    }

    if (booking.status !== "paid" || !booking.paidAt) {
      return NextResponse.json(
        { error: "Only paid bookings can be submitted for refund review" },
        { status: 400 }
      );
    }

    if (booking.refundedAt) {
      return NextResponse.json(
        { error: "This booking has already been refunded" },
        { status: 400 }
      );
    }

    const existingPendingRequest =
      await prisma.consultationRefundRequest.findFirst({
        where: {
          bookingId: booking.id,
          patientUserId: session.user.id,
          status: "pending",
        },
      });

    if (existingPendingRequest) {
      return NextResponse.json(
        { error: "You already have a pending refund request for this booking" },
        { status: 400 }
      );
    }

    const refundRequest = await prisma.consultationRefundRequest.create({
      data: {
        bookingId: booking.id,
        patientUserId: booking.patientUserId,
        doctorProfileId: booking.doctorProfileId,
        reason,
        status: "pending",
      },
    });

    return NextResponse.json({
      refundRequest,
    });
  } catch (error) {
    console.error("Refund request error:", error);

    return NextResponse.json(
      { error: "Could not create refund request" },
      { status: 500 }
    );
  }
}