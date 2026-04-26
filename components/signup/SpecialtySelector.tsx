import { DoctorCatalog } from "@/lib/doctorCatalogue";
import MultiSelectDropdown from "./MultiSelectDropdown";

type SpecialtySelectorProps = {
  selectedSpecialties: string[];
  onToggleSpecialty: (id: string) => void;
};

export default function SpecialtySelector({
  selectedSpecialties,
  onToggleSpecialty,
}: SpecialtySelectorProps) {
  return (
    <MultiSelectDropdown
      label={DoctorCatalog.specialties.label}
      summaryLabel="Select specialties"
      items={DoctorCatalog.specialties.items.map((specialty) => ({
        id: specialty,
        label: specialty,
      }))}
      selectedItems={selectedSpecialties}
      onToggle={onToggleSpecialty}
    />
  );
}