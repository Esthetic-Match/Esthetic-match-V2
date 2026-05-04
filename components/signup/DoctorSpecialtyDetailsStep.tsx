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

const steps = [
  {
    key: "specialties",
    label: "Select Specialty",
  },
  {
    key: "categories",
    label: "Select Category",
  },
  {
    key: "procedures",
    label: "Select Procedure",
  },
] as const;

function SpecialtyStepper({
  currentStep,
}: {
  currentStep: DoctorSpecialtySubStep;
}) {
  const currentIndex = currentStep === "specialties" ? 0 : 1;

  return (
    <div className="mb-8 flex w-full justify-center">
      <div className="flex w-full max-w-xl items-start">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-1 items-start last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                    isActive || isCompleted
                      ? "bg-[#283C5D] text-white"
                      : "border border-[#283C5D]/20 bg-white text-[#283C5D]/40"
                  }`}
                >
                  {index + 1}
                </div>

                <span
                  className={`mt-2 whitespace-nowrap text-[11px] font-medium ${
                    isActive
                      ? "text-[#283C5D]"
                      : isCompleted
                        ? "text-[#283C5D]/70"
                        : "text-[#283C5D]/35"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <div
                  className={`mx-3 mt-3 h-px flex-1 ${
                    isCompleted ? "bg-[#283C5D]" : "bg-[#283C5D]/15"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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