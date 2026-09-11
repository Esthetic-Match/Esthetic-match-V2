"use client";

import { useTranslations } from "next-intl";

import {
  getCategoriesWithSelectedProcedures,
  type OnboardingCategory,
} from "@/components/public/signup/util/utils";

type TopProceduresSelectorProps = {
  visibleCategories: readonly OnboardingCategory[];
  selectedProcedures: string[];
  selectedTopProcedures: string[];
  onToggleTopProcedure: (procedureId: string) => void;
};

export default function TopProceduresSelector({
  visibleCategories,
  selectedProcedures,
  selectedTopProcedures,
  onToggleTopProcedure,
}: TopProceduresSelectorProps) {
  const t = useTranslations("onboarding.topProcedures");
  const reachedLimit = selectedTopProcedures.length >= 3;
  const groupedProcedures = getCategoriesWithSelectedProcedures(
    visibleCategories,
    selectedProcedures,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#283C5D]">{t("title")}</h2>

        <p className="mt-1 text-sm text-[#283C5D]/60">
          {t("description")}
        </p>
      </div>

      {groupedProcedures.length > 0 ? (
        <div className="space-y-8">
          {groupedProcedures.map((category) => (
            <div key={category.id} className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#283C5D]">
                  {category.name}
                </h3>
              </div>

              <div className="space-y-5">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[#283C5D]/50">
                      {subcategory.name}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {subcategory.procedures.map((procedure) => {
                        const isSelected = selectedTopProcedures.includes(
                          procedure.id,
                        );
                        const disabled = !isSelected && reachedLimit;

                        return (
                          <button
                            key={procedure.id}
                            type="button"
                            onClick={() =>
                              onToggleTopProcedure(procedure.id)
                            }
                            disabled={disabled}
                            className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                              isSelected
                                ? "border-[#283C5D] bg-[#283C5D] text-white"
                                : "border-[#283C5D]/10 bg-white text-[#283C5D] hover:border-[#283C5D]/30"
                            } ${
                              disabled
                                ? "cursor-not-allowed opacity-40"
                                : ""
                            }`}
                          >
                            {procedure.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-black/10 bg-white p-4 text-center text-sm text-black/40">
          No selected procedures are available.
        </p>
      )}

      <p className="text-xs text-[#283C5D]/50">
        {t("counter", {
          count: selectedTopProcedures.length,
        })}
      </p>
    </div>
  );
}