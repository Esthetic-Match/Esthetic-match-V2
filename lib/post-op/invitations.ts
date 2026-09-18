import "server-only";

import crypto from "crypto";

import {
  sendEmail,
} from "@/lib/utils/email";

/* ═══════════════════════════════════════════════════════════════
   TOKEN
═══════════════════════════════════════════════════════════════ */

export function createPostOpInvitationToken() {
  const rawToken =
    crypto
      .randomBytes(32)
      .toString("base64url");

  return {
    rawToken,

    tokenHash:
      hashPostOpInvitationToken(
        rawToken,
      ),
  };
}

export function hashPostOpInvitationToken(
  rawToken: string,
) {
  return crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
}

/* ═══════════════════════════════════════════════════════════════
   EXPIRY
═══════════════════════════════════════════════════════════════ */

export function getPostOpInvitationExpiry() {
  const hours =
    Number(
      process.env
        .POST_OP_INVITATION_EXPIRY_HOURS ??
        168,
    );

  const safeHours =
    Number.isFinite(hours) &&
    hours > 0
      ? hours
      : 168;

  return new Date(
    Date.now() +
      safeHours *
        60 *
        60 *
        1000,
  );
}

/* ═══════════════════════════════════════════════════════════════
   URL
═══════════════════════════════════════════════════════════════ */

export function getPostOpInvitationUrl({
  rawToken,
  localeCode,
}: {
  rawToken: string;
  localeCode: string;
}) {
  const baseUrl =
    process.env
      .NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL must be configured.",
    );
  }

  const normalizedBase =
    baseUrl.replace(
      /\/+$/,
      "",
    );

  return `${normalizedBase}/${localeCode}/post-op/invite/${encodeURIComponent(
    rawToken,
  )}`;
}

/* ═══════════════════════════════════════════════════════════════
   EMAIL
═══════════════════════════════════════════════════════════════ */

type InvitationEmailInput = {
  recipientName: string;
  recipientEmail: string;

  registeredPatient: boolean;

  doctorName: string;

  procedureName: string;

  procedurePerformedAt: Date;

  invitationUrl: string;

  expiresAt: Date;

  localeCode: string;
};

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

