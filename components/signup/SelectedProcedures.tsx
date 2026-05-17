"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Procedure } from "@/app/[locale]/sign-up/types";

type SelectedProceduresProps = {
  selectedProcedures: Procedure[];
  onRemoveProcedure: (procedureId: string) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function SelectedProcedures({
  selectedProcedures,
  onRemoveProcedure,
  onDeselectAllProcedures,
}: SelectedProceduresProps) {
  const t = useTranslations("signUp.procedure");

  function getProcedureLabel(name: string) {
    return t.has(name) ? t(name) : name;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onDeselectAllProcedures(selectedProcedures.map((p) => p.id))}
          className="rounded-full border border-red-500/20 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
        >
          {t("deselectAll")}
        </button>
      </div>

      {selectedProcedures.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedProcedures.map((procedure) => {
            const label = getProcedureLabel(procedure.name);

            return (
              <button
                key={procedure.id}
                type="button"
                onClick={() => onRemoveProcedure(procedure.id)}
                className="group flex items-center gap-2 rounded-full border border-[#2563EB]/15 bg-[#EFF6FF]/60 px-3 py-1.5 text-sm font-medium text-[#283C5D] transition hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
              >
                <span>{label}</span>

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#283C5D]/50 transition group-hover:text-red-600">
                  <X size={11} strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[#283C5D]/40">
          {t("empty")}
        </p>
      )}
    </div>
  );
}