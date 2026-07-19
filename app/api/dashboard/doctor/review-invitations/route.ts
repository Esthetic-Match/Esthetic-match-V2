import {
  createHash,
  randomBytes,
} from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { sendEmail } from "@/lib/utils/email";

export const dynamic = "force-dynamic";

const INVITATION_VALIDITY_DAYS = 7;

type InvitationDelivery = "email" | "link";
type SupportedLocale = "en" | "fr";

type CreateInvitationBody = {
  doctorProfileId: string;
  patientUserId: string | null;
  delivery: InvitationDelivery;
  locale: SupportedLocale;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBody(
  value: unknown
): CreateInvitationBody | null {
  if (!isRecord(value)) {
    return null;
  }

  const doctorProfileId =
    typeof value.doctorProfileId === "string"
      ? value.doctorProfileId.trim()
      : "";

  const patientUserId =
    typeof value.patientUserId === "string"
      ? value.patientUserId.trim()
      : null;

  const delivery: InvitationDelivery =
    value.delivery === "link"
      ? "link"
      : "email";

  const locale: SupportedLocale =
    typeof value.locale === "string" &&
    value.locale
      .trim()
      .toLowerCase()
      .startsWith("fr")
      ? "fr"
      : "en";

  if (!doctorProfileId) {
    return null;
  }

  if (
    delivery === "email" &&
    !patientUserId
  ) {
    return null;
  }

  return {
    doctorProfileId,
    patientUserId:
      patientUserId || null,
    delivery,
    locale,
  };
}

function hashToken(
  token: string
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function escapeHtml(
  value: string
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getEmailContent({
  locale,
  patientName,
  doctorName,
  clinicName,
  reviewUrl,
  expiresAt,
}: {
  locale: SupportedLocale;
  patientName: string;
  doctorName: string;
  clinicName: string;
  reviewUrl: string;
  expiresAt: Date;
}) {
  const safePatientName =
    escapeHtml(patientName);
  const safeDoctorName =
    escapeHtml(doctorName);
  const safeClinicName =
    escapeHtml(clinicName);
  const safeReviewUrl =
    escapeHtml(reviewUrl);

  const formattedExpiry =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
    }).format(expiresAt);

  if (locale === "fr") {
    return {
      subject:
        `Partagez votre avis sur ${clinicName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.65;">
          <h1 style="margin-bottom: 12px;">Votre avis compte</h1>
          <p>Bonjour ${safePatientName},</p>
          <p>
            ${safeDoctorName} de ${safeClinicName} vous invite à partager votre expérience sur Esthetic Match.
          </p>
          <p style="margin: 28px 0;">
            <a
              href="${safeReviewUrl}"
              style="background: #283C5D; color: #ffffff; padding: 13px 22px; border-radius: 999px; text-decoration: none; display: inline-block;"
            >
              Donner mon avis
            </a>
          </p>
          <p style="font-size: 13px; color: #5E6A7C;">
            Ce lien expire le ${formattedExpiry} et ne peut être utilisé qu’une seule fois.
          </p>
          <p>Merci,<br />Esthetic Match</p>
        </div>
      `,
    };
  }

  return {
    subject:
      `Share your experience with ${clinicName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #283C5D; line-height: 1.65;">
        <h1 style="margin-bottom: 12px;">Your experience matters</h1>
        <p>Hello ${safePatientName},</p>
        <p>
          ${safeDoctorName} from ${safeClinicName} has invited you to share your experience on Esthetic Match.
        </p>
        <p style="margin: 28px 0;">
          <a
            href="${safeReviewUrl}"
            style="background: #283C5D; color: #ffffff; padding: 13px 22px; border-radius: 999px; text-decoration: none; display: inline-block;"
          >
            Leave a review
          </a>
        </p>
        <p style="font-size: 13px; color: #5E6A7C;">
          This link expires on ${formattedExpiry} and can only be used once.
        </p>
        <p>Thank you,<br />Esthetic Match</p>
      </div>
    `,
  };
}

async function getSessionUserId(): Promise<
  string | null
> {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  return session?.user?.id ?? null;
}

export async function POST(
  request: Request
) {
  try {
    const body: unknown =
      await request
        .json()
        .catch(() => null);

    const input = parseBody(body);

    if (!input) {
      return NextResponse.json(
        {
          error:
            "Select a doctor and provide a valid invitation configuration.",
          code:
            "INVALID_INVITATION_INPUT",
        },
        {
          status: 400,
        }
      );
    }

    const sessionUserId =
      await getSessionUserId();

    if (
      (
        input.delivery === "email" ||
        input.patientUserId
      ) &&
      !sessionUserId
    ) {
      return NextResponse.json(
        {
          error:
            "Sign in to select a patient or send an email invitation.",
          code:
            "PATIENT_INVITATION_AUTH_REQUIRED",
        },
        {
          status: 401,
        }
      );
    }

    const doctorProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          id: input.doctorProfileId,
        },
        select: {
          id: true,
          clinicName: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

    if (!doctorProfile) {
      return NextResponse.json(
        {
          error:
            "The selected doctor could not be found.",
          code:
            "DOCTOR_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    const patient = input.patientUserId
      ? await prisma.user.findFirst({
          where: {
            id: input.patientUserId,
            role: "PATIENT",
          },
          select: {
            id: true,
            email: true,
            name: true,
            patientProfile: {
              select: {
                preferredLanguage: true,
              },
            },
          },
        })
      : null;

    if (
      input.patientUserId &&
      !patient
    ) {
      return NextResponse.json(
        {
          error:
            "The selected patient could not be found.",
          code:
            "PATIENT_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    const locale: SupportedLocale =
      patient?.patientProfile
        ?.preferredLanguage
        ?.trim()
        .toLowerCase()
        .startsWith("fr")
        ? "fr"
        : input.locale;

    const rawToken =
      randomBytes(32).toString(
        "base64url"
      );
    const tokenHash =
      hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() +
        INVITATION_VALIDITY_DAYS *
          24 *
          60 *
          60 *
          1000
    );

    const invitation =
      await prisma.$transaction(
        async (tx) => {
          if (patient) {
            await tx.reviewInvitation.updateMany({
              where: {
                doctorProfileId:
                  doctorProfile.id,
                patientUserId:
                  patient.id,
                usedAt: null,
                revokedAt: null,
                expiresAt: {
                  gt: now,
                },
              },
              data: {
                revokedAt: now,
              },
            });
          }

          return tx.reviewInvitation.create({
            data: {
              doctorProfileId:
                doctorProfile.id,
              patientUserId:
                patient?.id ?? null,
              recipientEmail:
                patient?.email.toLowerCase() ??
                null,
              tokenHash,
              expiresAt,
            },
            select: {
              id: true,
              recipientEmail: true,
              expiresAt: true,
              patientUserId: true,
            },
          });
        }
      );

    const reviewUrl =
      `${getAppUrl()}/${locale}` +
      `/review/${rawToken}`;

    let sentAt: Date | null = null;

    if (input.delivery === "email") {
      if (!patient) {
        return NextResponse.json(
          {
            error:
              "Select a patient before sending an email invitation.",
            code:
              "PATIENT_REQUIRED_FOR_EMAIL",
          },
          {
            status: 400,
          }
        );
      }

      const emailContent =
        getEmailContent({
          locale,
          patientName:
            patient.name?.trim() ||
            (
              locale === "fr"
                ? "patient"
                : "there"
            ),
          doctorName:
            doctorProfile.user.name?.trim() ||
            doctorProfile.clinicName,
          clinicName:
            doctorProfile.clinicName,
          reviewUrl,
          expiresAt,
        });

      try {
        await sendEmail({
          to: patient.email,
          subject:
            emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        await prisma.reviewInvitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            revokedAt: new Date(),
          },
        });

        console.error(
          "Could not send review invitation email:",
          emailError
        );

        return NextResponse.json(
          {
            error:
              "The review invitation could not be emailed.",
            code:
              "REVIEW_INVITATION_EMAIL_FAILED",
          },
          {
            status: 500,
          }
        );
      }

      sentAt = new Date();

      await prisma.reviewInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          sentAt,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        delivery: input.delivery,
        invitation: {
          id: invitation.id,
          doctorProfileId:
            doctorProfile.id,
          recipientEmail:
            invitation.recipientEmail,
          reviewUrl,
          expiresAt:
            invitation.expiresAt.toISOString(),
          sentAt:
            sentAt?.toISOString() ??
            null,
          isRestrictedToPatient:
            invitation.patientUserId !==
            null,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Could not create review invitation:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not create the review invitation.",
        code:
          "REVIEW_INVITATION_CREATE_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}
