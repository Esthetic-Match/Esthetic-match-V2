import "server-only";

import type {
  Prisma,
} from "@/generated/prisma/client";

export async function incrementPostOpTemplateVersion(
  tx: Prisma.TransactionClient,
  templateId: string,
) {
  return tx.postOpTemplate.update({
    where: {
      id: templateId,
    },

    data: {
      version: {
        increment: 1,
      },
    },

    select: {
      id: true,
      version: true,
    },
  });
}