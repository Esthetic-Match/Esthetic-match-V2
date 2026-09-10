"use client";

import { useTranslations } from "next-intl";

import type { OnboardingCategory } from "@/components/public/signup/util/utils";

import ChosenProcedures from "./ChosenProcedures";

type ChosenProceduresSectionProps = {
  selectedSpecialties: string[];
  selectedProcedures: string[];
  visibleCategories: readonly OnboardingCategory[];
  onToggleProcedure: (id: string) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function ChosenProceduresSection({
  selectedSpecialties,
  selectedProcedures,
  visibleCategories,
  onToggleProcedure,
  onDeselectAllProcedures,
}: ChosenProceduresSectionProps) {
  const t = useTranslations("onboarding.procedure");

  if (selectedSpecialties.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-black/5 bg-white p-4 shadow-md">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#283C5D]">
          {t("select pro")}
        </p>

        <p className="mt-1 text-xs text-[#283C5D]/50">
          {t("pro selected")}
        </p>
      </div>

      <ChosenProcedures
        categories={visibleCategories}
        selectedProcedureIds={selectedProcedures}
        onRemoveProcedure={onToggleProcedure}
        onDeselectAllProcedures={onDeselectAllProcedures}
      />
    </div>
  );
}