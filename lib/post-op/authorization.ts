import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type PostOpRole =
  | "DOCTOR"
  | "PATIENT"
  | "ADMIN";

type PostOpAuthStatus =
  | 401
  | 403
  | 404;

export class PostOpAuthorizationError extends Error {
  status: PostOpAuthStatus;

  constructor(
    message: string,
    status: PostOpAuthStatus,
  ) {
    super(message);

    this.name =
      "PostOpAuthorizationError";

    this.status = status;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SESSION
═══════════════════════════════════════════════════════════════ */

export async function requirePostOpSession() {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user) {
    throw new PostOpAuthorizationError(
      "Authentication required.",
      401,
    );
  }

  return session;
}

/* ═══════════════════════════════════════════════════════════════
   ROLE
═══════════════════════════════════════════════════════════════ */

export async function requirePostOpDoctor() {
  const session =
    await requirePostOpSession();

  if (session.user.role !== "DOCTOR") {
    throw new PostOpAuthorizationError(
      "Doctor access required.",
      403,
    );
  }

  return session;
}

export async function requirePostOpPatient() {
  const session =
    await requirePostOpSession();

  if (session.user.role !== "PATIENT") {
    throw new PostOpAuthorizationError(
      "Patient access required.",
      403,
    );
  }

  return session;
}

/* ═══════════════════════════════════════════════════════════════
   DOCTOR PROFILE
═══════════════════════════════════════════════════════════════ */

export async function requirePostOpDoctorProfile() {
  const session =
    await requirePostOpDoctor();

  const doctorProfile =
    await prisma.doctorProfile.findUnique({
      where: {
        userId: session.user.id,
      },

      select: {
        id: true,
        userId: true,
        slug: true,
      },
    });

  if (!doctorProfile) {
    throw new PostOpAuthorizationError(
      "Doctor profile not found.",
      404,
    );
  }

  return {
    session,
    doctorProfile,
  };
}

/* ═══════════════════════════════════════════════════════════════
   DOCTOR → CASE ACCESS
═══════════════════════════════════════════════════════════════ */

/**
 * Ensures the authenticated doctor owns the PostOp case.
 *
 * Use this before allowing:
 * - View patient PostOp
 * - Complete/skip steps
 * - Read patient notes
 * - Read/acknowledge alerts
 * - Complete/cancel a case
 */
export async function requireDoctorPostOpCaseAccess(
  caseId: string,
) {
  const {
    session,
    doctorProfile,
  } =
    await requirePostOpDoctorProfile();

  const postOpCase =
    await prisma.postOpCase.findFirst({
      where: {
        id: caseId,
        doctorProfileId:
          doctorProfile.id,
      },

      select: {
        id: true,
        doctorProfileId: true,
        patientUserId: true,
        status: true,
      },
    });

  if (!postOpCase) {
    /*
     * Deliberately return the same error whether
     * the case doesn't exist or belongs to
     * another doctor.
     *
     * This avoids leaking case existence.
     */
    throw new PostOpAuthorizationError(
      "PostOp case not found.",
      404,
    );
  }

  return {
    session,
    doctorProfile,
    postOpCase,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT → CASE ACCESS
═══════════════════════════════════════════════════════════════ */

/**
 * Ensures the authenticated patient owns the PostOp case.
 *
 * patientUserId must match the authenticated Better Auth User.
 */
export async function requirePatientPostOpCaseAccess(
  caseId: string,
) {
  const session =
    await requirePostOpPatient();

  const postOpCase =
    await prisma.postOpCase.findFirst({
      where: {
        id: caseId,
        patientUserId:
          session.user.id,
      },

      select: {
        id: true,
        doctorProfileId: true,
        patientUserId: true,
        status: true,
      },
    });

  if (!postOpCase) {
    throw new PostOpAuthorizationError(
      "PostOp case not found.",
      404,
    );
  }

  return {
    session,
    postOpCase,
  };
}

/* ═══════════════════════════════════════════════════════════════
   DOCTOR → TEMPLATE ACCESS
═══════════════════════════════════════════════════════════════ */

/**
 * Doctors can only modify their own customized templates.
 *
 * DEFAULT platform templates must never be editable
 * through doctor routes.
 */
export async function requireDoctorPostOpTemplateAccess(
  templateId: string,
) {
  const {
    session,
    doctorProfile,
  } =
    await requirePostOpDoctorProfile();

  const template =
    await prisma.postOpTemplate.findFirst({
      where: {
        id: templateId,

        scope: "DOCTOR",

        doctorProfileId:
          doctorProfile.id,
      },

      select: {
        id: true,
        procedureId: true,
        doctorProfileId: true,
        scope: true,
        localeCode: true,
        version: true,
      },
    });

  if (!template) {
    throw new PostOpAuthorizationError(
      "PostOp template not found.",
      404,
    );
  }

  return {
    session,
    doctorProfile,
    template,
  };
}

/* ═══════════════════════════════════════════════════════════════
   GENERIC CASE ACCESS
═══════════════════════════════════════════════════════════════ */

/**
 * Useful for shared routes/components where either
 * the owning doctor OR the owning patient may access
 * the case.
 */
export async function requirePostOpCaseAccess(
  caseId: string,
) {
  const session =
    await requirePostOpSession();

  const role =
    session.user.role as PostOpRole;

  if (role === "DOCTOR") {
    const {
      doctorProfile,
      postOpCase,
    } =
      await requireDoctorPostOpCaseAccess(
        caseId,
      );

    return {
      actor: "DOCTOR" as const,

      session,

      doctorProfile,

      postOpCase,
    };
  }

  if (role === "PATIENT") {
    const {
      postOpCase,
    } =
      await requirePatientPostOpCaseAccess(
        caseId,
      );

    return {
      actor: "PATIENT" as const,

      session,

      postOpCase,
    };
  }

  throw new PostOpAuthorizationError(
    "PostOp access denied.",
    403,
  );
}

/* ═══════════════════════════════════════════════════════════════
   OWNERSHIP ASSERTIONS FOR CHILD RECORDS
═══════════════════════════════════════════════════════════════ */

/**
 * Doctor ownership of a PostOp step.
 *
 * Prevents:
 *
 * PATCH /cases/A/steps/<step-from-case-B>
 */
export async function requireDoctorPostOpStepAccess(
  stepId: string,
) {
  const {
    session,
    doctorProfile,
  } =
    await requirePostOpDoctorProfile();

  const step =
    await prisma.postOpCaseStep.findFirst({
      where: {
        id: stepId,

        case: {
          doctorProfileId:
            doctorProfile.id,
        },
      },

      select: {
        id: true,
        caseId: true,
        completionMode: true,
        completedAt: true,
        skippedAt: true,
      },
    });

  if (!step) {
    throw new PostOpAuthorizationError(
      "PostOp step not found.",
      404,
    );
  }

  return {
    session,
    doctorProfile,
    step,
  };
}

/**
 * Patient ownership of a PostOp step.
 */
export async function requirePatientPostOpStepAccess(
  stepId: string,
) {
  const session =
    await requirePostOpPatient();

  const step =
    await prisma.postOpCaseStep.findFirst({
      where: {
        id: stepId,

        case: {
          patientUserId:
            session.user.id,
        },
      },

      select: {
        id: true,
        caseId: true,
        completionMode: true,
        completedAt: true,
        skippedAt: true,
      },
    });

  if (!step) {
    throw new PostOpAuthorizationError(
      "PostOp step not found.",
      404,
    );
  }

  return {
    session,
    step,
  };
}

export async function requirePostOpAdmin() {
  const session =
    await requirePostOpSession();

  if (session.user.role !== "ADMIN") {
    throw new PostOpAuthorizationError(
      "Admin access required.",
      403,
    );
  }

  return session;
}