import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

type TopThreeMutationBody = {
  topThree?: unknown;
};

type NormalizedArrayResult =
  | { success: true; value: string[] }
  | { success: false; error: string };

function normalizeTopThree(value: unknown): NormalizedArrayResult {
  if (!Array.isArray(value)) {
    return {
      success: false,
      error: "topThree must be an array of procedure IDs.",
    };
  }

  const normalized: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      return {
        success: false,
        error: "topThree must contain only strings.",
      };
    }

    const procedureId = item.trim();

    if (!procedureId) {
      return {
        success: false,
        error: "topThree cannot contain empty values.",
      };
    }

    normalized.push(procedureId);
  }

  const uniqueValues = [...new Set(normalized)];

  if (uniqueValues.length > 3) {
    return {
      success: false,
      error: "A doctor can have no more than three top procedures.",
    };
  }

  return {
    success: true,
    value: uniqueValues,
  };
}

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  }

  return null;
}

async function getDoctorProfile(doctorUserId: string) {
  return prisma.doctorProfile.findUnique({
    where: {
      userId: doctorUserId,
    },
    select: {
      id: true,
      userId: true,
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

function formatResponse(
  doctorProfile: NonNullable<Awaited<ReturnType<typeof getDoctorProfile>>>,
) {
  return {
    doctor: {
      userId: doctorProfile.userId,
      doctorProfileId: doctorProfile.id,
      name: doctorProfile.user.name,
      email: doctorProfile.user.email,
    },
    procedureIds: doctorProfile.procedureIds,
    topThree: doctorProfile.topThree,
  };
}

function validateSelectedProcedures(
  topThree: string[],
  procedureIds: string[],
): string | null {
  const availableProcedures = new Set(procedureIds);
  const invalidProcedureId = topThree.find(
    (procedureId) => !availableProcedures.has(procedureId),
  );

  return invalidProcedureId
    ? `Procedure ${invalidProcedureId} is not assigned to this doctor.`
    : null;
}

async function resolveDoctorProfile(
  request: NextRequest,
  context: RouteContext,
) {
  const authorizationError = await requireAdmin(request);

  if (authorizationError) {
    return {
      response: authorizationError,
      doctorProfile: null,
      doctorUserId: null,
    };
  }

  const { doctorId } = await context.params;
  const doctorUserId = doctorId.trim();

  if (!doctorUserId) {
    return {
      response: NextResponse.json(
        { error: "Doctor user ID is required." },
        { status: 400 },
      ),
      doctorProfile: null,
      doctorUserId: null,
    };
  }

  const doctorProfile = await getDoctorProfile(doctorUserId);

  if (!doctorProfile || doctorProfile.user.role !== "DOCTOR") {
    return {
      response: NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      ),
      doctorProfile: null,
      doctorUserId: null,
    };
  }

  return {
    response: null,
    doctorProfile,
    doctorUserId,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const resolved = await resolveDoctorProfile(request, context);

    if (resolved.response || !resolved.doctorProfile) {
      return resolved.response;
    }

    return NextResponse.json(formatResponse(resolved.doctorProfile));
  } catch (error) {
    console.error("Could not load admin doctor top three:", error);

    return NextResponse.json(
      { error: "Could not load the doctor's top three procedures." },
      { status: 500 },
    );
  }
}

/** Adds procedure IDs to the current topThree list. */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const resolved = await resolveDoctorProfile(request, context);

    if (
      resolved.response ||
      !resolved.doctorProfile ||
      !resolved.doctorUserId
    ) {
      return resolved.response;
    }

    const body = (await request.json().catch(() => null)) as
      | TopThreeMutationBody
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "A valid JSON body is required." },
        { status: 400 },
      );
    }

    const normalized = normalizeTopThree(body.topThree);

    if (!normalized.success) {
      return NextResponse.json(
        { error: normalized.error },
        { status: 400 },
      );
    }

    const nextTopThree = [
      ...new Set([...resolved.doctorProfile.topThree, ...normalized.value]),
    ];

    if (nextTopThree.length > 3) {
      return NextResponse.json(
        { error: "A doctor can have no more than three top procedures." },
        { status: 400 },
      );
    }

    const invalidSelection = validateSelectedProcedures(
      nextTopThree,
      resolved.doctorProfile.procedureIds,
    );

    if (invalidSelection) {
      return NextResponse.json(
        { error: invalidSelection },
        { status: 400 },
      );
    }

    const updatedDoctorProfile = await prisma.doctorProfile.update({
      where: {
        userId: resolved.doctorUserId,
      },
      data: {
        topThree: nextTopThree,
      },
      select: {
        id: true,
        userId: true,
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

    return NextResponse.json(formatResponse(updatedDoctorProfile), {
      status: 201,
    });
  } catch (error) {
    console.error("Could not add admin doctor top three:", error);

    return NextResponse.json(
      { error: "Could not add the doctor's top three procedures." },
      { status: 500 },
    );
  }
}

/** Replaces the entire topThree list. An empty array removes all selections. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const resolved = await resolveDoctorProfile(request, context);

    if (
      resolved.response ||
      !resolved.doctorProfile ||
      !resolved.doctorUserId
    ) {
      return resolved.response;
    }

    const body = (await request.json().catch(() => null)) as
      | TopThreeMutationBody
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "A valid JSON body is required." },
        { status: 400 },
      );
    }

    const normalized = normalizeTopThree(body.topThree);

    if (!normalized.success) {
      return NextResponse.json(
        { error: normalized.error },
        { status: 400 },
      );
    }

    const invalidSelection = validateSelectedProcedures(
      normalized.value,
      resolved.doctorProfile.procedureIds,
    );

    if (invalidSelection) {
      return NextResponse.json(
        { error: invalidSelection },
        { status: 400 },
      );
    }

    const updatedDoctorProfile = await prisma.doctorProfile.update({
      where: {
        userId: resolved.doctorUserId,
      },
      data: {
        topThree: normalized.value,
      },
      select: {
        id: true,
        userId: true,
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

    return NextResponse.json(formatResponse(updatedDoctorProfile));
  } catch (error) {
    console.error("Could not update admin doctor top three:", error);

    return NextResponse.json(
      { error: "Could not update the doctor's top three procedures." },
      { status: 500 },
    );
  }
}

/**
 * With no JSON body, clears topThree completely.
 * With { topThree: [ids] }, removes only those IDs from the current list.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const resolved = await resolveDoctorProfile(request, context);

    if (
      resolved.response ||
      !resolved.doctorProfile ||
      !resolved.doctorUserId
    ) {
      return resolved.response;
    }

    const body = (await request.json().catch(() => null)) as
      | TopThreeMutationBody
      | null;

    let nextTopThree: string[] = [];

    if (body?.topThree !== undefined) {
      const normalized = normalizeTopThree(body.topThree);

      if (!normalized.success) {
        return NextResponse.json(
          { error: normalized.error },
          { status: 400 },
        );
      }

      const idsToRemove = new Set(normalized.value);
      nextTopThree = resolved.doctorProfile.topThree.filter(
        (procedureId) => !idsToRemove.has(procedureId),
      );
    }

    const updatedDoctorProfile = await prisma.doctorProfile.update({
      where: {
        userId: resolved.doctorUserId,
      },
      data: {
        topThree: nextTopThree,
      },
      select: {
        id: true,
        userId: true,
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

    return NextResponse.json(formatResponse(updatedDoctorProfile));
  } catch (error) {
    console.error("Could not delete admin doctor top three:", error);

    return NextResponse.json(
      { error: "Could not delete the doctor's top three procedures." },
      { status: 500 },
    );
  }
}