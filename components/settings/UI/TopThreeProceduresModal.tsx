"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLabel } from "@/utils/dashboard/helper";

type TopThreeProceduresModalProps = {
  open: boolean;
  selectedProcedureIds: string[];
  selectedTopThree: string[];
  onClose: () => void;
  onSaved?: (updatedTopThree: string[]) => void;
};

export default function TopThreeProceduresModal({
  open,
  selectedProcedureIds,
  selectedTopThree,
  onClose,
  onSaved,
}: TopThreeProceduresModalProps) {
  const router = useRouter();

  const [localTopThree, setLocalTopThree] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalTopThree(selectedTopThree);
    }
  }, [open, selectedTopThree]);

  function toggleProcedure(procedureId: string) {
    setLocalTopThree((prev) => {
      const isSelected = prev.includes(procedureId);

      if (isSelected) {
        return prev.filter((item) => item !== procedureId);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, procedureId];
    });
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      const res = await fetch("/api/doctor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topThree: localTopThree,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not update top three procedures.");
      }

      onSaved?.(localTopThree);
      router.refresh();
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
              Doctor Profile
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
              Edit Top 3 Procedures
            </h2>

            <p className="mt-1 text-sm text-[#283C5D]/60">
              Choose up to 3 procedures from your selected procedures.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto bg-[#FAF9F7] p-6">
          {selectedProcedureIds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-[#283C5D]/60">
              You need to select procedures before choosing your top three.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {selectedProcedureIds.map((procedureId) => {
                const isSelected = localTopThree.includes(procedureId);
                const isDisabled = !isSelected && localTopThree.length >= 3;

                return (
                  <button
                    key={procedureId}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleProcedure(procedureId)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.97]",
                      isSelected
                        ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-[#A74848]"
                        : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white",
                      isDisabled &&
                        "cursor-not-allowed opacity-40 hover:border-black/10 hover:bg-white hover:text-[#283C5D]"
                    )}
                  >
                    {formatLabel(procedureId)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/10 px-6 py-5">
          <p className="text-xs font-medium text-[#283C5D]/60">
            {localTopThree.length}/3 selected
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-black/5 active:scale-[0.97]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-[#d8bd8d] px-7 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}