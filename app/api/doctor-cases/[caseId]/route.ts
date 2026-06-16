import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type RouteParams = {
  params: Promise<{
    caseId: string;
  }>;
};

export const PATCH = withApiHandler<RouteParams>(
  async (req: Request, { params }) => {
    const { caseId } = await params;
    const body = await req.json();

    const { beforeImage, afterImage, title, procedure, notes, isPublic } = body;

    if (!caseId) {
      throw new ApiError("Missing caseId", 400, "CASE_ID_REQUIRED");
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

    return apiSuccess(updatedCase);
  }
);

export const DELETE = withApiHandler<RouteParams>(
  async (_req: Request, { params }) => {
    const { caseId } = await params;

    if (!caseId) {
      throw new ApiError("Missing caseId", 400, "CASE_ID_REQUIRED");
    }

    await prisma.beforeAfterCase.delete({
      where: {
        id: caseId,
      },
    });

    return apiSuccess({
      success: true,
      deletedCaseId: caseId,
    });
  }
);