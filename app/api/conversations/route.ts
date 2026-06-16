import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const userId = session.user.id;
  const role = session.user.role;

  const conversations = await prisma.conversation.findMany({
    where:
      role === "DOCTOR"
        ? {
            doctorProfile: {
              userId,
            },
          }
        : {
            patientUserId: userId,
          },
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
        select: {
          id: true,
          clinicName: true,
          avatar: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderUserId: {
                not: userId,
              },
              readAt: null,
              deletedAt: null,
            },
          },
        },
      },
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        lastMessageAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return apiSuccess({
    conversations: conversations.map((conversation) => ({
      ...conversation,
      unreadCount: conversation._count.messages,
    })),
  });
});