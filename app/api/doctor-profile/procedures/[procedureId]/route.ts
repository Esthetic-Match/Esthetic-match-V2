import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type UpdateBody = {
  price?: string | number | null;
  description?: string | null;
};

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      procedureId: string;
    }>;
  }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { procedureId } =
      await context.params;

    const body =
      (await request.json()) as UpdateBody;

    const doctorProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!doctorProfile) {
      return NextResponse.json(
        {
          error: "Doctor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const doctorProcedure =
      await prisma.doctorProcedure.findUnique({
        where: {
          doctorProfileId_procedureId: {
            doctorProfileId:
              doctorProfile.id,
            procedureId,
          },
        },
      });

    if (!doctorProcedure) {
      return NextResponse.json(
        {
          error:
            "This procedure is not assigned to your profile.",
        },
        {
          status: 404,
        }
      );
    }

    let price:
      | string
      | null
      | undefined = undefined;

    if (body.price !== undefined) {
      if (
        body.price === null ||
        String(body.price).trim() === ""
      ) {
        price = null;
      } else {
        const numericPrice = Number(
          body.price
        );

        if (
          !Number.isFinite(numericPrice) ||
          numericPrice < 0
        ) {
          return NextResponse.json(
            {
              error:
                "Price must be a valid positive number.",
            },
            {
              status: 400,
            }
          );
        }

        price =
          numericPrice.toFixed(2);
      }
    }

    const data: {
      price?: string | null;
      description?: string | null;
    } = {};

    if (price !== undefined) {
      data.price = price;
    }

    if (
      body.description !== undefined
    ) {
      data.description =
        body.description?.trim() || null;
    }

    const updated =
      await prisma.doctorProcedure.update({
        where: {
          doctorProfileId_procedureId: {
            doctorProfileId:
              doctorProfile.id,
            procedureId,
          },
        },

        data,

        select: {
          procedureId: true,
          price: true,
          description: true,
        },
      });

    return NextResponse.json({
      success: true,

      procedure: {
        ...updated,

        price:
          updated.price?.toString() ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "Failed to update doctor procedure:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update procedure.",
      },
      {
        status: 500,
      }
    );
  }
}