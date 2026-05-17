import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isDoctorOwner =
      conversation.doctorProfile.userId === session.user.id;

    if (!isDoctorOwner) {
      return NextResponse.json(
        { error: "Only the doctor can end this conversation" },
        { status: 403 }
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

    return NextResponse.json({
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to close conversation" },
      { status: 500 }
    );
  }
}