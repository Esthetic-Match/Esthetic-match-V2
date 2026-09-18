import DoctorPostOpTemplatesClient, {
  type DoctorPostOpProcedureItem,
} from "@/components/dashboard/post-op/DoctorPostOpTemplatesClient";

import { prisma } from "@/lib/database/prisma";

import {
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DoctorPostOpTemplatesPage({
  params,
}: Props) {
  const { locale } = await params;

  const {
    doctorProfile,
  } = await requirePostOpDoctorActor();

  const doctorProcedures =
    await prisma.doctorProcedure.findMany({
      where: {
        doctorProfileId:
          doctorProfile.id,
      },

      orderBy: {
        position: "asc",
      },

      select: {
        procedureId: true,

        procedure: {
          select: {
            id: true,

            translations: {
              where: {
                localeCode: {
                  in: [
                    "en",
                    "fr",
                  ],
                },
              },

              select: {
                localeCode: true,
                name: true,
              },
            },
          },
        },
      },
    });

  const procedureIds =
    doctorProcedures.map(
      (item) =>
        item.procedureId,
    );

  const templates =
    procedureIds.length > 0
      ? await prisma.postOpTemplate.findMany(
          {
            where: {
              procedureId: {
                in: procedureIds,
              },

              localeCode: {
                in: [
                  "en",
                  "fr",
                ],
              },

              isActive: true,

              OR: [
                {
                  scope:
                    "DEFAULT",

                  doctorProfileId:
                    null,
                },

                {
                  scope:
                    "DOCTOR",

                  doctorProfileId:
                    doctorProfile.id,
                },
              ],
            },

            select: {
              id: true,

              procedureId: true,

              localeCode: true,

              scope: true,
            },
          },
        )
      : [];

  const procedures: DoctorPostOpProcedureItem[] =
    doctorProcedures.map(
      (item) => {
        const translations =
          item.procedure
            .translations;

        const english =
          translations.find(
            (translation) =>
              translation.localeCode ===
              "en",
          )?.name;

        const french =
          translations.find(
            (translation) =>
              translation.localeCode ===
              "fr",
          )?.name;

        function buildState(
          localeCode:
            | "en"
            | "fr",
        ) {
          const custom =
            templates.find(
              (template) =>
                template.procedureId ===
                  item.procedureId &&
                template.localeCode ===
                  localeCode &&
                template.scope ===
                  "DOCTOR",
            );

          const defaultTemplate =
            templates.find(
              (template) =>
                template.procedureId ===
                  item.procedureId &&
                template.localeCode ===
                  localeCode &&
                template.scope ===
                  "DEFAULT",
            );

          return {
            hasDefault:
              Boolean(
                defaultTemplate,
              ),

            customTemplateId:
              custom?.id ??
              null,
          };
        }

        return {
          id:
            item.procedure.id,

          names: {
            en:
              english ??
              french ??
              item.procedure.id,

            fr:
              french ??
              english ??
              item.procedure.id,
          },

          states: {
            en:
              buildState(
                "en",
              ),

            fr:
              buildState(
                "fr",
              ),
          },
        };
      },
    );

  return (
    <DoctorPostOpTemplatesClient
      initialProcedures={
        procedures
      }
      initialLocale={
        locale === "fr"
          ? "fr"
          : "en"
      }
    />
  );
}