"use client";

import TextInput from "@/components/UI/TextInput";

import SpecialtySelector from "./SpecialtySelector";
import SpecialtyProcedureSection from "./SpecialtyProcedureSection";
import CategoryCardSelector from "./CategoryCardSelector";
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
      <div className="mb-6 flex flex-col items-center text-center">
        <p className="mt-2 max-w-xs text-md leading-tight text-black/30">
          {isSelectingSpecialties
            ? "Select your specialties."
            : "Select your categories and procedures."}
        </p>
      </div>

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
          />

          <SpecialtyProcedureSection
            selectedSpecialties={selectedSpecialties}
            selectedServices={selectedServices}
            visibleCategories={visibleCategories}
            onToggleService={onToggleService}
          />
        </>
      ) : null}
    </>
  );
}