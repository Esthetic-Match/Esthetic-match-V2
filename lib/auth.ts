import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";

function calculateAgeFromDob(dateString: string): number {
  const today = new Date();
  const birthDate = new Date(dateString);

  if (Number.isNaN(birthDate.getTime())) {
    throw new APIError("BAD_REQUEST", {
      message: "Invalid date of birth.",
    });
  }

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
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const role = ctx.body?.role;
      const dateOfBirth = ctx.body?.dateOfBirth;

      if (!role || (role !== "PATIENT" && role !== "DOCTOR")) {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid account type.",
        });
      }

      if (!dateOfBirth || typeof dateOfBirth !== "string") {
        throw new APIError("BAD_REQUEST", {
          message: "Date of birth is required.",
        });
      }

      const age = calculateAgeFromDob(dateOfBirth);

      if (age < 18) {
        throw new APIError("BAD_REQUEST", {
          message: "You must be 18 or older to sign up.",
        });
      }

    }),
  },

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],

  experimental: {
    joins: true,
  },
});