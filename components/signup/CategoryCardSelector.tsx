"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Category } from "@/app/[locale]/sign-up/types";
import { useTranslations } from "next-intl";
import ProcedureSelectionModal from "./ProcedureSelectionModel";

type CategoryCardSelectorProps = {
  visibleCategories: readonly Category[];
  selectedServiceCategories: string[];
  selectedServices: string[];
  onToggleServiceCategory: (value: string) => void;
  onToggleService: (value: string) => void;
  onSelectAllProcedures: (procedureIds: string[]) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

function getCategoryImagePath(category: string) {
  return `/images/dashboard/categories/${category}.svg`;
}

export default function CategoryCardSelector({
  visibleCategories,
  selectedServiceCategories,
  selectedServices,
  onToggleServiceCategory,
  onToggleService,
  onSelectAllProcedures,
  onDeselectAllProcedures,
}: CategoryCardSelectorProps) {
  const t = useTranslations("onboarding.category");
  const categoryT = useTranslations("categoriesName");

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  function openCategory(categoryItem: Category) {
    const isAlreadySelected = selectedServiceCategories.includes(
      categoryItem.category
    );

    if (!isAlreadySelected) {
      onToggleServiceCategory(categoryItem.category);
    }

    setActiveCategory(categoryItem);
  }

  function deselectCategory(
    e: React.MouseEvent<HTMLSpanElement>,
    categoryItem: Category
  ) {
    e.stopPropagation();

    if (selectedServiceCategories.includes(categoryItem.category)) {
      onToggleServiceCategory(categoryItem.category);
    }

    setActiveCategory(null);
  }

  function closePopup() {
    setActiveCategory(null);
  }

  if (visibleCategories.length === 0) {
    return (
      <p className="rounded-2xl border border-black/10 bg-white p-4 text-center text-sm text-black/40">
        {t("No categories")}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="mt-2 max-w-md text-3xl font-bold text-[#283C5D]">
            {t("heading")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {visibleCategories.map((categoryItem) => {
            const selected = selectedServiceCategories.includes(
              categoryItem.category
            );

            return (
              <button
                key={categoryItem.category}
                type="button"
                onClick={() => openCategory(categoryItem)}
                aria-pressed={selected}
                className={`group relative flex min-h-[150px] flex-col items-center justify-center rounded-xl border px-4 py-5 text-center shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                  selected
                    ? "border-[#2563EB]/20 bg-[#EFF6FF]/40 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]"
                    : "border-black/5 bg-white hover:border-[#2563EB]/40"
                }`}
              >
                <span
                  onClick={(e) => selected && deselectCategory(e, categoryItem)}
                  className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition ${
                    selected
                      ? "border-gray-200 bg-gray-300 text-black"
                      : "border-black/15 bg-white text-transparent"
                  }`}
                >
                  <X size={13} strokeWidth={4} />
                </span>

                <img
                  src={getCategoryImagePath(categoryItem.category)}
                  alt={categoryT(categoryItem.category)}
                  className={`mb-3 h-11 w-11 object-contain transition ${
                    selected
                      ? "opacity-100"
                      : "opacity-80 group-hover:opacity-100"
                  }`}
                />

                <span className="text-sm font-semibold text-[#283C5D]">
                 {categoryT(categoryItem.category)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeCategory ? (
        <ProcedureSelectionModal
          activeCategory={activeCategory}
          selectedServices={selectedServices}
          onToggleService={onToggleService}
          onClose={closePopup}
          onSelectAllProcedures={onSelectAllProcedures}
          onDeselectAllProcedures={onDeselectAllProcedures}
        />
      ) : null}
    </>
  );
}