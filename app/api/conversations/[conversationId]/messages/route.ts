import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptMessage, encryptMessage } from "@/lib/messageCrypto";
import { storage } from "@/lib/gcs";

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
    include: {
      attachments: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    messages: await Promise.all(
      messages.map(async (message) => ({
        id: message.id,
        conversationId: message.conversationId,
        senderUserId: message.senderUserId,
        senderRole: message.senderRole,
        messageType: message.messageType,

        text:
          message.ciphertext && message.iv
            ? decryptMessage({
                ciphertext: message.ciphertext,
                iv: message.iv,
                authTag: message.authTag,
              })
            : "",

        attachments: await Promise.all(
          message.attachments.map(async (attachment) => {
            const bucket = storage.bucket(process.env.GCS_PRIVATE_BUCKET_NAME!);

            const [readUrl] = await bucket
              .file(attachment.objectPath)
              .getSignedUrl({
                version: "v4",
                action: "read",
                expires: Date.now() + 10 * 60 * 1000,
              });

            return {
              id: attachment.id,
              objectPath: attachment.objectPath,
              readUrl,
              fileName: attachment.fileName,
              contentType: attachment.contentType,
              sizeBytes: attachment.sizeBytes,
              createdAt: attachment.createdAt,
            };
          })
        ),

        readAt: message.readAt,
        editedAt: message.editedAt,
        deletedAt: message.deletedAt,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      }))
    ),
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
  const messageType = body.messageType || "TEXT";
  const attachment = body.attachment;

  if (messageType === "TEXT" && !text) {
    return NextResponse.json(
      { error: "Message text is required" },
      { status: 400 }
    );
  }

  if (messageType === "IMAGE" && !attachment?.objectPath) {
    return NextResponse.json(
      { error: "Image attachment is required" },
      { status: 400 }
    );
  }

  if (text.length > 3000) {
    return NextResponse.json(
      { error: "Message is too long" },
      { status: 400 }
    );
  }

  const encrypted = text
    ? encryptMessage(text)
    : {
        ciphertext: "",
        iv: "",
        authTag: "",
      };

  const senderRole =
    conversation.doctorProfile.userId === user.id ? "DOCTOR" : "PATIENT";

  const message = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        conversationId,
        senderUserId: user.id,
        senderRole,
        messageType,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        attachments:
          messageType === "IMAGE"
            ? {
                create: {
                  conversationId,
                  uploadedByUserId: user.id,
                  objectPath: attachment.objectPath,
                  fileName: attachment.fileName || null,
                  contentType: attachment.contentType,
                  sizeBytes: attachment.sizeBytes || null,
                },
              }
            : undefined,
      },
      include: {
        attachments: true,
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
      messageType: message.messageType,
      text,
      attachments: message.attachments,
      readAt: message.readAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    },
  });
}