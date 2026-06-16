"use client";

import { useTranslations } from "next-intl";

import { DoctorCatalog } from "@/lib/doctorCatalogue"
import type { Procedure } from "@/app/[locale]/(public)/sign-up/types";

type TopProceduresSelectorProps = {
  selectedProcedures: string[];
  selectedTopProcedures: string[];
  onToggleTopProcedure: (procedureId: string) => void;
};

export default function TopProceduresSelector({
  selectedProcedures,
  selectedTopProcedures,
  onToggleTopProcedure,
}: TopProceduresSelectorProps) {
  const t = useTranslations("onboarding.topProcedures");
  const proceduresT = useTranslations("proceduresName");
  const categoriesT = useTranslations("categoriesName");
  const subcategoriesT = useTranslations("subcategoriesName");

  const reachedLimit = selectedTopProcedures.length >= 3;

  const groupedProcedures = DoctorCatalog.categories
    .map((category) => ({
      categoryTitle: category.category,

      subcategories: category.subcategories
        .map((subcategory) => ({
          subcategoryTitle: subcategory.subcategory,

          procedures: subcategory.procedures.filter(
            (procedure: Procedure) =>
              selectedProcedures.includes(procedure.id)
          ),
        }))
        .filter((subcategory) => subcategory.procedures.length > 0),
    }))
    .filter((category) => category.subcategories.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#283C5D]">
          {t("title")}
        </h2>

        <p className="mt-1 text-sm text-[#283C5D]/60">
          {t("description")}
        </p>
      </div>

      <div className="space-y-8">
        {groupedProcedures.map((category) => (
          <div
            key={category.categoryTitle}
            className="space-y-4"
          >
            {/* CATEGORY */}
            <div>
              <h3 className="text-base font-semibold text-[#283C5D]">
                {categoriesT.has(category.categoryTitle)
                  ? categoriesT(category.categoryTitle)
                  : category.categoryTitle}
              </h3>
            </div>

            {/* SUBCATEGORIES */}
            <div className="space-y-5">
              {category.subcategories.map((subcategory) => (
                <div
                  key={subcategory.subcategoryTitle}
                  className="space-y-3"
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#283C5D]/50">
                    {subcategoriesT.has(subcategory.subcategoryTitle)
                      ? subcategoriesT(subcategory.subcategoryTitle)
                      : subcategory.subcategoryTitle}
                  </h4>

                  {/* PROCEDURES */}
                  <div className="flex flex-wrap gap-2">
                    {subcategory.procedures.map(
                      (procedure: Procedure) => {
                        const isSelected =
                          selectedTopProcedures.includes(
                            procedure.id
                          );

                        const disabled =
                          !isSelected && reachedLimit;

                        return (
                          <button
                            key={procedure.id}
                            type="button"
                            onClick={() =>
                              onToggleTopProcedure(
                                procedure.id
                              )
                            }
                            disabled={disabled}
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                              isSelected
                                ? "border-[#283C5D] bg-[#283C5D] text-white"
                                : "border-[#283C5D]/10 bg-white text-[#283C5D] hover:border-[#283C5D]/30"
                            } ${
                              disabled
                                ? "cursor-not-allowed opacity-40"
                                : ""
                            }`}
                          >
                            {proceduresT(procedure.id)}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#283C5D]/50">
        {t("counter", {
          count: selectedTopProcedures.length,
        })}
      </p>
    </div>
  );
}