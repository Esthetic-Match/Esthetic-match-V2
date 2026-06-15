"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { X } from "lucide-react";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { cn } from "@/lib/utils/utils";
import { useTranslations } from "next-intl";

type SpecialtyModalProps = {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSaved?: (updatedIds: string[]) => void;
};

function toId(value: string) {
  return value.toLowerCase().trim().replaceAll(" ", "_");
}

export default function SpecialtyModal({
  open,
  selectedIds,
  onClose,
  onSaved,
}: SpecialtyModalProps) {
  const t = useTranslations("settings");
  const specialityT = useTranslations("specialitiesName");
  const router = useRouter();

  const [localSelectedIds, setLocalSelectedIds] =
    useState<string[]>(selectedIds);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const [previousSelectedIds, setPreviousSelectedIds] = useState(selectedIds);

  if (open && (!wasOpen || previousSelectedIds !== selectedIds)) {
    setLocalSelectedIds(selectedIds);
    setPreviousSelectedIds(selectedIds);
    setWasOpen(true);
  }

  if (!open && wasOpen) {
    setWasOpen(false);
  }

  const items = useMemo(() => {
    return DoctorCatalog.specialties.items.map((item) => ({
      id: toId(item),
      label: item,
    }));
  }, []);

  function toggleItem(id: string) {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
          specialtyIds: localSelectedIds,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not update doctor profile.");
      }

      onSaved?.(localSelectedIds);
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
              {t("specialtiesModal.profileLabel")}
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
              {t("specialtiesModal.title")}
            </h2>
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
          <div className="flex flex-wrap gap-3">
            {items.map((item) => {
              const isSelected = localSelectedIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.97]",
                    isSelected
                      ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-[#A74848]"
                      : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                  )}
                >
                  {specialityT(item.label)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-black/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-black/5 active:scale-[0.97]"
          >
            {t("specialtiesModal.cancel")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-[#d8bd8d] px-7 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97] disabled:opacity-50"
          >
            {isSaving
              ? t("specialtiesModal.saving")
              : t("specialtiesModal.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}