import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type ConversationStatus = "ACTIVE" | "CLOSED";

type ConversationListRow = {
  id: string;
  onlineAccessId: string;
  patientUserId: string;
  doctorProfileId: string;
  status: ConversationStatus;
  lastMessageAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patientUser: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  doctorProfile: {
    id: string;
    clinicName: string;
    avatar: string | null;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  _count: {
    messages: number;
  };
};

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const userId = session.user.id;
  const role = session.user.role;

  const conversations: ConversationListRow[] = await prisma.conversation.findMany({
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
    select: {
      id: true,
      onlineAccessId: true,
      patientUserId: true,
      doctorProfileId: true,
      status: true,
      lastMessageAt: true,
      closedAt: true,
      createdAt: true,
      updatedAt: true,
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
    conversations: conversations.map((conversation: ConversationListRow) => ({
      id: conversation.id,
      onlineAccessId: conversation.onlineAccessId,
      patientUserId: conversation.patientUserId,
      doctorProfileId: conversation.doctorProfileId,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt,
      closedAt: conversation.closedAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      patientUser: conversation.patientUser,
      doctorProfile: conversation.doctorProfile,
      unreadCount: conversation._count.messages,
    })),
  });
});