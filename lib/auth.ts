import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function calculateAgeFromDob(dateString: string): number {
  const today = new Date();
  const birthDate = new Date(dateString);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      role: {
        type: ["PATIENT", "DOCTOR"],
        required: true,
      },
      dateOfBirth: {
        type: "string",
        required: true,
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const role = ctx.body?.role;
      const dateOfBirth = ctx.body?.dateOfBirth;

      if (!role || (role !== "PATIENT" && role !== "DOCTOR")) {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid account type.",
        });
      }

      if (
        role === "PATIENT" &&
        (!dateOfBirth || typeof dateOfBirth !== "string")
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "Date of birth is required.",
        });
      }

      if (role === "PATIENT") {
        const age = calculateAgeFromDob(dateOfBirth);

        if (age < 18) {
          throw new APIError("BAD_REQUEST", {
            message: "You must be 18 or older to sign up.",
          });
        }
      }
    }),
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  sendResetPassword: async ({ user, url }) => {
    await sendEmail({
      to: user.email,
      subject: "Reset your Esthetic Match password",
      html: `
        <div>
          <h1>Reset your password</h1>
          <p>Click the link below to reset your password.</p>
          <a href="${url}">Reset password</a>
        </div>
      `,
    });
  },

  resetPasswordTokenExpiresIn: 3600,
  },

  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 300,

      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification") return;

        await sendEmail({
          to: email,
          subject: "Your Esthetic Match verification code",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h1>Verify your email</h1>
              <p>Welcome to Esthetic Match.</p>
              <p>Your verification code is:</p>

              <div style="
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 8px;
                margin: 24px 0;
              ">
                ${otp}
              </div>

              <p>This code expires in 5 minutes.</p>
            </div>
          `,
        });
      },
    }),
  ],

  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],

  experimental: {
    joins: true,
  },
});