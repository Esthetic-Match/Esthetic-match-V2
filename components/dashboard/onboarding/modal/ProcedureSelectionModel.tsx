"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProceduresSearchBar } from "@/components/UI/ProceduresSearchBar";
import type {
  OnboardingCategory,
  OnboardingProcedure,
} from "@/components/public/signup/util/utils";

type ProcedureSelectionModalProps = {
  activeCategory: OnboardingCategory;
  selectedProcedures: string[];
  onToggleProcedure: (id: string) => void;
  onClose: () => void;
  onSelectAllProcedures: (procedureIds: string[]) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

type FilteredSubcategory = {
  id: string;
  name: string;
  procedures: OnboardingProcedure[];
};

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase();
}

export default function ProcedureSelectionModal({
  activeCategory,
  selectedProcedures,
  onToggleProcedure,
  onClose,
  onSelectAllProcedures,
  onDeselectAllProcedures,
}: ProcedureSelectionModalProps) {
  const t = useTranslations("onboarding.procedure");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubcategories = useMemo<FilteredSubcategory[]>(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    return activeCategory.subcategories
      .map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        procedures: subcategory.procedures.filter((procedure) => {
          if (!normalizedQuery) {
            return true;
          }

          return normalizeSearchValue(procedure.name).includes(normalizedQuery);
        }),
      }))
      .filter((subcategory) => subcategory.procedures.length > 0);
  }, [activeCategory, searchQuery]);

  const visibleProcedureIds = useMemo(() => {
    return Array.from(
      new Set(
        filteredSubcategories.flatMap((subcategory) =>
          subcategory.procedures.map((procedure) => procedure.id),
        ),
      ),
    );
  }, [filteredSubcategories]);

  const hasVisibleProcedures = visibleProcedureIds.length > 0;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="procedure-selection-title"
    >
      <div className="esthetic-scrollbar max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p
              id="procedure-selection-title"
              className="text-sm text-black/40"
            >
              {t("selectProcedures")}
            </p>

            <h3 className="mt-1 text-lg font-semibold text-[#283C5D]">
              {activeCategory.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close procedure selector"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 text-gray-400 transition hover:bg-gray-600 hover:text-white active:scale-[0.98]"
          >
            <X size={16} />
          </button>
        </div>

        <ProceduresSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search procedures"
          ariaLabel="Search procedures"
          className="mb-4"
        />

        <div className="mb-4 flex justify-start gap-2">
          <button
            type="button"
            onClick={() => onSelectAllProcedures(visibleProcedureIds)}
            disabled={!hasVisibleProcedures}
            className="rounded-full border border-[#2563EB]/20 bg-[#EFF6FF]/60 px-3 py-1.5 text-xs font-medium text-[#283C5D] transition hover:bg-[#EFF6FF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("select all")}
          </button>

          <button
            type="button"
            onClick={() => onDeselectAllProcedures(visibleProcedureIds)}
            disabled={!hasVisibleProcedures}
            className="rounded-full border border-red-500/20 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("delete all")}
          </button>
        </div>

        {hasVisibleProcedures ? (
          <div className="space-y-5">
            {filteredSubcategories.map((subcategory) => (
              <div key={subcategory.id} className="space-y-2">
                <div className="my-4 h-px w-full bg-gray-300" />

                <p className="text-md font-semibold text-black">
                  {subcategory.name}
                </p>

                <div className="flex flex-wrap gap-2">
                  {subcategory.procedures.map((procedure) => {
                    const selected = selectedProcedures.includes(procedure.id);

                    return (
                      <button
                        key={`${subcategory.id}-${procedure.id}`}
                        type="button"
                        onClick={() => onToggleProcedure(procedure.id)}
                        className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition active:scale-[0.98] ${
                          selected
                            ? "border-[#283C5D] bg-[#283C5D] text-white"
                            : "border-gray-300 bg-white text-black shadow-md hover:-translate-y-0.5"
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
        ) : (
          <div className="rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] px-5 py-8 text-center">
            <p className="text-sm font-medium text-[#283C5D]/55">
              No procedures found.
            </p>
          </div>
        )}

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
