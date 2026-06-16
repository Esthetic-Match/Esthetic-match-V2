"use client";

import { X } from "lucide-react";
import type { Category } from "@/app/[locale]/(public)/sign-up/types";
import { useTranslations } from "next-intl";

type ProcedureSelectionModalProps = {
  activeCategory: Category | null;
  selectedProcedures: string[];
  onToggleProcedure: (id: string) => void;
  onClose: () => void;
  onSelectAllProcedures: (procedureIds: string[]) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function ProcedureSelectionModal({
  activeCategory,
  selectedProcedures,
  onToggleProcedure,
  onClose,
  onSelectAllProcedures,
  onDeselectAllProcedures,
}: ProcedureSelectionModalProps) {
  const t = useTranslations("onboarding.procedure");
  const subCategoryT = useTranslations("subcategoriesName");
  const proceduresT = useTranslations("proceduresName");

  if (!activeCategory) return null;

  const visibleProcedureIds = activeCategory.subcategories.flatMap(
    (subcategory) => subcategory.procedures.map((procedure) => procedure.id)
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-black/40">
              {t("selectProcedures")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 text-gray-400 transition hover:bg-gray-600 hover:text-white active:scale-[0.98]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 flex justify-start gap-2">
          <button
            type="button"
            onClick={() => onSelectAllProcedures(visibleProcedureIds)}
            className="rounded-full border border-[#2563EB]/20 bg-[#EFF6FF]/60 px-3 py-1.5 text-xs font-medium text-[#283C5D] transition hover:bg-[#EFF6FF] active:scale-[0.98]"
          >
            {t("select all")}
          </button>

          <button
            type="button"
            onClick={() => onDeselectAllProcedures(visibleProcedureIds)}
            className="rounded-full border border-red-500/20 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 active:scale-[0.98]"
          >
            {t("delete all")}
          </button>
        </div>

        <div className="space-y-5">
          {activeCategory.subcategories.map((subcategory) => (
            <div key={subcategory.subcategory} className="space-y-2">
              <div className="my-4 h-px w-full bg-gray-300" />

              <p className="text-md font-semibold text-black">
                {subCategoryT(subcategory.subcategory)}
              </p>

              <div className="flex flex-wrap gap-2">
                {subcategory.procedures.map((procedure) => {
                  const selected = selectedProcedures.includes(procedure.id);

                  return (
                    <button
                      key={procedure.id}
                      type="button"
                      onClick={() => onToggleProcedure(procedure.id)}
                      className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition active:scale-[0.98] ${
                        selected
                          ? "border-[#283C5D] bg-[#283C5D] text-white"
                          : "border-gray-300 bg-white text-black shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      {proceduresT(procedure.id)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-full bg-[#283C5D] px-4 py-3 text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            {t("done")}
          </button>
        </div>
      </div>
    </div>
  );
}