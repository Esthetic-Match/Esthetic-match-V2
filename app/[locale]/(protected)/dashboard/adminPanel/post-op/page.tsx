import { prisma } from "@/lib/database/prisma";
import {
  requirePostOpAdmin,
} from "@/lib/post-op/authorization";

import PostOpAdminClient from "@/components/dashboard/admin/post-op/PostOpAdminClient";

export default async function AdminPostOpPage() {
  await requirePostOpAdmin();

  const procedures =
    await prisma.procedure.findMany({
      where: {
        isActive: true,
      },

      select: {
        id: true,

        translations: {
          where: {
            localeCode: {
              in: ["en", "fr"],
            },
          },

          select: {
            localeCode: true,
            name: true,
          },
        },

        postOpTemplates: {
          where: {
            scope: "DEFAULT",
            doctorProfileId: null,

            localeCode: {
              in: ["en", "fr"],
            },
          },

          select: {
            id: true,
            localeCode: true,
            title: true,
            version: true,
            isActive: true,
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const data = procedures.map(
    (procedure) => ({
      id: procedure.id,

      names: {
        en:
          procedure.translations.find(
            (item) =>
              item.localeCode === "en",
          )?.name ?? "Unnamed procedure",

        fr:
          procedure.translations.find(
            (item) =>
              item.localeCode === "fr",
          )?.name ??
          procedure.translations.find(
            (item) =>
              item.localeCode === "en",
          )?.name ??
          "Unnamed procedure",
      },

      templates: {
        en:
          procedure.postOpTemplates.find(
            (item) =>
              item.localeCode === "en",
          ) ?? null,

        fr:
          procedure.postOpTemplates.find(
            (item) =>
              item.localeCode === "fr",
          ) ?? null,
      },
    }),
  );

  return (
    <PostOpAdminClient
      initialProcedures={data}
    />
  );
}