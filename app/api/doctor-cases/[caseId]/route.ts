import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const { beforeImage, afterImage } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
    }

    const updatedCase = await prisma.beforeAfterCase.update({
      where: {
        id: caseId,
      },
      data: {
        beforeImage,
        afterImage,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update case images" },
      { status: 500 }
    );
  }
}