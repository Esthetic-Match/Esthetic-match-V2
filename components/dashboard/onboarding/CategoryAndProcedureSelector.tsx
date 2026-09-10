"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { OnboardingCategory } from "@/components/public/signup/util/utils";

import ProcedureSelectionModal from "./modal/ProcedureSelectionModel";

type CategoryAndProcedureSelectorProps = {
  visibleCategories: readonly OnboardingCategory[];
  selectedCategories: string[];
  selectedProcedures: string[];
  onToggleCategory: (value: string) => void;
  onToggleProcedure: (value: string) => void;
  onSelectAllProcedures: (procedureIds: string[]) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

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
  const [activeCategory, setActiveCategory] =
    useState<OnboardingCategory | null>(null);

  function openCategory(category: OnboardingCategory) {
    if (!selectedCategories.includes(category.id)) {
      onToggleCategory(category.id);
    }

    setActiveCategory(category);
  }

  function deselectCategory(category: OnboardingCategory) {
    if (selectedCategories.includes(category.id)) {
      onToggleCategory(category.id);
    }

    if (activeCategory?.id === category.id) {
      setActiveCategory(null);
    }
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
        <div className="my-6 flex flex-col items-center text-center">
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
          {visibleCategories.map((category) => {
            const selected = selectedCategories.includes(category.id);

            return (
              <div key={category.id} className="group relative">
                <button
                  type="button"
                  onClick={() => openCategory(category)}
                  aria-pressed={selected}
                  className={`flex min-h-[150px] w-full flex-col items-center justify-center rounded-xl border px-4 py-5 text-center shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                    selected
                      ? "border-[#2563EB]/20 bg-[#EFF6FF]/40 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]"
                      : "border-black/5 bg-white hover:border-[#2563EB]/40"
                  }`}
                >
                  {category.dashboardImage ? (
                    <Image
                      src={category.dashboardImage}
                      alt=""
                      width={44}
                      height={44}
                      className={`mb-3 h-11 w-11 object-contain transition ${
                        selected
                          ? "opacity-100"
                          : "opacity-80 group-hover:opacity-100"
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}

                  <span className="text-sm font-semibold text-[#283C5D]">
                    {category.name}
                  </span>
                </button>

                {selected ? (
                  <button
                    type="button"
                    onClick={() => deselectCategory(category)}
                    aria-label={`Remove ${category.name}`}
                    className="absolute right-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-gray-300 text-black transition hover:border-red-200 hover:bg-red-100 hover:text-red-600"
                  >
                    <X size={13} strokeWidth={3} />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {activeCategory ? (
        <ProcedureSelectionModal
          key={activeCategory.id}
          activeCategory={activeCategory}
          selectedProcedures={selectedProcedures}
          onToggleProcedure={onToggleProcedure}
          onClose={() => setActiveCategory(null)}
          onSelectAllProcedures={onSelectAllProcedures}
          onDeselectAllProcedures={onDeselectAllProcedures}
        />
      ) : null}
    </>
  );
}