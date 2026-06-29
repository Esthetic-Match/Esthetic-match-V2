import { Sparkle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { DoctorCatalog } from "@/lib/doctorCatalogue";
import {
  PublicExpertiseTabs,
  type PublicExpertiseCategoryGroup,
  type PublicExpertiseProcedure,
  type PublicExpertiseSubcategoryGroup,
} from "./PublicExpertiseTabs";

type PublicExpertiseSectionProps = {
  doctorProfile: {
    procedureIds: string[];
    subcategoryIds?: string[];
  };
};

export default async function PublicExpertiseSection({
  doctorProfile,
}: PublicExpertiseSectionProps) {
  const t = await getTranslations("doctor.doctor.profile");

  const categoriesT = await getTranslations("categoriesName");
  const proceduresT = await getTranslations("proceduresName");
  const subcategoryT = await getTranslations("subcategoriesName");

  const selectedProcedureIds = doctorProfile.procedureIds ?? [];
  const selectedSubcategoryIds = doctorProfile.subcategoryIds ?? [];

  const groupedProceduresByCategory: PublicExpertiseCategoryGroup[] =
    DoctorCatalog.categories
      .map((category): PublicExpertiseCategoryGroup => {
        const subcategories: PublicExpertiseSubcategoryGroup[] =
          category.subcategories
            .map((subcategory): PublicExpertiseSubcategoryGroup => {
              const procedures: PublicExpertiseProcedure[] =
                subcategory.procedures
                  .filter((procedure): boolean =>
                    selectedProcedureIds.includes(procedure.id)
                  )
                  .map((procedure): PublicExpertiseProcedure => ({
                    id: procedure.id,
                    label: proceduresT(procedure.id),
                  }));

              return {
                subcategoryId: subcategory.subcategory,
                label: subcategoryT(subcategory.subcategory),
                procedures,
              };
            })
            .filter(
              (subcategory): boolean =>
                selectedSubcategoryIds.includes(subcategory.subcategoryId) ||
                subcategory.procedures.length > 0
            );

        return {
          categoryId: category.category,
          label: categoriesT(category.category),
          subcategories,
        };
      })
      .filter(
        (category): boolean => category.subcategories.length > 0
      );

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section
        aria-labelledby="doctor-expertise-title"
        className="mt-6 rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
      >
        <div className="mb-7 flex items-center gap-3">
          <Sparkle size={20} className="text-[#d8bd8d]" />

          <h2
            id="doctor-expertise-title"
            className="text-sm font-bold uppercase tracking-[0.22em] text-[#283C5D]"
          >
            {t("expertise.title")}
          </h2>
        </div>

        <PublicExpertiseTabs
          categories={groupedProceduresByCategory}
          ariaLabel={t("expertise.aria")}
          noProceduresLabel={t("expertise.noProcedures")}
        />
      </section>
    </div>
  );
}