import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json({
    conversations: conversations.map((conversation) => ({
      ...conversation,
      unreadCount: conversation._count.messages,
    })),
  });
}