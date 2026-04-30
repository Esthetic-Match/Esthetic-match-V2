"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Category } from "@/app/sign-up/types";

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
                  alt=""
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
                    {categoryItem.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeCategory ? (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-black">
                  {activeCategory.category}
                </p>
                <p className="text-xs text-black/40">
                  Select the procedures you offer.
                </p>
              </div>

              <button
                type="button"
                onClick={closePopup}
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
                    {subcategory.subcategory}
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
                          {procedure.name}
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
                onClick={closePopup}
                className="w-full rounded bg-[#283C5D] rounded-full px-4 py-3 text-white transition hover:opacity-90 cursor-pointer active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}