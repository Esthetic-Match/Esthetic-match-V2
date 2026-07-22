import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

type ProcedureMutationBody = {
  subcategoryIds?: unknown;
  procedureIds?: unknown;
};

type NormalizedArrayResult =
  | { success: true; value: string[] }
  | { success: false; error: string };

function normalizeStringArray(
  value: unknown,
  fieldName: string,
): NormalizedArrayResult {
  if (!Array.isArray(value)) {
    return {
      success: false,
      error: `${fieldName} must be an array of strings.`,
    };
  }

  const normalized: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      return {
        success: false,
        error: `${fieldName} must contain only strings.`,
      };
    }

    const id = item.trim();

    if (!id) {
      return {
        success: false,
        error: `${fieldName} cannot contain empty values.`,
      };
    }

    normalized.push(id);
  }

  return {
    success: true,
    value: [...new Set(normalized)],
  };
}

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return {
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
      session: null,
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      ),
      session: null,
    };
  }

  return {
    response: null,
    session,
  };
}

async function getDoctorProfile(doctorUserId: string) {
  return prisma.doctorProfile.findUnique({
    where: {
      userId: doctorUserId,
    },
    select: {
      id: true,
      userId: true,
      specialtyIds: true,
      subcategoryIds: true,
      procedureIds: true,
      topThree: true,
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

function formatDoctorProcedureResponse(
  doctorProfile: NonNullable<Awaited<ReturnType<typeof getDoctorProfile>>>,
) {
  return {
    doctor: {
      userId: doctorProfile.userId,
      doctorProfileId: doctorProfile.id,
      name: doctorProfile.user.name,
      email: doctorProfile.user.email,
    },
    specialtyIds: doctorProfile.specialtyIds,
    subcategoryIds: doctorProfile.subcategoryIds,
    procedureIds: doctorProfile.procedureIds,
    topThree: doctorProfile.topThree,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authorization = await requireAdmin(request);

    if (authorization.response) {
      return authorization.response;
    }

    const { doctorId } = await context.params;
    const doctorUserId = doctorId.trim();

    if (!doctorUserId) {
      return NextResponse.json(
        { error: "Doctor user ID is required." },
        { status: 400 },
      );
    }

    const doctorProfile = await getDoctorProfile(doctorUserId);

    if (!doctorProfile || doctorProfile.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(formatDoctorProcedureResponse(doctorProfile));
  } catch (error) {
    console.error("Could not load admin doctor procedures:", error);

    return NextResponse.json(
      { error: "Could not load the doctor's procedures." },
      { status: 500 },
    );
  }
}

/**
 * Adds procedures/subcategories to the doctor's current selections.
 * Existing values are preserved. Use PATCH when replacing/removing selections.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authorization = await requireAdmin(request);

    if (authorization.response) {
      return authorization.response;
    }

    const { doctorId } = await context.params;
    const doctorUserId = doctorId.trim();

    if (!doctorUserId) {
      return NextResponse.json(
        { error: "Doctor user ID is required." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | ProcedureMutationBody
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "A valid JSON body is required." },
        { status: 400 },
      );
    }

    const proceduresResult = normalizeStringArray(
      body.procedureIds,
      "procedureIds",
    );

    if (!proceduresResult.success) {
      return NextResponse.json(
        { error: proceduresResult.error },
        { status: 400 },
      );
    }

    const subcategoriesResult =
      body.subcategoryIds === undefined
        ? ({ success: true, value: [] } as const)
        : normalizeStringArray(body.subcategoryIds, "subcategoryIds");

    if (!subcategoriesResult.success) {
      return NextResponse.json(
        { error: subcategoriesResult.error },
        { status: 400 },
      );
    }

    if (
      proceduresResult.value.length === 0 &&
      subcategoriesResult.value.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one procedure or subcategory must be provided." },
        { status: 400 },
      );
    }

    const currentDoctorProfile = await getDoctorProfile(doctorUserId);

    if (!currentDoctorProfile || currentDoctorProfile.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      );
    }

    const updatedDoctorProfile = await prisma.doctorProfile.update({
      where: {
        userId: doctorUserId,
      },
      data: {
        subcategoryIds: [
          ...new Set([
            ...currentDoctorProfile.subcategoryIds,
            ...subcategoriesResult.value,
          ]),
        ],
        procedureIds: [
          ...new Set([
            ...currentDoctorProfile.procedureIds,
            ...proceduresResult.value,
          ]),
        ],
      },
      select: {
        id: true,
        userId: true,
        specialtyIds: true,
        subcategoryIds: true,
        procedureIds: true,
        topThree: true,
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      formatDoctorProcedureResponse(updatedDoctorProfile),
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not add admin doctor procedures:", error);

    return NextResponse.json(
      { error: "Could not add procedures to the doctor's account." },
      { status: 500 },
    );
  }
}

/**
 * Replaces the doctor's selected procedures/subcategories.
 * Removing an ID from procedureIds removes it from the doctor and also removes
 * it from topThree so topThree can never reference an unselected procedure.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authorization = await requireAdmin(request);

    if (authorization.response) {
      return authorization.response;
    }

    const { doctorId } = await context.params;
    const doctorUserId = doctorId.trim();

    if (!doctorUserId) {
      return NextResponse.json(
        { error: "Doctor user ID is required." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | ProcedureMutationBody
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "A valid JSON body is required." },
        { status: 400 },
      );
    }

    const proceduresResult = normalizeStringArray(
      body.procedureIds,
      "procedureIds",
    );
    const subcategoriesResult = normalizeStringArray(
      body.subcategoryIds,
      "subcategoryIds",
    );

    if (!proceduresResult.success) {
      return NextResponse.json(
        { error: proceduresResult.error },
        { status: 400 },
      );
    }

    if (!subcategoriesResult.success) {
      return NextResponse.json(
        { error: subcategoriesResult.error },
        { status: 400 },
      );
    }

    const currentDoctorProfile = await getDoctorProfile(doctorUserId);

    if (!currentDoctorProfile || currentDoctorProfile.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      );
    }

    const selectedProcedureIds = new Set(proceduresResult.value);
    const syncedTopThree = currentDoctorProfile.topThree.filter((procedureId) =>
      selectedProcedureIds.has(procedureId),
    );

    const updatedDoctorProfile = await prisma.doctorProfile.update({
      where: {
        userId: doctorUserId,
      },
      data: {
        subcategoryIds: subcategoriesResult.value,
        procedureIds: proceduresResult.value,
        topThree: syncedTopThree,
      },
      select: {
        id: true,
        userId: true,
        specialtyIds: true,
        subcategoryIds: true,
        procedureIds: true,
        topThree: true,
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(formatDoctorProcedureResponse(updatedDoctorProfile));
  } catch (error) {
    console.error("Could not update admin doctor procedures:", error);

    return NextResponse.json(
      { error: "Could not update the doctor's procedures." },
      { status: 500 },
    );
  }
}