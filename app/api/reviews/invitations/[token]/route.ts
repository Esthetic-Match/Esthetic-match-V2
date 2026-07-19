import {
  createHash,
} from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

type ReviewInput = {
  title: string;
  review: string;
  rating: number;
};

type InvitationErrorCode =
  | "UNAUTHORIZED"
  | "PATIENT_ACCOUNT_REQUIRED"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_FOR_DIFFERENT_PATIENT"
  | "INVITATION_EXPIRED"
  | "INVITATION_REVOKED"
  | "INVITATION_ALREADY_USED"
  | "INVALID_REVIEW"
  | "REVIEW_SUBMISSION_CONFLICT";

class ReviewSubmissionConflictError extends Error {
  constructor() {
    super(
      "The review invitation is no longer available."
    );
    this.name =
      "ReviewSubmissionConflictError";
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseReviewInput(
  value: unknown
): ReviewInput | null {
  if (
    !isRecord(value) ||
    typeof value.title !== "string" ||
    typeof value.review !== "string" ||
    typeof value.rating !== "number"
  ) {
    return null;
  }

  const title = value.title.trim();
  const review = value.review.trim();
  const rating = value.rating;

  if (
    title.length < 3 ||
    title.length > 120 ||
    review.length < 10 ||
    review.length > 3000 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return null;
  }

  return {
    title,
    review,
    rating,
  };
}

function normalizeEmail(
  email: string
): string {
  return email.trim().toLowerCase();
}

function hashToken(
  token: string
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function errorResponse(
  error: string,
  code: InvitationErrorCode,
  status: number
) {
  return NextResponse.json(
    {
      error,
      code,
    },
    {
      status,
    }
  );
}

async function getAuthenticatedUser() {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (
    !session?.user?.id ||
    !session.user.email
  ) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

  return user;
}

async function getInvitation(
  token: string
) {
  if (
    token.length < 32 ||
    token.length > 256
  ) {
    return null;
  }

  return prisma.reviewInvitation.findUnique(
    {
      where: {
        tokenHash: hashToken(token),
      },
      select: {
        id: true,
        patientUserId: true,
        doctorProfileId: true,
        recipientEmail: true,
        expiresAt: true,
        usedAt: true,
        revokedAt: true,
        review: {
          select: {
            id: true,
          },
        },
        doctorProfile: {
          select: {
            clinicName: true,
            city: true,
            country: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }
  );
}

function validateInvitationAccess({
  invitation,
  user,
}: {
  invitation: NonNullable<
    Awaited<
      ReturnType<
        typeof getInvitation
      >
    >
  >;
  user: {
    id: string;
    email: string;
    role: string;
  };
}) {
  if (invitation.revokedAt) {
    return errorResponse(
      "This review invitation has been revoked.",
      "INVITATION_REVOKED",
      410
    );
  }

  if (
    invitation.usedAt ||
    invitation.review
  ) {
    return errorResponse(
      "This review invitation has already been used.",
      "INVITATION_ALREADY_USED",
      410
    );
  }

  if (
    invitation.expiresAt.getTime() <=
    Date.now()
  ) {
    return errorResponse(
      "This review invitation has expired.",
      "INVITATION_EXPIRED",
      410
    );
  }

  if (user.role !== "PATIENT") {
    return errorResponse(
      "Sign in with a patient account to leave a review.",
      "PATIENT_ACCOUNT_REQUIRED",
      403
    );
  }

  const isRestricted =
    invitation.patientUserId !== null ||
    invitation.recipientEmail !== null;

  if (
    isRestricted &&
    (
      invitation.patientUserId !==
        user.id ||
      !invitation.recipientEmail ||
      normalizeEmail(
        invitation.recipientEmail
      ) !==
        normalizeEmail(user.email)
    )
  ) {
    return errorResponse(
      "This invitation belongs to a different patient account.",
      "INVITATION_FOR_DIFFERENT_PATIENT",
      403
    );
  }

  return null;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return errorResponse(
        "Sign in to access this review invitation.",
        "UNAUTHORIZED",
        401
      );
    }

    const { token } =
      await context.params;

    const invitation =
      await getInvitation(token);

    if (!invitation) {
      return errorResponse(
        "Review invitation not found.",
        "INVITATION_NOT_FOUND",
        404
      );
    }

    const accessError =
      validateInvitationAccess({
        invitation,
        user,
      });

    if (accessError) {
      return accessError;
    }

    return NextResponse.json(
      {
        invitation: {
          expiresAt:
            invitation.expiresAt.toISOString(),
          isRestrictedToPatient:
            invitation.patientUserId !==
              null ||
            invitation.recipientEmail !==
              null,
          doctor: {
            name:
              invitation.doctorProfile
                .user.name ||
              invitation.doctorProfile
                .clinicName,
            clinicName:
              invitation.doctorProfile
                .clinicName,
            city:
              invitation.doctorProfile
                .city,
            country:
              invitation.doctorProfile
                .country,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Could not validate review invitation:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not validate the review invitation.",
        code:
          "REVIEW_INVITATION_VALIDATION_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return errorResponse(
        "Sign in to submit this review.",
        "UNAUTHORIZED",
        401
      );
    }

    const { token } =
      await context.params;

    const invitation =
      await getInvitation(token);

    if (!invitation) {
      return errorResponse(
        "Review invitation not found.",
        "INVITATION_NOT_FOUND",
        404
      );
    }

    const accessError =
      validateInvitationAccess({
        invitation,
        user,
      });

    if (accessError) {
      return accessError;
    }

    const body: unknown =
      await request
        .json()
        .catch(() => null);

    const input =
      parseReviewInput(body);

    if (!input) {
      return errorResponse(
        "Enter a title, a review of at least 10 characters, and a rating from 1 to 5.",
        "INVALID_REVIEW",
        400
      );
    }

    const now = new Date();

    const createdReview =
      await prisma.$transaction(
        async (tx) => {
          const isRestricted =
            invitation.patientUserId !==
              null ||
            invitation.recipientEmail !==
              null;

          const claimedInvitation =
            isRestricted
              ? await tx.reviewInvitation.updateMany(
                  {
                    where: {
                      id: invitation.id,
                      patientUserId:
                        user.id,
                      recipientEmail: {
                        equals:
                          normalizeEmail(
                            user.email
                          ),
                        mode:
                          "insensitive",
                      },
                      usedAt: null,
                      revokedAt: null,
                      expiresAt: {
                        gt: now,
                      },
                    },
                    data: {
                      usedAt: now,
                    },
                  }
                )
              : await tx.reviewInvitation.updateMany(
                  {
                    where: {
                      id: invitation.id,
                      patientUserId: null,
                      recipientEmail: null,
                      usedAt: null,
                      revokedAt: null,
                      expiresAt: {
                        gt: now,
                      },
                    },
                    data: {
                      patientUserId:
                        user.id,
                      recipientEmail:
                        normalizeEmail(
                          user.email
                        ),
                      usedAt: now,
                    },
                  }
                );

          if (
            claimedInvitation.count !== 1
          ) {
            throw new ReviewSubmissionConflictError();
          }

          return tx.review.create({
            data: {
              title: input.title,
              review: input.review,
              rating: input.rating,
              patientUserId: user.id,
              doctorProfileId:
                invitation.doctorProfileId,
              invitationId:
                invitation.id,
            },
            select: {
              id: true,
              createdAt: true,
            },
          });
        }
      );

    return NextResponse.json(
      {
        success: true,
        review: {
          id: createdReview.id,
          createdAt:
            createdReview.createdAt.toISOString(),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof
      ReviewSubmissionConflictError
    ) {
      return errorResponse(
        "This review invitation is no longer available.",
        "REVIEW_SUBMISSION_CONFLICT",
        409
      );
    }

    console.error(
      "Could not submit review:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not submit your review.",
        code:
          "REVIEW_SUBMISSION_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}
