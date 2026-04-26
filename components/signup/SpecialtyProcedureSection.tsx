import SelectedProcedures from "./SelectedProcedures";
import { getSelectedProcedureLabels } from "@/components/signup/util/utils";
import type { Category } from "@/app/sign-up/types";

type SpecialtyProcedureSectionProps = {
  selectedSpecialties: string[];
  selectedServices: string[];
  visibleCategories: readonly Category[];
  onToggleService: (id: string) => void;
};

export default function SpecialtyProcedureSection({
  selectedSpecialties,
  selectedServices,
  visibleCategories,
  onToggleService,
}: SpecialtyProcedureSectionProps) {
  if (selectedSpecialties.length === 0) {
    return null;
  }

  const selectedProcedures = getSelectedProcedureLabels(
    visibleCategories,
    selectedServices
  );

  return (
    <div className="space-y-4 rounded border p-4">
      <p className="text-sm font-semibold">
        Procedures selected for {selectedSpecialties.join(", ")}
      </p>

      <SelectedProcedures
        selectedProcedures={selectedProcedures}
        onRemoveProcedure={onToggleService}
      />
    </div>
  );
}