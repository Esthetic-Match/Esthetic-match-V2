import DoctorPostOpNewClient, {
  type PostOpProcedureOption,
} from "@/components/dashboard/post-op/DoctorPostOpNewClient";

import { prisma } from "@/lib/database/prisma";

import {
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function NewPostOpPage({
  params,
}: Props) {
  const { locale } =
    await params;

  const localeCode =
    locale === "fr"
      ? "fr"
      : "en";

  const {
    doctorProfile,
  } =
    await requirePostOpDoctorActor();

  const doctorProcedures =
    await prisma.doctorProcedure.findMany({
      where: {
        doctorProfileId:
          doctorProfile.id,

        procedure: {
          isActive: true,
        },
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
                    localeCode,
                    "en",
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

  const procedures: PostOpProcedureOption[] =
    doctorProcedures.map(
      (item) => {
        const translated =
          item.procedure.translations.find(
            (translation) =>
              translation.localeCode ===
              localeCode,
          );

        const english =
          item.procedure.translations.find(
            (translation) =>
              translation.localeCode ===
              "en",
          );

        return {
          id:
            item.procedure.id,

          name:
            translated?.name ??
            english?.name ??
            item.procedure.id,
        };
      },
    );

  return (
    <DoctorPostOpNewClient
      procedures={
        procedures
      }
      localeCode={
        localeCode
      }
    />
  );
}