// app/api/consultations/online/free-access/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const doctorProfileId = body?.doctorProfileId;

    if (!doctorProfileId) {
      return NextResponse.json(
        { error: "Doctor profile id is required." },
        { status: 400 }
      );
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      select: {
        id: true,
        userId: true,
        onlineConsulPrice: true,
        currency: true,
      },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 }
      );
    }

    const onlinePrice = doctorProfile.onlineConsulPrice ?? 0;

    if (onlinePrice > 0) {
      return NextResponse.json(
        { error: "This doctor does not offer free online consultations." },
        { status: 400 }
      );
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        patientUserId: session.user.id,
        doctorProfileId: doctorProfile.id,
      },
      select: {
        id: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingConversation) {
      if (existingConversation.status === "CLOSED") {
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: {
            status: "ACTIVE",
            closedAt: null,
          },
        });
      }

      return NextResponse.json({
        success: true,
        conversationId: existingConversation.id,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.consultationBooking.create({
        data: {
          patientUserId: session.user.id,
          doctorProfileId: doctorProfile.id,
          consultationType: "ONLINE",
          amount: 0,
          platformFee: 0,
          doctorAmount: 0,
          currency: doctorProfile.currency || "eur",
          status: "paid",
          paidAt: new Date(),
        },
      });

      const access = await tx.onlineConsultationAccess.create({
        data: {
          bookingId: booking.id,
          patientUserId: session.user.id,
          doctorProfileId: doctorProfile.id,
          activeChat: true,
          activatedAt: new Date(),
        },
      });

      const conversation = await tx.conversation.create({
        data: {
          onlineAccessId: access.id,
          patientUserId: session.user.id,
          doctorProfileId: doctorProfile.id,
          status: "ACTIVE",
          lastMessageAt: new Date(),
        },
      });

      return conversation;
    });

    return NextResponse.json({
      success: true,
      conversationId: result.id,
    });
  } catch (error) {
    console.error("FREE_ONLINE_CONSULTATION_ERROR", error);

    return NextResponse.json(
      { error: "Server error while starting conversation." },
      { status: 500 }
    );
  }
}