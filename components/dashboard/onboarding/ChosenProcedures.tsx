"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  getCategoriesWithSelectedProcedures,
  type OnboardingCategory,
} from "@/components/public/signup/util/utils";

type ChosenProceduresProps = {
  categories: readonly OnboardingCategory[];
  selectedProcedureIds: string[];
  onRemoveProcedure: (procedureId: string) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function ChosenProcedures({
  categories,
  selectedProcedureIds,
  onRemoveProcedure,
  onDeselectAllProcedures,
}: ChosenProceduresProps) {
  const t = useTranslations("onboarding.procedure");
  const groupedProcedures = getCategoriesWithSelectedProcedures(
    categories,
    selectedProcedureIds,
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onDeselectAllProcedures(selectedProcedureIds)}
          disabled={selectedProcedureIds.length === 0}
          className="rounded-full border border-red-500/20 px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("deselectAll")}
        </button>
      </div>

      {groupedProcedures.length > 0 ? (
        <div className="space-y-5">
          {groupedProcedures.map((category) => (
            <div key={category.id} className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold uppercase text-[#CEB591]">
                  {category.name}
                </h3>
                <div className="mt-4 h-px w-16 bg-[#d8bd8d]" />
              </div>

              <div className="space-y-4">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="space-y-2">
                    <h4 className="text-xs font-medium tracking-wide text-[#283C5D]/60">
                      {subcategory.name}
                    </h4>

                    <div className="my-6 flex flex-wrap gap-2">
                      {subcategory.procedures.map((procedure) => (
                        <button
                          key={procedure.id}
                          type="button"
                          onClick={() => onRemoveProcedure(procedure.id)}
                          className="group flex items-center gap-2 rounded-full border border-[#2563EB]/15 bg-[#EFF6FF]/60 px-3 py-1.5 text-sm font-medium text-[#283C5D] transition hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
                        >
                          <span>{procedure.name}</span>

                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#283C5D]/50 transition group-hover:text-red-600">
                            <X size={11} strokeWidth={3} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#283C5D]/40">{t("empty")}</p>
      )}
    </div>
  );
}