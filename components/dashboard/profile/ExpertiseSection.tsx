import { Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";

import { DoctorCatalog } from "@/lib/doctorCatalogue";

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

  const groupedProceduresByCategory = DoctorCatalog.categories
    .map((category) => ({
      categoryId: category.category,

      subcategories: category.subcategories
        .map((subcategory) => ({
          subcategoryId: subcategory.subcategory,

          procedures: subcategory.procedures.filter((procedure) =>
            selectedProcedureIds.includes(procedure.id)
          ),
        }))
        .filter(
          (subcategory) =>
            selectedSubcategoryIds.includes(
              subcategory.subcategoryId
            ) || subcategory.procedures.length > 0
        ),
    }))
    .filter((category) => category.subcategories.length > 0);

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section className="mt-6 rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
        <div className="mb-7 flex items-center gap-3">
          <Sparkle size={20} className="text-[#d8bd8d]" />

          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-[#283C5D]">
            {t("title")}
          </h2>
        </div>

        {groupedProceduresByCategory.length > 0 ? (
          <div className="space-y-8">
            {groupedProceduresByCategory.map((category) => (
              <div key={category.categoryId}>
                <div className="mb-4 flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-[#d8bd8d]" />

                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]">
                    {categoriesT(category.categoryId)}
                  </h3>
                  <div className="h-px w-8 bg-[#d8bd8d]" />
                </div>

                <div className="space-y-5 text-center">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.subcategoryId}>
                      <h4 className="mb-3 text-sm font-semibold text-[#283C5D]/80">
                        {subcategoryT(
                          subcategory.subcategoryId
                        )}
                      </h4>

                      {subcategory.procedures.length > 0 ? (
                        <div className="flex flex-wrap gap-3 justify-center">
                          {subcategory.procedures.map(
                            (procedure) => (
                              <span
                                key={procedure.id}
                                className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm"
                              >
                                {proceduresT(procedure.id)}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[#283C5D]/45">
                          {t("noProcedures")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#283C5D]/55">
            {t("noProcedures")}
          </p>
        )}
      </section>
    </div>
  );
}