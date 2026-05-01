"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Category } from "@/app/[locale]/sign-up/types";
import { useTranslations } from "next-intl";
import ProcedureSelectionModal from "./ProcedureSelectionModel";

type CategoryCardSelectorProps = {
  visibleCategories: readonly Category[];
  selectedServiceCategories: string[];
  selectedServices: string[];
  onToggleServiceCategory: (value: string) => void;
  onToggleService: (value: string) => void;
};

function getCategoryImagePath(category: string) {
  return `/images/categories/${category
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "-")}.jpg`;
}

export default function CategoryCardSelector({
  visibleCategories,
  selectedServiceCategories,
  selectedServices,
  onToggleServiceCategory,
  onToggleService,
}: CategoryCardSelectorProps) {
  const t = useTranslations("signUp.category");
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

  function closePopup() {
    setActiveCategory(null);
  }

  if (visibleCategories.length === 0) {
    return (
      <p className="rounded-2xl border border-black/10 bg-white p-4 text-center text-sm text-black/40">
        No categories available for the selected specialties.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
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
                className={`relative min-h-32 overflow-hidden rounded-2xl border transition 
                    hover:bg-[#94604C] hover:border-[#94604C] hover:scale-[1.01] active:scale-[0.98] cursor-pointer active:scale-[0.98] ${
                  selected
                    ? "border-[#EDD0A9] ring-2 ring-[#EDD0A9]"
                    : "border-black/10 hover:border-black/30"
                }`}
              >
                <img
                  src={getCategoryImagePath(categoryItem.category)}
                  alt={t(categoryItem.category)}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/35" />

                {selected ? (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : null}

                <div className="relative z-10 flex h-full min-h-32 items-center justify-center px-3 text-center">
                  <span className="text-sm font-semibold text-white">
                    {t.has(categoryItem.category)
                      ? t(categoryItem.category)
                      : categoryItem.category}
                  </span>
                </div>
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
        />
      ) : null}
    </>
  );
}