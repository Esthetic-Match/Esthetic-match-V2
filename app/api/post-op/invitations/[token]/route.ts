import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  headers,
} from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

import {
  hashPostOpInvitationToken,
} from "@/lib/post-op/invitations";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

class InvitationClaimError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "InvitationClaimError";

    this.status =
      status;
  }
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function normalizeEmail(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

/* ═══════════════════════════════════════════════════════════════
   GET
   Resolve invitation landing state
═══════════════════════════════════════════════════════════════ */

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { token } =
      await context.params;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Invitation token is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * The raw token is never queried or stored.
     */
    const tokenHash =
      hashPostOpInvitationToken(
        token,
      );

    const [
      invitation,
      session,
    ] =
      await Promise.all([
        prisma.postOpInvitation.findUnique({
          where: {
            tokenHash,
          },

          select: {
            id: true,

            recipientName:
              true,

            recipientEmail:
              true,

            patientUserId:
              true,

            expiresAt:
              true,

            openedAt:
              true,

            usedAt:
              true,

            revokedAt:
              true,

            case: {
              select: {
                id: true,

                patientUserId:
                  true,

                patientName:
                  true,

                patientEmail:
                  true,

                localeCode:
                  true,

                status:
                  true,

                procedurePerformedAt:
                  true,

                procedure: {
                  select: {
                    translations: {
                      select: {
                        localeCode:
                          true,

                        name: true,
                      },
                    },
                  },
                },

                doctorProfile: {
                  select: {
                    clinicName:
                      true,

                    avatar:
                      true,

                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },

                steps: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        }),

        auth.api.getSession({
          headers:
            await headers(),
        }),
      ]);

    /* ─────────────────────────────────────
       INVALID
    ───────────────────────────────────── */

    if (!invitation) {
      return NextResponse.json(
        {
          state:
            "INVALID",
        },
        {
          status: 404,
        },
      );
    }

    /* ─────────────────────────────────────
       REVOKED
    ───────────────────────────────────── */

    if (
      invitation.revokedAt
    ) {
      return NextResponse.json(
        {
          state:
            "REVOKED",
        },
        {
          status: 410,
        },
      );
    }

    /* ─────────────────────────────────────
       EXPIRED
    ───────────────────────────────────── */

    if (
      invitation.expiresAt <=
      new Date()
    ) {
      return NextResponse.json(
        {
          state:
            "EXPIRED",

          expiresAt:
            invitation.expiresAt,
        },
        {
          status: 410,
        },
      );
    }

    /* ─────────────────────────────────────
       OPENED
    ───────────────────────────────────── */

    if (
      !invitation.openedAt &&
      !invitation.usedAt
    ) {
      await prisma.postOpInvitation.updateMany(
        {
          where: {
            id:
              invitation.id,

            openedAt:
              null,

            usedAt:
              null,
          },

          data: {
            openedAt:
              new Date(),
          },
        },
      );
    }

    /* ─────────────────────────────────────
       ACCOUNT EXISTS
    ───────────────────────────────────── */

    const recipientAccount =
      await prisma.user.findFirst({
        where: {
          role:
            "PATIENT",

          email: {
            equals:
              invitation.recipientEmail,

            mode:
              "insensitive",
          },
        },

        select: {
          id: true,
        },
      });

    /* ─────────────────────────────────────
       CURRENT VIEWER
    ───────────────────────────────────── */

    const viewerEmail =
      session?.user.email
        ? normalizeEmail(
            session.user.email,
          )
        : null;

    const recipientEmail =
      normalizeEmail(
        invitation.recipientEmail,
      );

    const emailMatches =
      Boolean(
        viewerEmail &&
          viewerEmail ===
            recipientEmail,
      );

    const isPatient =
      session?.user.role ===
      "PATIENT";

    const accountMatches =
      Boolean(
        session?.user &&
          isPatient &&
          emailMatches,
      );

    const claimedByViewer =
      Boolean(
        invitation.usedAt &&
          session?.user?.id &&
          (
            invitation.patientUserId ===
              session.user.id ||
            invitation.case
              .patientUserId ===
              session.user.id
          ),
      );

    /* ─────────────────────────────────────
       PROCEDURE NAME
    ───────────────────────────────────── */

    const procedureName =
      invitation.case.procedure.translations.find(
        (
          translation,
        ) =>
          translation.localeCode ===
          invitation.case
            .localeCode,
      )?.name ??
      invitation.case.procedure.translations.find(
        (
          translation,
        ) =>
          translation.localeCode ===
          "en",
      )?.name ??
      "Procedure";

    return NextResponse.json({
      state:
        invitation.usedAt
          ? "USED"
          : "VALID",

      invitation: {
        recipientName:
          invitation.recipientName,

        recipientEmail:
          invitation.recipientEmail,

        expiresAt:
          invitation.expiresAt,

        accountExists:
          Boolean(
            recipientAccount,
          ),

        procedure: {
          name:
            procedureName,

          performedAt:
            invitation.case
              .procedurePerformedAt,
        },

        doctor: {
          name:
            invitation.case
              .doctorProfile
              .user.name,

          clinicName:
            invitation.case
              .doctorProfile
              .clinicName,

          avatar:
            invitation.case
              .doctorProfile
              .avatar,
        },

        stepCount:
          invitation.case
            .steps.length,
      },

      viewer: {
        authenticated:
          Boolean(
            session?.user,
          ),

        userId:
          session?.user?.id ??
          null,

        email:
          session?.user?.email ??
          null,

        role:
          session?.user?.role ??
          null,

        emailMatches,

        accountMatches,

        claimedByViewer,

        canClaim:
          Boolean(
            !invitation.usedAt &&
              accountMatches,
          ),
      },
    });
  } catch (error) {
    console.error(
      "Failed to resolve PostOp invitation:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load invitation.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   POST
   Atomically claim invitation
═══════════════════════════════════════════════════════════════ */

export async function POST(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    /* ─────────────────────────────────────
       AUTH
    ───────────────────────────────────── */

    const session =
      await auth.api.getSession({
        headers:
          await headers(),
      });

    if (!session?.user) {
      return NextResponse.json(
        {
          error:
            "You must sign in before claiming this recovery plan.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      session.user.role !==
      "PATIENT"
    ) {
      return NextResponse.json(
        {
          error:
            "This recovery plan can only be claimed by a patient account.",
        },
        {
          status: 403,
        },
      );
    }

    const { token } =
      await context.params;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Invitation token is required.",
        },
        {
          status: 400,
        },
      );
    }

    const tokenHash =
      hashPostOpInvitationToken(
        token,
      );

    const sessionEmail =
      normalizeEmail(
        session.user.email,
      );

    const now =
      new Date();

    /* ═══════════════════════════════════════
       ATOMIC CLAIM TRANSACTION

       Everything below succeeds together:
       - validate invitation
       - reserve invitation
       - attach patient
       - activate case
    ═══════════════════════════════════════ */

    const result =
      await prisma.$transaction(
        async (tx) => {
          const invitation =
            await tx.postOpInvitation.findUnique({
              where: {
                tokenHash,
              },

              select: {
                id: true,

                caseId:
                  true,

                patientUserId:
                  true,

                recipientEmail:
                  true,

                expiresAt:
                  true,

                usedAt:
                  true,

                revokedAt:
                  true,

                case: {
                  select: {
                    patientUserId:
                      true,

                    status:
                      true,

                    activatedAt:
                      true,
                  },
                },
              },
            });

          if (!invitation) {
            throw new InvitationClaimError(
              "Invitation not found.",
              404,
            );
          }

          /* ───────────────────────────────
             REVOKED
          ─────────────────────────────── */

          if (
            invitation.revokedAt
          ) {
            throw new InvitationClaimError(
              "This invitation has been revoked.",
              410,
            );
          }

          /* ───────────────────────────────
             EXPIRED
          ─────────────────────────────── */

          if (
            invitation.expiresAt <=
            now
          ) {
            throw new InvitationClaimError(
              "This invitation has expired.",
              410,
            );
          }

          /* ───────────────────────────────
             EMAIL OWNERSHIP
          ─────────────────────────────── */

          const recipientEmail =
            normalizeEmail(
              invitation.recipientEmail,
            );

          if (
            recipientEmail !==
            sessionEmail
          ) {
            throw new InvitationClaimError(
              "This invitation belongs to a different email address.",
              403,
            );
          }

          /* ───────────────────────────────
             PRE-ASSIGNED PATIENT
          ─────────────────────────────── */

          if (
            invitation.patientUserId &&
            invitation.patientUserId !==
              session.user.id
          ) {
            throw new InvitationClaimError(
              "This invitation belongs to another patient account.",
              403,
            );
          }

          if (
            invitation.case
              .patientUserId &&
            invitation.case
              .patientUserId !==
              session.user.id
          ) {
            throw new InvitationClaimError(
              "This recovery plan is already linked to another patient account.",
              409,
            );
          }

          /* ───────────────────────────────
             IDEMPOTENT CLAIM
          ─────────────────────────────── */

          if (
            invitation.usedAt
          ) {
            const belongsToViewer =
              invitation.patientUserId ===
                session.user.id ||
              invitation.case
                .patientUserId ===
                session.user.id;

            if (
              belongsToViewer
            ) {
              return {
                success:
                  true,

                alreadyClaimed:
                  true,

                caseId:
                  invitation.caseId,
              };
            }

            throw new InvitationClaimError(
              "This invitation has already been used.",
              409,
            );
          }

          /* ───────────────────────────────
             ENSURE PATIENT PROFILE
          ─────────────────────────────── */

          await tx.patientProfile.upsert({
            where: {
              userId:
                session.user.id,
            },

            create: {
              userId:
                session.user.id,
            },

            update: {},
          });

          /* ───────────────────────────────
             CLAIM INVITATION

             updateMany gives us a compare-and-
             set style claim:
             usedAt MUST still be null.
          ─────────────────────────────── */

          const claimedInvitation =
            await tx.postOpInvitation.updateMany(
              {
                where: {
                  id:
                    invitation.id,

                  usedAt:
                    null,

                  revokedAt:
                    null,

                  expiresAt: {
                    gt: now,
                  },

                  OR: [
                    {
                      patientUserId:
                        null,
                    },

                    {
                      patientUserId:
                        session.user.id,
                    },
                  ],
                },

                data: {
                  patientUserId:
                    session.user.id,

                  usedAt:
                    now,
                },
              },
            );

          /*
           * Another request may have claimed
           * the same invitation milliseconds
           * before this request.
           */
          if (
            claimedInvitation.count !==
            1
          ) {
            const latest =
              await tx.postOpInvitation.findUnique({
                where: {
                  id:
                    invitation.id,
                },

                select: {
                  usedAt:
                    true,

                  patientUserId:
                    true,
                },
              });

            if (
              latest?.usedAt &&
              latest.patientUserId ===
                session.user.id
            ) {
              return {
                success:
                  true,

                alreadyClaimed:
                  true,

                caseId:
                  invitation.caseId,
              };
            }

            throw new InvitationClaimError(
              "This invitation could not be claimed because its status changed.",
              409,
            );
          }

          /* ───────────────────────────────
             ATTACH + ACTIVATE CASE
          ─────────────────────────────── */

          const updatedCase =
            await tx.postOpCase.updateMany({
              where: {
                id:
                  invitation.caseId,

                OR: [
                  {
                    patientUserId:
                      null,
                  },

                  {
                    patientUserId:
                      session.user.id,
                  },
                ],
              },

              data: {
                patientUserId:
                  session.user.id,

                status:
                  "ACTIVE",

                activatedAt:
                  invitation.case
                    .activatedAt ??
                  now,
              },
            });

          if (
            updatedCase.count !==
            1
          ) {
            /*
             * Throwing here rolls back the
             * invitation update above too.
             */
            throw new InvitationClaimError(
              "This recovery plan is already linked to another patient.",
              409,
            );
          }

          return {
            success:
              true,

            alreadyClaimed:
              false,

            caseId:
              invitation.caseId,
          };
        },
      );

    return NextResponse.json(
      result,
    );
  } catch (error) {
    if (
      error instanceof
      InvitationClaimError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.status,
        },
      );
    }

    console.error(
      "Failed to claim PostOp invitation:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to activate recovery plan.",
      },
      {
        status: 500,
      },
    );
  }
}