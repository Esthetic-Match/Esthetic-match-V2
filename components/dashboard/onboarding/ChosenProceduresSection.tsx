import SelectedProcedures from "./SelectedProcedures";
import { getSelectedProcedureLabels } from "@/components/public/signup/util/utils";
import type { Category } from "@/app/[locale]/(public)/sign-up/types";
import { useTranslations } from "next-intl";

type ChosenProceduresSectionProps = {
  selectedSpecialties: string[];
  selectedServices: string[];
  visibleCategories: readonly Category[];
  onToggleService: (id: string) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function ChosenProceduresSection({
  selectedSpecialties,
  selectedServices,
  visibleCategories,
  onToggleService,
  onDeselectAllProcedures,
}: ChosenProceduresSectionProps) {
  const t = useTranslations("onboarding.procedure");
  
  if (selectedSpecialties.length === 0) {
    return null;
  }

  const selectedProcedures = getSelectedProcedureLabels(
    visibleCategories,
    selectedServices
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
      <SelectedProcedures
        selectedProcedures={selectedProcedures}
        onRemoveProcedure={onToggleService}
        onDeselectAllProcedures={onDeselectAllProcedures}
      />
    </div>
  );
}