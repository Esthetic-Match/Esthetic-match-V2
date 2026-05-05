"use client";

import TextInput from "@/components/UI/TextInput";

import SpecialtySelector from "./SpecialtySelector";
import SpecialtyProcedureSection from "./SpecialtyProcedureSection";
import CategoryCardSelector from "./CategoryCardSelector";
import SpecialtyStepper from "./SpecialtyStepper"
import { getVisibleCategories } from "./util/utils";

type DoctorSpecialtySubStep = "specialties" | "categories";

type DoctorSpecialtyDetailsStepProps = {
  subStep: DoctorSpecialtySubStep;

  selectedSpecialties: string[];
  selectedServiceCategories: string[];
  selectedServices: string[];
  otherSpecialtyText: string;

  onToggleSpecialty: (value: string) => void;
  onToggleServiceCategory: (value: string) => void;
  onToggleService: (value: string) => void;
  onOtherSpecialtyTextChange: (value: string) => void;
  onSelectAllProcedures: () => void;
  onDeselectAllProcedures: () => void;
};

export default function DoctorSpecialtyDetailsStep({
  subStep,
  selectedSpecialties,
  selectedServiceCategories,
  selectedServices,
  otherSpecialtyText,
  onToggleSpecialty,
  onToggleServiceCategory,
  onToggleService,
  onOtherSpecialtyTextChange,
  onSelectAllProcedures,
  onDeselectAllProcedures,
}: DoctorSpecialtyDetailsStepProps) {
  const hasOtherSpecialty =
    selectedSpecialties.includes("Other specialty") ||
    selectedSpecialties.includes("other specialty") ||
    selectedSpecialties.includes("other_specialty");

  const visibleCategories = getVisibleCategories(selectedSpecialties);

  const isSelectingSpecialties = subStep === "specialties";
  const isSelectingCategories = subStep === "categories";

  

  return (
    <>
      <SpecialtyStepper currentStep={subStep} />

      {isSelectingSpecialties ? (
        <>
          <SpecialtySelector
            selectedSpecialties={selectedSpecialties}
            onToggleSpecialty={onToggleSpecialty}
          />

          {hasOtherSpecialty ? (
            <TextInput
              placeholder="Please specify other specialty"
              value={otherSpecialtyText}
              onChange={onOtherSpecialtyTextChange}
            />
          ) : null}
        </>
      ) : null}

      {isSelectingCategories ? (
        <>
          <CategoryCardSelector
            visibleCategories={visibleCategories}
            selectedServiceCategories={selectedServiceCategories}
            selectedServices={selectedServices}
            onToggleServiceCategory={onToggleServiceCategory}
            onToggleService={onToggleService}
            onSelectAllProcedures={onSelectAllProcedures}
            onDeselectAllProcedures={onDeselectAllProcedures}
          />

        <SpecialtyProcedureSection
          selectedSpecialties={selectedSpecialties}
          selectedServices={selectedServices}
          visibleCategories={visibleCategories}
          onToggleService={onToggleService}
          onDeselectAllProcedures={onDeselectAllProcedures}
        />
        </>
      ) : null}
    </>
  );
}