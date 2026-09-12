// app/api/doctor-cases/route.ts

import { prisma } from "@/lib/database/prisma";
import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(
  async (req: Request) => {
    const {
      doctorId,
      patientId,
      procedureId,
      title,
    } = await req.json();

    if (!doctorId) {
      throw new ApiError(
        "Missing doctorId",
        400,
        "DOCTOR_ID_REQUIRED"
      );
    }

    if (procedureId) {
      const procedure =
        await prisma.procedure.findUnique({
          where: {
            id: procedureId,
          },
          select: {
            id: true,
          },
        });

      if (!procedure) {
        throw new ApiError(
          "Procedure not found",
          404,
          "PROCEDURE_NOT_FOUND"
        );
      }
    }

    const createdCase =
      await prisma.beforeAfterCase.create({
        data: {
          doctorId,
          patientId: patientId || null,
          procedureId: procedureId || null,
          title: title?.trim() || null,
        },

        include: {
          procedure: {
            include: {
              translations: true,
            },
          },
        },
      });

    return apiSuccess(createdCase);
  }
);

export const GET = withApiHandler(
  async (req: Request) => {
    const { searchParams } = new URL(req.url);

    const doctorId =
      searchParams.get("doctorId");

    if (!doctorId) {
      throw new ApiError(
        "Missing doctorId",
        400,
        "DOCTOR_ID_REQUIRED"
      );
    }

    const cases =
      await prisma.beforeAfterCase.findMany({
        where: {
          doctorId,

          beforeImage: {
            not: null,
          },

          afterImage: {
            not: null,
          },
        },

        include: {
          procedure: {
            include: {
              translations: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 3,
      });

    return apiSuccess(cases);
  }
);