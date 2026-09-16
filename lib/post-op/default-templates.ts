import "server-only";

import { prisma } from "@/lib/database/prisma";

import {
  postOpTemplateSelect,
} from "./selects";

type GetDefaultPostOpTemplateInput = {
  procedureId: string;
  localeCode: string;
  includeInactive?: boolean;
};

export async function getDefaultPostOpTemplate({
  procedureId,
  localeCode,
  includeInactive = false,
}: GetDefaultPostOpTemplateInput) {
  return prisma.postOpTemplate.findFirst({
    where: {
      procedureId,
      localeCode,

      scope: "DEFAULT",
      doctorProfileId: null,

      ...(includeInactive
        ? {}
        : {
            isActive: true,
          }),
    },

    select: postOpTemplateSelect,
  });
}

export function getDefaultPostOpTemplateKey(
  procedureId: string,
  localeCode: string,
) {
  return `default:${procedureId}:${localeCode}`;
}