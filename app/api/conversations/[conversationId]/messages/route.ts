import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptMessage, encryptMessage } from "@/lib/messageCrypto";

type RouteParams = {
  params: Promise<{
    conversationId: string;
  }>;
};

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

async function getAuthorizedConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      doctorProfile: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!conversation) return null;

  const isPatient = conversation.patientUserId === userId;
  const isDoctor = conversation.doctorProfile.userId === userId;

  if (!isPatient && !isDoctor) return null;

  return conversation;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;

  const conversation = await getAuthorizedConversation(conversationId, user.id);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderUserId: {
        not: user.id,
      },
      readAt: null,
      deletedAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      conversationId: message.conversationId,
      senderUserId: message.senderUserId,
      senderRole: message.senderRole,
      text: decryptMessage({
        ciphertext: message.ciphertext,
        iv: message.iv,
        authTag: message.authTag,
      }),
      readAt: message.readAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    })),
  });
}

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;

  const conversation = await getAuthorizedConversation(conversationId, user.id);

  if (!conversation || conversation.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Conversation not available" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const text = String(body.text || "").trim();

  if (!text) {
    return NextResponse.json(
      { error: "Message text is required" },
      { status: 400 }
    );
  }

  if (text.length > 3000) {
    return NextResponse.json(
      { error: "Message is too long" },
      { status: 400 }
    );
  }

  const encrypted = encryptMessage(text);

  const senderRole =
    conversation.doctorProfile.userId === user.id ? "DOCTOR" : "PATIENT";

  const message = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        conversationId,
        senderUserId: user.id,
        senderRole,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      },
    });

    await tx.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: createdMessage.createdAt,
      },
    });

    return createdMessage;
  });

  return NextResponse.json({
    message: {
      id: message.id,
      conversationId: message.conversationId,
      senderUserId: message.senderUserId,
      senderRole: message.senderRole,
      text,
      readAt: message.readAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    },
  });
}