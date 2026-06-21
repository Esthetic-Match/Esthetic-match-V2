// app/api/consultations/free-access/route.ts

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type FreeAccessTransactionClient = Pick<
  typeof prisma,
  "consultationBooking" | "onlineConsultationAccess" | "conversation"
>;

type FreeAccessRequestBody = {
  doctorProfileId: string;
};

function parseFreeAccessRequestBody(value: unknown): FreeAccessRequestBody {
  if (typeof value !== "object" || value === null) {
    throw new ApiError(
      "Invalid request body.",
      400,
      "INVALID_REQUEST_BODY"
    );
  }

  const body = value as Partial<Record<keyof FreeAccessRequestBody, unknown>>;

  if (typeof body.doctorProfileId !== "string" || !body.doctorProfileId.trim()) {
    throw new ApiError(
      "Doctor profile id is required.",
      400,
      "DOCTOR_PROFILE_ID_REQUIRED"
    );
  }

  return {
    doctorProfileId: body.doctorProfileId.trim(),
  };
}

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const rawBody = (await req.json().catch(() => null)) as unknown;
  const { doctorProfileId } = parseFreeAccessRequestBody(rawBody);

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
    throw new ApiError(
      "Doctor profile not found.",
      404,
      "DOCTOR_PROFILE_NOT_FOUND"
    );
  }

  const onlinePrice = doctorProfile.onlineConsulPrice ?? 0;

  if (onlinePrice > 0) {
    throw new ApiError(
      "This doctor does not offer free online consultations.",
      400,
      "FREE_ONLINE_CONSULTATION_NOT_AVAILABLE"
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

    return apiSuccess({
      success: true,
      conversationId: existingConversation.id,
    });
  }

  const result = await prisma.$transaction(
    async (tx: FreeAccessTransactionClient) => {
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
        select: {
          id: true,
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
        select: {
          id: true,
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
        select: {
          id: true,
        },
      });

      return conversation;
    }
  );

  return apiSuccess({
    success: true,
    conversationId: result.id,
  });
});