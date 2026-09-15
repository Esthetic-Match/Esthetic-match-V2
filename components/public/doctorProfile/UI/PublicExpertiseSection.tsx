import { Sparkle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  PublicExpertiseTabs,
  type PublicExpertiseCategoryGroup,
} from "./PublicExpertiseTabs";

type PublicDoctorProcedure = {
  procedureId: string;
  name: string;
  price: string | null;
  description: string | null;
};

type PublicExpertiseSectionProps = {
  doctorProfile: {
    currency?: string | null;

    expertise?: PublicExpertiseCategoryGroup[];

    procedures?: PublicDoctorProcedure[];
  };
};

export default async function PublicExpertiseSection({
  doctorProfile,
}: PublicExpertiseSectionProps) {
  const t = await getTranslations(
    "doctor.doctor.profile"
  );

  const expertise =
    doctorProfile.expertise ?? [];

  const doctorProcedures =
    doctorProfile.procedures ?? [];

  /*
   * Add price + description to every
   * procedure inside the expertise tree.
   *
   * The public route has already resolved:
   *
   * price:
   * doctor override -> default price
   *
   * description:
   * doctor override -> default description
   */
  const enrichedExpertise =
    expertise.map((category) => ({
      ...category,

      subcategories:
        category.subcategories.map(
          (subcategory) => ({
            ...subcategory,

            procedures:
              subcategory.procedures.map(
                (procedure) => {
                  const doctorProcedure =
                    doctorProcedures.find(
                      (item) =>
                        item.procedureId ===
                        procedure.id
                    );

                  return {
                    ...procedure,

                    /*
                     * Prefer the name already
                     * supplied by expertise.
                     * Fall back to the normalized
                     * procedure name from the route.
                     */
                    label:
                      procedure.label ||
                      doctorProcedure?.name ||
                      procedure.id
                        .replaceAll(
                          "_",
                          " "
                        )
                        .trim(),

                    price:
                      doctorProcedure?.price ??
                      null,

                    description:
                      doctorProcedure?.description ??
                      null,

                    currency:
                      doctorProfile.currency ??
                      "eur",
                  };
                }
              ),
          })
        ),
    }));

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section
        aria-labelledby="doctor-expertise-title"
        className="mt-6 rounded-3xl border border-gray-300/10 bg-[#283C5D] p-6 shadow-lg md:p-8"
      >
        <div className="mb-7 flex items-center gap-3">
          <Sparkle
            size={20}
            className="shrink-0 text-[#d8bd8d]"
          />

          <h2
            id="doctor-expertise-title"
            className="text-sm font-bold uppercase tracking-[0.22em] text-white"
          >
            {t("expertise.title")}
          </h2>
        </div>

        <PublicExpertiseTabs
          categories={
            enrichedExpertise
          }
          ariaLabel={t(
            "expertise.aria"
          )}
          noProceduresLabel={t(
            "expertise.noProcedures"
          )}
        />
      </section>
    </div>
  );
}