export async function sendPostOpInvitationEmail({
  recipientName,
  recipientEmail,

  registeredPatient,

  doctorName,

  procedureName,

  procedurePerformedAt,

  invitationUrl,

  expiresAt,

  localeCode,
}: InvitationEmailInput) {
  const locale =
    localeCode === "fr"
      ? "fr-FR"
      : "en-GB";

  const isFrench =
    localeCode === "fr";

  const operationDate =
    new Intl.DateTimeFormat(
      locale,
      {
        dateStyle: "long",
        timeStyle: "short",
      },
    ).format(
      procedurePerformedAt,
    );

  const expiryDate =
    new Intl.DateTimeFormat(
      locale,
      {
        dateStyle: "long",
        timeStyle: "short",
      },
    ).format(
      expiresAt,
    );

  const safeName =
    escapeHtml(
      recipientName,
    );

  const safeDoctor =
    escapeHtml(
      doctorName,
    );

  const safeProcedure =
    escapeHtml(
      procedureName,
    );

  const safeUrl =
    escapeHtml(
      invitationUrl,
    );

  const copy =
    isFrench
      ? {
          subject:
            "Votre parcours de récupération Esthetic Match",

          eyebrow:
            "Esthetic Match PostOp",

          title:
            "Votre parcours de récupération est prêt",

          hello:
            `Bonjour ${safeName},`,

          intro:
            registeredPatient
              ? `${safeDoctor} a préparé votre parcours de récupération après votre intervention. Connectez-vous à votre compte Esthetic Match pour y accéder.`
              : `${safeDoctor} a préparé votre parcours de récupération après votre intervention. Créez votre compte patient Esthetic Match pour y accéder en toute sécurité.`,

          procedure:
            "Procédure",

          doctor:
            "Médecin",

          operationDate:
            "Date de l’intervention",

          expires:
            "Invitation valable jusqu’au",

          button:
            registeredPatient
              ? "Accéder à mon parcours"
              : "Créer mon compte et continuer",

          security:
            "Ce lien est personnel et sécurisé. Ne le partagez pas.",
        }
      : {
          subject:
            "Your Esthetic Match recovery journey",

          eyebrow:
            "Esthetic Match PostOp",

          title:
            "Your recovery journey is ready",

          hello:
            `Hello ${safeName},`,

          intro:
            registeredPatient
              ? `${safeDoctor} has prepared your recovery journey following your procedure. Sign in to your Esthetic Match account to access it.`
              : `${safeDoctor} has prepared your recovery journey following your procedure. Create your Esthetic Match patient account to access it securely.`,

          procedure:
            "Procedure",

          doctor:
            "Doctor",

          operationDate:
            "Procedure date",

          expires:
            "Invitation valid until",

          button:
            registeredPatient
              ? "Open my recovery journey"
              : "Create account and continue",

          security:
            "This link is private and secure. Please do not share it.",
        };

  await sendEmail({
    to:
      recipientEmail,

    subject:
      copy.subject,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          background: #FAF9F7;
          padding: 32px 16px;
          color: #283C5D;
        "
      >
        <div
          style="
            max-width: 580px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 24px;
            padding: 36px;
          "
        >
          <div
            style="
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: #B4945A;
              margin-bottom: 18px;
            "
          >
            ${copy.eyebrow}
          </div>

          <h1
            style="
              margin: 0;
              color: #283C5D;
              font-size: 27px;
              line-height: 1.25;
            "
          >
            ${copy.title}
          </h1>

          <p
            style="
              margin-top: 24px;
              color: #596579;
              line-height: 1.7;
            "
          >
            ${copy.hello}
          </p>

          <p
            style="
              color: #596579;
              line-height: 1.7;
            "
          >
            ${copy.intro}
          </p>

          <div
            style="
              margin-top: 26px;
              background: #FAF9F7;
              border-radius: 16px;
              padding: 20px;
            "
          >
            <div style="margin-bottom: 14px;">
              <div
                style="
                  font-size: 10px;
                  color: #9AA0AA;
                  text-transform: uppercase;
                  letter-spacing: 0.12em;
                "
              >
                ${copy.procedure}
              </div>

              <div
                style="
                  margin-top: 4px;
                  font-weight: 600;
                  color: #283C5D;
                "
              >
                ${safeProcedure}
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <div
                style="
                  font-size: 10px;
                  color: #9AA0AA;
                  text-transform: uppercase;
                  letter-spacing: 0.12em;
                "
              >
                ${copy.doctor}
              </div>

              <div
                style="
                  margin-top: 4px;
                  font-weight: 600;
                  color: #283C5D;
                "
              >
                ${safeDoctor}
              </div>
            </div>

            <div>
              <div
                style="
                  font-size: 10px;
                  color: #9AA0AA;
                  text-transform: uppercase;
                  letter-spacing: 0.12em;
                "
              >
                ${copy.operationDate}
              </div>

              <div
                style="
                  margin-top: 4px;
                  font-weight: 600;
                  color: #283C5D;
                "
              >
                ${operationDate}
              </div>
            </div>
          </div>

          <div
            style="
              margin: 28px 0;
            "
          >
            <a
              href="${safeUrl}"
              style="
                display: inline-block;
                background: #283C5D;
                color: #FFFFFF;
                text-decoration: none;
                padding: 14px 22px;
                border-radius: 12px;
                font-weight: 600;
              "
            >
              ${copy.button}
            </a>
          </div>

          <p
            style="
              font-size: 12px;
              color: #7A8491;
              line-height: 1.6;
            "
          >
            ${copy.expires}: <strong>${expiryDate}</strong>
          </p>

          <p
            style="
              font-size: 12px;
              color: #9AA0AA;
              line-height: 1.6;
            "
          >
            ${copy.security}
          </p>
        </div>
      </div>
    `,
  });
}