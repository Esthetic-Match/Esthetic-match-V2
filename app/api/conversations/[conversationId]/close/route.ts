import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { headers } from "next/headers";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type RouteParams = {
  params: Promise<{
    conversationId: string;
  }>;
};

export const PATCH = withApiHandler<RouteParams>(
  async (_req: Request, { params }) => {
    const { conversationId } = await params;

    if (!conversationId) {
      throw new ApiError(
        "Conversation id is required",
        400,
        "CONVERSATION_ID_REQUIRED"
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        doctorProfile: true,
      },
    });

    if (!conversation) {
      throw new ApiError(
        "Conversation not found",
        404,
        "CONVERSATION_NOT_FOUND"
      );
    }

    const isDoctorOwner = conversation.doctorProfile.userId === session.user.id;

    if (!isDoctorOwner) {
      throw new ApiError(
        "Only the doctor can end this conversation",
        403,
        "ONLY_DOCTOR_CAN_END_CONVERSATION"
      );
    }

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    return apiSuccess({
      conversation: updatedConversation,
    });
  }
);