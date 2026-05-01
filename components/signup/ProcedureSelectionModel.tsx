"use client";

import { X } from "lucide-react";
import type { Category } from "@/app/[locale]/sign-up/types";
import { useTranslations } from "next-intl";

type ProcedureSelectionModalProps = {
  activeCategory: Category | null;
  selectedServices: string[];
  onToggleService: (id: string) => void;
  onClose: () => void;
};

export default function ProcedureSelectionModal({
  activeCategory,
  selectedServices,
  onToggleService,
  onClose,
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

        <div className="space-y-5">
          {activeCategory.subcategories.map((subcategory) => (
            <div key={subcategory.subcategory} className="space-y-2">
              <p className="text-sm font-semibold text-black">
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
                          : "border-black/10 bg-white text-black hover:border-black/30"
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
}