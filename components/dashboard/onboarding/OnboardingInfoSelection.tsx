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
  selectedServiceCategories: string[];
  selectedServices: string[];
  otherSpecialtyText: string;
  selectedTopProcedures: string[];
  
  onToggleTopProcedure: (value: string) => void;
  onToggleSpecialty: (value: string) => void;
  onToggleServiceCategory: (value: string) => void;
  onToggleService: (value: string) => void;
  onOtherSpecialtyTextChange: (value: string) => void;
  onSelectAllProcedures: (procedureIds: string[]) => void;
  onDeselectAllProcedures: (procedureIds: string[]) => void;
};

export default function OnboardingInfoSelection({
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
            selectedServiceCategories={selectedServiceCategories}
            selectedServices={selectedServices}
            onToggleServiceCategory={onToggleServiceCategory}
            onToggleService={onToggleService}
            onSelectAllProcedures={onSelectAllProcedures}
            onDeselectAllProcedures={onDeselectAllProcedures}
          />

        <ChosenProceduresSection
          selectedSpecialties={selectedSpecialties}
          selectedServices={selectedServices}
          visibleCategories={visibleCategories}
          onToggleService={onToggleService}
          onDeselectAllProcedures={onDeselectAllProcedures}
        />
        </>
      ) : null}
      {isSelectingTopProcedures ? (
        <TopProceduresSelector
          selectedServices={selectedServices}
          selectedTopProcedures={selectedTopProcedures}
          onToggleTopProcedure={onToggleTopProcedure}
        />
      ) : null}
    </>
  );
}