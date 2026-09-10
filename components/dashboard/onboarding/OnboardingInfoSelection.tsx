"use client";

import TextInput from "@/components/UI/TextInput";
import {
  getVisibleCategories,
  type OnboardingCatalogue,
} from "@/components/public/signup/util/utils";

import CategoryAndProcedureSelector from "./CategoryAndProcedureSelector";
import ChosenProceduresSection from "./ChosenProceduresSection";
import SpecialtySelector from "./SpecialtySelector";
import SpecialtyStepper from "./SpecialtyStepper";
import TopProceduresSelector from "./TopProceduresSelector";

type DoctorSpecialtySubStep =
  | "specialties"
  | "categories"
  | "topProcedures";

type OnboardingInfoSelectionProps = {
  catalogue: OnboardingCatalogue;
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
  catalogue,
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
  const hasOtherSpecialty = selectedSpecialties.includes("other_specialty");
  const visibleCategories = getVisibleCategories(
    catalogue.categories,
    selectedSpecialties,
  );
  const selectedCategoryIds = new Set(selectedCategories);
  const selectedVisibleCategories = visibleCategories.filter((category) =>
    selectedCategoryIds.has(category.id),
  );

  const isSelectingSpecialties = subStep === "specialties";
  const isSelectingCategories = subStep === "categories";
  const isSelectingTopProcedures = subStep === "topProcedures";

  return (
    <>
      <SpecialtyStepper currentStep={subStep} />

      {isSelectingSpecialties ? (
        <>
          <SpecialtySelector
            specialtyGroups={catalogue.specialtyGroups}
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
            visibleCategories={selectedVisibleCategories}
            onToggleProcedure={onToggleProcedure}
            onDeselectAllProcedures={onDeselectAllProcedures}
          />
        </>
      ) : null}

      {isSelectingTopProcedures ? (
        <TopProceduresSelector
          visibleCategories={selectedVisibleCategories}
          selectedProcedures={selectedProcedures}
          selectedTopProcedures={selectedTopProcedures}
          onToggleTopProcedure={onToggleTopProcedure}
        />
      ) : null}
    </>
  );
}
