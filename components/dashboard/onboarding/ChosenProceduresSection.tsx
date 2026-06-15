import ChosenProcedures from "./ChosenProcedures";
import { getSelectedProcedureLabels } from "@/components/public/signup/util/utils";
import type { Category } from "@/app/[locale]/(public)/sign-up/types";
import { useTranslations } from "next-intl";

type ChosenProceduresSectionProps = {
  selectedSpecialties: string[];
  selectedProcedures: string[];
  visibleCategories: readonly Category[];
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

  const chosenProcedures = getSelectedProcedureLabels(
    visibleCategories,
    selectedProcedures
  );
  
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
        chosenProcedures={chosenProcedures}
        onRemoveProcedure={onToggleProcedure}
        onDeselectAllProcedures={onDeselectAllProcedures}
      />
    </div>
  );
}