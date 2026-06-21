import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { decryptMessage, encryptMessage } from "@/lib/utils/messageCrypto";
import { storage } from "@/lib/google/gcs";

type RouteParams = {
  params: Promise<{
    conversationId: string;
  }>;
};

type MessageType = "TEXT" | "IMAGE" | "MIXED";
type MessageSenderRole = "PATIENT" | "DOCTOR";

function isMessageType(value: unknown): value is MessageType {
  return value === "TEXT" || value === "IMAGE" || value === "MIXED";
}

type MessageAttachmentRow = {
  id: string;
  conversationId: string;
  messageId: string;
  uploadedByUserId: string;
  objectPath: string;
  fileName: string | null;
  contentType: string;
  sizeBytes: number | null;
  createdAt: Date;
};

type MessageWithAttachments = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: string;
  messageType: string;
  ciphertext: string | null;
  iv: string | null;
  authTag: string | null;
  readAt: Date | null;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  attachments: MessageAttachmentRow[];
};

type AuthorizedConversation = {
  id: string;
  patientUserId: string;
  doctorProfileId: string;
  status: string;
  doctorProfile: {
    id: string;
    userId: string;
  };
};

type MessageTransactionClient = Pick<typeof prisma, "message" | "conversation">;

type MessageRequestBody = {
  text?: unknown;
  messageType?: unknown;
  attachment?: unknown;
};

type AttachmentInput = {
  objectPath: string;
  fileName?: string | null;
  contentType: string;
  sizeBytes?: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAttachment(value: unknown): AttachmentInput | null {
  if (!isRecord(value)) return null;

  if (typeof value.objectPath !== "string" || !value.objectPath.trim()) {
    return null;
  }

  if (typeof value.contentType !== "string" || !value.contentType.trim()) {
    return null;
  }

  return {
    objectPath: value.objectPath.trim(),
    fileName:
      typeof value.fileName === "string" && value.fileName.trim()
        ? value.fileName.trim()
        : null,
    contentType: value.contentType.trim(),
    sizeBytes: typeof value.sizeBytes === "number" ? value.sizeBytes : null,
  };
}

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

async function getAuthorizedConversation(
  conversationId: string,
  userId: string
): Promise<AuthorizedConversation | null> {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      patientUserId: true,
      doctorProfileId: true,
      status: true,
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

  const messages: MessageWithAttachments[] = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
    },
    select: {
      id: true,
      conversationId: true,
      senderUserId: true,
      senderRole: true,
      messageType: true,
      ciphertext: true,
      iv: true,
      authTag: true,
      readAt: true,
      editedAt: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      attachments: {
        select: {
          id: true,
          conversationId: true,
          messageId: true,
          uploadedByUserId: true,
          objectPath: true,
          fileName: true,
          contentType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    messages: await Promise.all(
      messages.map(async (message: MessageWithAttachments) => ({
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
                authTag: message.authTag ?? "",
              })
            : "",
        attachments: await Promise.all(
          message.attachments.map(async (attachment: MessageAttachmentRow) => {
            const bucket = storage.bucket(process.env.GCS_PRIVATE_BUCKET_NAME!);

            const [readUrl] = await bucket.file(attachment.objectPath).getSignedUrl({
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

const body = (await req.json().catch(() => null)) as MessageRequestBody | null;

const text =
  body && typeof body.text === "string" ? body.text.trim() : "";

const attachment = parseAttachment(body?.attachment);

const messageType: MessageType =
  body && isMessageType(body.messageType) ? body.messageType : "TEXT";

if (messageType === "TEXT" && !text) {
  return NextResponse.json(
    { error: "Message text is required" },
    { status: 400 }
  );
}

if (messageType === "IMAGE" && !attachment) {
  return NextResponse.json(
    { error: "Image attachment is required" },
    { status: 400 }
  );
}

if (messageType === "MIXED" && (!text || !attachment)) {
  return NextResponse.json(
    { error: "Mixed messages require text and an image attachment" },
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

  const message = await prisma.$transaction(
    async (tx: MessageTransactionClient) => {
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
  (messageType === "IMAGE" || messageType === "MIXED") && attachment
    ? {
        create: {
          conversationId,
          uploadedByUserId: user.id,
          objectPath: attachment.objectPath,
          fileName: attachment.fileName ?? null,
          contentType: attachment.contentType,
          sizeBytes: attachment.sizeBytes ?? null,
        },
      }
    : undefined,
        },
        select: {
          id: true,
          conversationId: true,
          senderUserId: true,
          senderRole: true,
          messageType: true,
          readAt: true,
          editedAt: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          attachments: {
            select: {
              id: true,
              conversationId: true,
              messageId: true,
              uploadedByUserId: true,
              objectPath: true,
              fileName: true,
              contentType: true,
              sizeBytes: true,
              createdAt: true,
            },
          },
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
    }
  );

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