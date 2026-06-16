"use client";

import TextInput from "@/components/UI/TextInput";

import SpecialtySelector from "./SpecialtySelector";
import ChosenProceduresSection from "./ChosenProceduresSection";
import CategoryAndProcedureSelector from "./CategoryAndProcedureSelector";
import SpecialtyStepper from "./SpecialtyStepper"
import { getVisibleCategories } from "../../public/signup/util/utils";
import TopProceduresSelector from "./TopProceduresSelector";

type DoctorSpecialtySubStep =
  | "specialties"
  | "categories"
  | "topProcedures";

type OnboardingInfoSelectionProps = {
  subStep: DoctorSpecialtySubStep;

  selectedSpecialties: string[];
  selectedCategories: string[];
  selectedProcedures: string[];
  otherSpecialtyText: string;
  selectedTopProcedures: string[];
  
  onToggleTopProcedure: (value: string) => void;
  onToggleSpecialty: (value: string) => void;
  onToggleCategory: (value: string) => void;
  onToggleProcedure: (value: string) => void;
  onOtherSpecialtyTextChange: (value: string) => void;
  onSelectAllProcedures: (procedureIds: string[]) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function OnboardingInfoSelection({
  subStep,
  selectedSpecialties,
  selectedCategories,
  selectedProcedures,
  otherSpecialtyText,
  onToggleSpecialty,
  onToggleCategory,
  onToggleProcedure,
  onOtherSpecialtyTextChange,
  onSelectAllProcedures,
  onDeselectAllProcedures,
  selectedTopProcedures,
  onToggleTopProcedure,
}: OnboardingInfoSelectionProps) {
  const hasOtherSpecialty =
    selectedSpecialties.includes("Other specialty") ||
    selectedSpecialties.includes("other specialty") ||
    selectedSpecialties.includes("other_specialty");

  const visibleCategories = getVisibleCategories(selectedSpecialties);

  const isSelectingSpecialties = subStep === "specialties";
  const isSelectingCategories = subStep === "categories";
  const isSelectingTopProcedures = subStep === "topProcedures";

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
          <CategoryAndProcedureSelector
            visibleCategories={visibleCategories}
            selectedCategories={selectedCategories}
            selectedProcedures={selectedProcedures}
            onToggleCategory={onToggleCategory}
            onToggleProcedure={onToggleProcedure}
            onSelectAllProcedures={onSelectAllProcedures}
            onDeselectAllProcedures={onDeselectAllProcedures}
          />
          <ChosenProceduresSection
            selectedSpecialties={selectedSpecialties}
            selectedProcedures={selectedProcedures}
            visibleCategories={visibleCategories}
            onToggleProcedure={onToggleProcedure}
            onDeselectAllProcedures={onDeselectAllProcedures}
          />
        </>
      ) : null}
      {isSelectingTopProcedures ? (
        <TopProceduresSelector
          selectedProcedures={selectedProcedures}
          selectedTopProcedures={selectedTopProcedures}
          onToggleTopProcedure={onToggleTopProcedure}
        />
      ) : null}
    </>
  );
}