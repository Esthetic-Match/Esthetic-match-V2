"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Category } from "@/app/[locale]/(public)/sign-up/types";
import { useTranslations } from "next-intl";
import ProcedureSelectionModal from "./modal/ProcedureSelectionModel";
import Image from "next/image";

type CategoryAndProcedureSelectorProps = {
  visibleCategories: readonly Category[];
  selectedCategories: string[];
  selectedProcedures: string[];
  onToggleCategory: (value: string) => void;
  onToggleProcedure: (value: string) => void;
  onSelectAllProcedures: (procedureIds: string[]) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

function getCategoryImagePath(category: string) {
  return `/images/dashboard/categories/${category}.svg`;
}

export default function CategoryAndProcedureSelector({
  visibleCategories,
  selectedCategories,
  selectedProcedures,
  onToggleCategory,
  onToggleProcedure,
  onSelectAllProcedures,
  onDeselectAllProcedures,
}: CategoryAndProcedureSelectorProps) {
  const t = useTranslations("onboarding.category");
  const categoryT = useTranslations("categoriesName");

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  function openCategory(categoryItem: Category) {
    const isAlreadySelected = selectedCategories.includes(
      categoryItem.category
    );

    if (!isAlreadySelected) {
      onToggleCategory(categoryItem.category);
    }

    setActiveCategory(categoryItem);
  }

  function deselectCategory(
    e: React.MouseEvent<HTMLSpanElement>,
    categoryItem: Category
  ) {
    e.stopPropagation();

    if (selectedCategories.includes(categoryItem.category)) {
      onToggleCategory(categoryItem.category);
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
      <div className="flex flex-col my-6 items-center text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl">
          {t("title")}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#283C5D]/45">
          {t("subtitle")}
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#EFF6FF] px-4 py-2 text-xs font-medium text-[#283C5D]/60">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#2563EB] text-[10px] font-bold text-[#2563EB]">
            i
          </span>
          <span>{t("note")}</span>
        </div>
      </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {visibleCategories.map((categoryItem) => {
            const selected = selectedCategories.includes(
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

                <Image
                  src={getCategoryImagePath(categoryItem.category)}
                  alt={categoryT(categoryItem.category)}
                  width={44}
                  height={44}
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
          selectedProcedures={selectedProcedures}
          onToggleProcedure={onToggleProcedure}
          onClose={closePopup}
          onSelectAllProcedures={onSelectAllProcedures}
          onDeselectAllProcedures={onDeselectAllProcedures}
        />
      ) : null}
    </>
  );
}