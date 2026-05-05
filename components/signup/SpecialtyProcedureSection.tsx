import SelectedProcedures from "./SelectedProcedures";
import { getSelectedProcedureLabels } from "@/components/signup/util/utils";
import type { Category } from "@/app/[locale]/sign-up/types";

type SpecialtyProcedureSectionProps = {
  selectedSpecialties: string[];
  selectedServices: string[];
  visibleCategories: readonly Category[];
  onToggleService: (id: string) => void;
  onDeselectAllProcedures: () => void;
};

export default function SpecialtyProcedureSection({
  selectedSpecialties,
  selectedServices,
  visibleCategories,
  onToggleService,
  onDeselectAllProcedures,
}: SpecialtyProcedureSectionProps) {
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
          Selected procedures
        </p>

        <p className="mt-1 text-xs text-[#283C5D]/50">
          Procedures selected from your chosen categories.
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