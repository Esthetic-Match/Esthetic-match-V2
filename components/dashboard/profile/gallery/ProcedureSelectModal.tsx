"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

type ProcedureSelectModalProps = {
  isOpen: boolean;
  selectedProcedure: string;
  procedureIds?: string[] | null;
  onClose: () => void;
  onSelect: (procedure: string) => void;
};

function formatProcedureLabel(procedure: string) {
  return procedure
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProcedureSelectModal({
  isOpen,
  selectedProcedure,
  procedureIds,
  onClose,
  onSelect,
}: ProcedureSelectModalProps) {
  const t = useTranslations("dashboard.editGallery.procedureModal");
  const tProcedures = useTranslations("proceduresName");
  if (!isOpen) return null;

  function handleProcedureClick(procedure: string) {
    onSelect(selectedProcedure === procedure ? "" : procedure);
    onClose();
  }

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283C5D]/40 p-4 backdrop-blur-sm">
    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#283C5D]/10 bg-white p-6 shadow-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#283C5D]">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
            {t("description")}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF9F7] text-[#283C5D]/60 transition hover:text-[#283C5D] active:scale-[0.98]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {procedureIds && procedureIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {procedureIds.map((procedure) => {
            const isSelected = selectedProcedure === procedure;

            return (
              <button
                key={procedure}
                type="button"
                onClick={() => handleProcedureClick(procedure)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-[0.98]",
                  isSelected
                    ? "border-[#283C5D] bg-[#283C5D] text-white"
                    : "border-[#283C5D]/10 bg-[#FAF9F7] text-[#283C5D] hover:border-[#d8bd8d]",
                ].join(" ")}
              >
                {tProcedures(procedure)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#283C5D]/15 bg-[#FAF9F7] p-6 text-center">
          <p className="text-sm font-semibold text-[#283C5D]">
            {t("emptyTitle")}
          </p>

          <p className="mt-2 text-sm text-[#283C5D]/60">
            {t("emptyDescription")}
          </p>
        </div>
      )}
    </div>
  </div>
);
}

export { formatProcedureLabel };