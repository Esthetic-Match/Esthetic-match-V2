"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { X } from "lucide-react";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { cn } from "@/lib/utils";
import {getVisibleCategories} from "@/components/signup/util/utils"

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

function normalizeId(value: string) {
  return value.toLowerCase().trim().replaceAll(" ", "_");
}

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
  const router = useRouter();

  const [localCategoryIds, setLocalCategoryIds] = useState<string[]>([]);
  const [localProcedureIds, setLocalProcedureIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalCategoryIds(selectedCategoryIds);
      setLocalProcedureIds(selectedProcedureIds);
    }
  }, [open, selectedCategoryIds, selectedProcedureIds]);

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
              Doctor Profile
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
              Edit Categories & Procedures
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
{/* Left: Categories */}
<div className="h-full overflow-y-auto border-b border-black/10 bg-[#FAF9F7] p-6 md:border-b-0 md:border-r">
  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
    Categories
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
              className="rounded-full border border-[#283C5D] bg-[#283C5D] px-4 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:bg-red-500 active:scale-[0.97]"
            >
              {category.category}
            </button>
          ))}
        </div>
      )}

      {selectedCategories.length > 0 && unselectedCategories.length > 0 && (
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
            {category.category}
          </button>
        ))}
      </div>
    </div>

    {unavailableCategories.length > 0 && (
      <div className="border-t border-black/10 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/45">
          Outside selected specialties
        </p>

        <div className="flex flex-wrap gap-2">
          {unavailableCategories.map((category) => (
            <button
              key={category.category}
              type="button"
              disabled
              className="cursor-not-allowed rounded-full border border-black/5 bg-gray-100 px-4 py-2 text-xs font-medium text-gray-400"
            >
              {category.category}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

  {/* Right: Procedures */}
  <div className="h-full overflow-y-auto bg-white p-6">
    <div className="sticky top-0 z-10 mb-4 flex items-end justify-between gap-4 bg-white pb-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
          Procedures
        </h3>
        <p className="mt-1 text-xs text-[#283C5D]/55">
          Select procedures under your chosen categories.
        </p>
      </div>

      <p className="text-xs font-medium text-[#d8bd8d]">
        {localProcedureIds.length} selected
      </p>
    </div>

    {selectedCategories.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
        Select a category to view its linked procedures.
      </div>
    ) : (
      <div className="space-y-6 pb-6">
        {selectedCategories.map((category) => (
          <div key={category.category} className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
              {category.category}
            </p>

            {category.subcategories.map((subcategory) => (
              <div
                key={subcategory.subcategory}
                className="rounded-2xl bg-[#FAF9F7] p-4"
              >
                <h4 className="mb-3 text-sm font-semibold text-[#283C5D]">
                  {subcategory.subcategory}
                </h4>

                <div className="flex flex-wrap gap-2">
                  {subcategory.procedures.map((procedure) => {
                    const isSelected = localProcedureIds.includes(procedure.id);

                    return (
                      <button
                        key={procedure.id}
                        type="button"
                        onClick={() => toggleProcedure(procedure.id)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97]",
                          isSelected
                            ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-red-500"
                            : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                        )}
                      >
                        {procedure.name}
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
  );
}