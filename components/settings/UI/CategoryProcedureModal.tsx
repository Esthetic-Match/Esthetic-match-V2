"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { X } from "lucide-react";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { cn } from "@/lib/utils/utils";
import {getVisibleCategories} from "@/components/signup/util/utils"
import { useTranslations } from "next-intl";

type CategoryProcedureModalProps = {
  open: boolean;
  specialtyIds: string[];
  selectedCategoryIds: string[];
  selectedProcedureIds: string[];
  onClose: () => void;
  onSaved?: (data: {
    subcategoryIds: string[];
    procedureIds: string[];
  }) => void;
};

type CategoryItem = {
  readonly category: string;

  readonly subcategories: readonly {
    readonly subcategory: string;

    readonly procedures: readonly {
      readonly name: string;
      readonly id: string;
    }[];
  }[];
};

function getVisibleCategoriesFallback(selectedSpecialties: string[]) {
  return getVisibleCategories(selectedSpecialties);
}

export default function CategoryProcedureModal({
  open,
  specialtyIds,
  selectedCategoryIds,
  selectedProcedureIds,
  onClose,
  onSaved,
}: CategoryProcedureModalProps) {
  const t = useTranslations("settings");
  const procedureT = useTranslations("proceduresName");
  const categoryT = useTranslations("categoriesName");
  const subcategoryT = useTranslations("subcategoriesName");
  const router = useRouter();

const [localCategoryIds, setLocalCategoryIds] =
  useState<string[]>(selectedCategoryIds);
const [localProcedureIds, setLocalProcedureIds] =
  useState<string[]>(selectedProcedureIds);
const [isSaving, setIsSaving] = useState(false);

const [wasOpen, setWasOpen] = useState(open);
const [previousSelectedCategoryIds, setPreviousSelectedCategoryIds] =
  useState(selectedCategoryIds);
const [previousSelectedProcedureIds, setPreviousSelectedProcedureIds] =
  useState(selectedProcedureIds);

if (
  open &&
  (!wasOpen ||
    previousSelectedCategoryIds !== selectedCategoryIds ||
    previousSelectedProcedureIds !== selectedProcedureIds)
) {
  setLocalCategoryIds(selectedCategoryIds);
  setLocalProcedureIds(selectedProcedureIds);
  setPreviousSelectedCategoryIds(selectedCategoryIds);
  setPreviousSelectedProcedureIds(selectedProcedureIds);
  setWasOpen(true);
}

if (!open && wasOpen) {
  setWasOpen(false);
}

  const visibleCategories = useMemo(() => {
    return getVisibleCategoriesFallback(specialtyIds);
  }, [specialtyIds]);

  const unavailableCategories = useMemo(() => {
  const visibleCategoryNames = new Set(
    visibleCategories.map((category) => category.category)
  );

  return DoctorCatalog.categories.filter(
    (category) => !visibleCategoryNames.has(category.category)
  );
}, [visibleCategories]);

  const selectedCategories = useMemo(() => {
    return visibleCategories.filter((category) =>
      localCategoryIds.includes(category.category)
    );
  }, [visibleCategories, localCategoryIds]);

  const unselectedCategories = useMemo(() => {
    return visibleCategories.filter(
      (category) => !localCategoryIds.includes(category.category)
    );
  }, [visibleCategories, localCategoryIds]);

  function getProcedureIdsForCategory(category: CategoryItem) {
    return category.subcategories.flatMap((subcategory) =>
      subcategory.procedures.map((procedure) => procedure.id)
    );
  }

  function toggleCategory(category: CategoryItem) {
    const categoryId = category.category;
    const isSelected = localCategoryIds.includes(categoryId);

    if (isSelected) {
      const linkedProcedureIds = getProcedureIdsForCategory(category);

      setLocalCategoryIds((prev) =>
        prev.filter((item) => item !== categoryId)
      );

      setLocalProcedureIds((prev) =>
        prev.filter((procedureId) => !linkedProcedureIds.includes(procedureId))
      );

      return;
    }

    setLocalCategoryIds((prev) => [...prev, categoryId]);
  }

  function toggleProcedure(procedureId: string) {
    setLocalProcedureIds((prev) =>
      prev.includes(procedureId)
        ? prev.filter((item) => item !== procedureId)
        : [...prev, procedureId]
    );
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      const payload = {
        subcategoryIds: localCategoryIds,
        procedureIds: localProcedureIds,
      };

      const res = await fetch("/api/doctor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Could not update doctor profile.");
      }

      onSaved?.(payload);
      router.refresh();
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  return (
   <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
  <div className="relative max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
    <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
          {t("proceduresModal.profileLabel")}
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
          {t("proceduresModal.title")}
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

    <div className="grid h-[64vh] grid-cols-1 overflow-hidden md:grid-cols-[0.85fr_1.4fr]">
      {/* Left: Categories */}
      <div className="h-full overflow-y-auto border-b border-black/10 bg-[#FAF9F7] p-6 md:border-b-0 md:border-r">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
          {t("proceduresModal.categories")}
        </h3>

        <div className="space-y-5">
          <div className="space-y-3">
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <button
                    key={category.category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="rounded-full border border-[#283C5D] bg-[#283C5D] px-4 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:bg-[#A74848] active:scale-[0.97]"
                  >
                    {categoryT(category.category)}
                  </button>
                ))}
              </div>
            )}

            {selectedCategories.length > 0 &&
              unselectedCategories.length > 0 && (
                <div className="h-px w-full bg-black/10" />
              )}

            <div className="flex flex-wrap gap-2">
              {unselectedCategories.map((category) => (
                <button
                  key={category.category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-[#283C5D] transition hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
                >
                  {categoryT(category.category)}
                </button>
              ))}
            </div>
          </div>

          {unavailableCategories.length > 0 && (
            <div className="border-t border-black/10 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/45">
                {t("proceduresModal.outsideSpecialties")}
              </p>

              <div className="flex flex-wrap gap-2">
                {unavailableCategories.map((category) => (
                  <button
                    key={category.category}
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-full border border-black/5 bg-gray-100 px-4 py-2 text-xs font-medium text-gray-400"
                  >
                    {categoryT(category.category)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Procedures */}
      <div className="h-full overflow-y-auto bg-white p-6">
        <div className="sticky -top-6 z-10 mb-4 flex items-end justify-between gap-4 bg-white pb-4 pt-5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
              {t("proceduresModal.procedures")}
            </h3>

            <p className="mt-1 text-xs text-[#283C5D]/55">
              {t("proceduresModal.description")}
            </p>
          </div>

          <p className="text-xs font-medium text-[#d8bd8d]">
            {t("proceduresModal.selectedCount", {
              count: localProcedureIds.length,
            })}
          </p>
        </div>

        {selectedCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
            {t("proceduresModal.emptyCategories")}
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            {selectedCategories.map((category) => (
              <div key={category.category} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
                  {categoryT(category.category)}
                </p>

                {category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.subcategory}
                    className="rounded-2xl bg-[#FAF9F7] p-4"
                  >
                    <h4 className="mb-3 text-sm font-semibold text-[#283C5D]">
                      {subcategoryT(subcategory.subcategory)}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {subcategory.procedures.map((procedure) => {
                        const isSelected = localProcedureIds.includes(
                          procedure.id
                        );

                        return (
                          <button
                            key={procedure.id}
                            type="button"
                            onClick={() => toggleProcedure(procedure.id)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97]",
                              isSelected
                                ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-[#94604C] hover:bg-[#A74848]"
                                : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                            )}
                          >
                            {procedureT(procedure.id)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    <div className="flex items-center justify-end gap-3 border-t border-black/10 px-6 py-5">
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-black/5 active:scale-[0.97]"
      >
        {t("proceduresModal.cancel")}
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-full bg-[#d8bd8d] px-7 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97] disabled:opacity-50"
      >
        {isSaving
          ? t("proceduresModal.saving")
          : t("proceduresModal.saveChanges")}
      </button>
    </div>
  </div>
</div>
)
}