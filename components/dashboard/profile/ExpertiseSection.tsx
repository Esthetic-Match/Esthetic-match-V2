import { Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";

import { DoctorCatalog } from "@/lib/doctorCatalogue";
import {
  ExpertiseTabs,
  type ExpertiseCategoryGroup,
  type ExpertiseProcedure,
  type ExpertiseSubcategoryGroup,
} from "./UI/ExpertiseTabs";

type ExpertiseSectionProps = {
  procedureIds: string[];
  subcategoryIds?: string[];
};

export default function ExpertiseSection({
  procedureIds,
  subcategoryIds = [],
}: ExpertiseSectionProps) {
  const t = useTranslations("dashboard.expertise");

  const categoriesT = useTranslations("categoriesName");
  const proceduresT = useTranslations("proceduresName");
  const subcategoryT = useTranslations("subcategoriesName");

  const selectedProcedureIds = procedureIds ?? [];
  const selectedSubcategoryIds = subcategoryIds ?? [];

  const groupedProceduresByCategory: ExpertiseCategoryGroup[] =
    DoctorCatalog.categories
      .map((category): ExpertiseCategoryGroup => {
        const subcategories: ExpertiseSubcategoryGroup[] =
          category.subcategories
            .map((subcategory): ExpertiseSubcategoryGroup => {
              const procedures: ExpertiseProcedure[] =
                subcategory.procedures
                  .filter((procedure): boolean =>
                    selectedProcedureIds.includes(procedure.id)
                  )
                  .map((procedure): ExpertiseProcedure => ({
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
      .filter((category): boolean => category.subcategories.length > 0);

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section className="mt-6 rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
        <div className="mb-7 flex items-center gap-3">
          <Sparkle size={20} className="text-[#d8bd8d]" />

          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-[#283C5D]">
            {t("title")}
          </h2>
        </div>

        <ExpertiseTabs
          categories={groupedProceduresByCategory}
          ariaLabel={t("title")}
          noProceduresLabel={t("noProcedures")}
        />
      </section>
    </div>
  );
}