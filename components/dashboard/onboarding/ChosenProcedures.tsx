"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Procedure } from "@/app/[locale]/(public)/sign-up/types";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

type chosenProceduresProps = {
  chosenProcedures: Procedure[];
  onRemoveProcedure: (procedureId: string) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function ChosenProcedures({
  chosenProcedures,
  onRemoveProcedure,
  onDeselectAllProcedures,
}: chosenProceduresProps) {
  const t = useTranslations("onboarding.procedure");
  const categoriesT = useTranslations("categoriesName");
  const subcategoriesT = useTranslations("subcategoriesName");
  const proceduresT = useTranslations("proceduresName");

const groupedProcedures = DoctorCatalog.categories
  .map((category) => ({
    categoryTitle: category.category,
    subcategories: category.subcategories
      .map((subcategory) => ({
        subcategoryTitle: subcategory.subcategory,
        procedures: subcategory.procedures.filter((procedure) =>
          chosenProcedures.some((p) => p.id === procedure.id)
        ),
      }))
      .filter((subcategory) => subcategory.procedures.length > 0),
  }))
  .filter((category) => category.subcategories.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onDeselectAllProcedures(chosenProcedures.map((p) => p.id))}
          className="rounded-full border border-red-500/20 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
        >
          {t("deselectAll")}
        </button>
      </div>

      {chosenProcedures.length > 0 ? (
        <div className="space-y-5">
          {groupedProcedures.map((category) => (
            <div key={category.categoryTitle} className="space-y-3">
              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold uppercase text-[#CEB591]">
                  {categoriesT(category.categoryTitle)}
                </h3>
                <div className="mt-4 h-px w-16 bg-[#d8bd8d]" />
              </div>
          
              {/* Subcategories */}
              <div className="space-y-4">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.subcategoryTitle} className="space-y-2">
                    <h4 className="text-xs font-medium tracking-wide text-[#283C5D]/60">
                      {subcategoriesT(subcategory.subcategoryTitle)}
                    </h4>
                    
                    <div className="flex flex-wrap gap-2 my-6">
                      {subcategory.procedures.map((procedure) => (
                        <button
                          key={procedure.id}
                          type="button"
                          onClick={() => onRemoveProcedure(procedure.id)}
                          className="group flex items-center gap-2 rounded-full border border-[#2563EB]/15 bg-[#EFF6FF]/60 px-3 py-1.5 text-sm font-medium text-[#283C5D] transition hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
                        >
                          <span>{proceduresT(procedure.id)}</span>
                      
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
        <p className="text-xs text-[#283C5D]/40">
          {t("empty")}
        </p>
      )}
    </div>
  );
}