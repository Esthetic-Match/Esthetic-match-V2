"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { X, CheckCheck, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { cn } from "@/lib/utils/utils";
import { getVisibleCategories } from "@/components/public/signup/util/utils";
import { useTranslations } from "next-intl";
import { ProceduresSearchBar } from "@/components/UI/ProceduresSearchBar";

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

type SubcategoryItem = CategoryItem["subcategories"][number];

type ProcedureItem = SubcategoryItem["procedures"][number];

type FilteredSubcategory = {
  subcategory: string;
  procedures: ProcedureItem[];
};

type FilteredCategory = {
  category: string;
  subcategories: FilteredSubcategory[];
};

function getVisibleCategoriesFallback(selectedSpecialties: string[]) {
  return getVisibleCategories(selectedSpecialties);
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
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

  const wasOpenRef = useRef(false);

  const [localCategoryIds, setLocalCategoryIds] =
    useState<string[]>(selectedCategoryIds);

  const [localProcedureIds, setLocalProcedureIds] =
    useState<string[]>(selectedProcedureIds);

  const [procedureSearchQuery, setProcedureSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setLocalCategoryIds(selectedCategoryIds);
      setLocalProcedureIds(selectedProcedureIds);
      setProcedureSearchQuery("");
    }

    if (!open && wasOpenRef.current) {
      setIsCategoriesOpen(false);
      setProcedureSearchQuery("");
    }

    wasOpenRef.current = open;
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

  const filteredSelectedCategories = useMemo<FilteredCategory[]>(() => {
    const normalizedQuery = normalizeSearchValue(procedureSearchQuery);

    return selectedCategories
      .map((category): FilteredCategory => {
        const subcategories = category.subcategories
          .map((subcategory): FilteredSubcategory => {
            const procedures = subcategory.procedures.filter(
              (procedure): boolean => {
                if (normalizedQuery.length === 0) {
                  return true;
                }

                const translatedProcedureName = procedureT(
                  procedure.id
                ).toLowerCase();

                const procedureName = procedure.name.toLowerCase();
                const procedureId = procedure.id.toLowerCase();

                return (
                  translatedProcedureName.includes(normalizedQuery) ||
                  procedureName.includes(normalizedQuery) ||
                  procedureId.includes(normalizedQuery)
                );
              }
            );

            return {
              subcategory: subcategory.subcategory,
              procedures,
            };
          })
          .filter(
            (subcategory): boolean => subcategory.procedures.length > 0
          );

        return {
          category: category.category,
          subcategories,
        };
      })
      .filter((category): boolean => category.subcategories.length > 0);
  }, [selectedCategories, procedureSearchQuery, procedureT]);

  const visibleProcedureIds = useMemo<string[]>(() => {
    return filteredSelectedCategories.flatMap((category) =>
      category.subcategories.flatMap((subcategory) =>
        subcategory.procedures.map((procedure) => procedure.id)
      )
    );
  }, [filteredSelectedCategories]);

  const allVisibleSelected =
    visibleProcedureIds.length > 0 &&
    visibleProcedureIds.every((id) => localProcedureIds.includes(id));

  const anyVisibleSelected = visibleProcedureIds.some((id) =>
    localProcedureIds.includes(id)
  );

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
        prev.filter(
          (procedureId) => !linkedProcedureIds.includes(procedureId)
        )
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

  function selectAllProcedures() {
    setLocalProcedureIds((prev) => {
      const next = new Set(prev);

      visibleProcedureIds.forEach((id) => {
        next.add(id);
      });

      return Array.from(next);
    });
  }

  function deselectAllProcedures() {
    setLocalProcedureIds((prev) =>
      prev.filter((id) => !visibleProcedureIds.includes(id))
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
        headers: { "Content-Type": "application/json" },
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

  if (!open) {
    return null;
  }

  const hasSelectedCategories = selectedCategories.length > 0;
  const hasFilteredProcedures = filteredSelectedCategories.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative max-h-[108vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
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
          <div className="esthetic-scrollbar border-b border-black/10 bg-[#FAF9F7] md:h-full md:overflow-y-auto md:border-b-0 md:border-r">
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-[#283C5D] transition active:scale-[0.98]"
              >
                <span className="text-sm font-semibold uppercase tracking-[0.25em]">
                  {t("proceduresModal.categories")}
                </span>

                {isCategoriesOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            <div className="hidden px-6 pb-4 pt-6 md:block">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                {t("proceduresModal.categories")}
              </h3>
            </div>

            <div
              className={cn(
                "space-y-5 px-6 pb-6",
                isCategoriesOpen ? "block" : "hidden md:block"
              )}
            >
              <div className="space-y-3">
                {selectedCategories.length > 0 ? (
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
                ) : null}

                {selectedCategories.length > 0 &&
                unselectedCategories.length > 0 ? (
                  <div className="h-px w-full bg-black/10" />
                ) : null}

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

              {unavailableCategories.length > 0 ? (
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
              ) : null}
            </div>
          </div>

          <div className="esthetic-scrollbar h-full overflow-y-auto bg-white p-6">
            <div className="sticky -top-60 z-10 mb-4 bg-white pb-4 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                    {t("proceduresModal.procedures")}
                  </h3>

                  <p className="mt-1 text-xs text-[#283C5D]/55">
                    {t("proceduresModal.description")}
                  </p>
                </div>

                <p className="shrink-0 text-xs font-medium text-[#d8bd8d]">
                  {t("proceduresModal.selectedCount", {
                    count: localProcedureIds.length,
                  })}
                </p>
              </div>

              {hasSelectedCategories ? (
                <ProceduresSearchBar
                  value={procedureSearchQuery}
                  onChange={setProcedureSearchQuery}
                  placeholder="Search procedures"
                  ariaLabel="Search procedures"
                  className="mt-4"
                />
              ) : null}

              {visibleProcedureIds.length > 0 ? (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllProcedures}
                    disabled={allVisibleSelected}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97]",
                      allVisibleSelected
                        ? "cursor-not-allowed border-black/5 bg-[#FAF9F7] text-[#283C5D]/30"
                        : "border-[#283C5D]/20 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                    )}
                  >
                    <CheckCheck size={13} />
                    {t("proceduresModal.selectAll")}
                  </button>

                  <button
                    type="button"
                    onClick={deselectAllProcedures}
                    disabled={!anyVisibleSelected}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97]",
                      !anyVisibleSelected
                        ? "cursor-not-allowed border-black/5 bg-[#FAF9F7] text-[#283C5D]/30"
                        : "border-red-200 bg-white text-[#A74848] hover:border-red-500 hover:bg-[#A74848] hover:text-white"
                    )}
                  >
                    <XCircle size={13} />
                    {t("proceduresModal.deselectAll")}
                  </button>
                </div>
              ) : null}
            </div>

            {!hasSelectedCategories ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
                {t("proceduresModal.emptyCategories")}
              </div>
            ) : !hasFilteredProcedures ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
                No procedures found.
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {filteredSelectedCategories.map((category) => (
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
  );
}