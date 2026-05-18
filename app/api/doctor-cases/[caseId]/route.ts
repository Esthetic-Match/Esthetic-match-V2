import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await req.json();

    const { beforeImage, afterImage, title, procedure, notes, isPublic } = body;

    if (!caseId) {
      return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
    }

    const updatedCase = await prisma.beforeAfterCase.update({
      where: {
        id: caseId,
      },
      data: {
        ...(beforeImage !== undefined && { beforeImage }),
        ...(afterImage !== undefined && { afterImage }),
        ...(title !== undefined && { title: title?.trim() || null }),
        ...(procedure !== undefined && { procedure: procedure?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update gallery case" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    if (!caseId) {
      return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
    }

    await prisma.beforeAfterCase.delete({
      where: {
        id: caseId,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCaseId: caseId,
    });
  } catch (error) {
    console.error("DELETE /api/doctor-cases/[caseId] error:", error);

    return NextResponse.json(
      { error: "Failed to delete gallery case" },
      { status: 500 }
    );
  }
}