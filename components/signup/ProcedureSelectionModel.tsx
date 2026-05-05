"use client";

import { X } from "lucide-react";
import type { Category } from "@/app/[locale]/sign-up/types";
import { useTranslations } from "next-intl";

type ProcedureSelectionModalProps = {
  activeCategory: Category | null;
  selectedServices: string[];
  onToggleService: (id: string) => void;
  onClose: () => void;
  onSelectAllProcedures: () => void;
  onDeselectAllProcedures: () => void;
};

export default function ProcedureSelectionModal({
  activeCategory,
  selectedServices,
  onToggleService,
  onClose,
  onSelectAllProcedures,
  onDeselectAllProcedures,
}: ProcedureSelectionModalProps) {
  if (!activeCategory) return null;

  const t = useTranslations("signUp.procedure");

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
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-gray-400 
            transition hover:bg-gray-600 hover:text-white cursor-pointer active:scale-[0.98]"
          >
            <X size={16} />
          </button>
        </div>
           <div className="flex justify-start gap-2 mb-4">
            <button
              type="button"
              onClick={onSelectAllProcedures}
              className="rounded-full border border-[#2563EB]/20 bg-[#EFF6FF]/60 px-3 py-1.5 text-xs font-medium text-[#283C5D] transition hover:bg-[#EFF6FF] active:scale-[0.98]"
            >
              {t("select all")}
            </button>
                    
            <button
              type="button"
              onClick={onDeselectAllProcedures}
              className="rounded-full border border-red-500/20 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 active:scale-[0.98]"
            >
              {t("delete all")}
            </button>
          </div>

        <div className="space-y-5">
          
          {activeCategory.subcategories.map((subcategory) => (
            <div key={subcategory.subcategory} className="space-y-2">
              <div className="h-px w-full bg-gray-300 my-4"/>
              <p className="text-md font-semibold text-black">
                {t(subcategory.subcategory)}
              </p>

              <div className="flex flex-wrap gap-2">
                {subcategory.procedures.map((procedure) => {
                  const selected = selectedServices.includes(procedure.id);

                  return (
                    <button
                      key={procedure.id}
                      type="button"
                      onClick={() => onToggleService(procedure.id)}
                      className={`rounded-full border px-3 py-2 text-sm transition active:scale-[0.98] cursor-pointer ${
                        selected
                          ? "border-[#283C5D] bg-[#283C5D] text-white"
                          : "border-gray-300 shadow-md bg-white text-black hover:-translate-y-0.5"
                      }`}
                    >
                      {t(procedure.name)}
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
            className="w-full rounded-full bg-[#283C5D] px-4 py-3 text-white transition hover:opacity-90 cursor-pointer active:scale-[0.98]"
          >
            {t("done")}
          </button>
        </div>
      </div>
    </div>
  );
}