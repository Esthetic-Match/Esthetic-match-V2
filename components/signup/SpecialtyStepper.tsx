"use client";

import { useTranslations } from "next-intl";

type DoctorSpecialtySubStep = "specialties" | "categories";

type SpecialtyStepperProps = {
  currentStep: DoctorSpecialtySubStep;
};

const steps = [
  {
    key: "specialties",
    labelKey: "selectSpecialty",
  },
  {
    key: "categories",
    labelKey: "selectCategory/procedure",
  },
  {
    key: "payment",
    labelKey: "selectpayment",
  },
] as const;

export default function SpecialtyStepper({
  currentStep,
}: SpecialtyStepperProps) {
  const t = useTranslations("signUp.onboarding.specialtyStepper");

  const currentIndex = currentStep === "specialties" ? 0 : 1;

  return (
<div className="mb-8 w-full overflow-x-auto px-1">
  <div className="mx-auto flex min-w-max max-w-xl items-start sm:min-w-0">
    {steps.map((step, index) => {
      const isActive = index === currentIndex;
      const isCompleted = index < currentIndex;

      return (
        <div
          key={step.key}
          className="flex min-w-[92px] flex-1 items-start last:flex-none sm:min-w-0"
        >
          <div className="flex max-w-[90px] flex-col items-center text-center sm:max-w-none">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                isActive || isCompleted
                  ? "bg-[#283C5D] text-white"
                  : "border border-[#283C5D]/20 bg-white text-[#283C5D]/40"
              }`}
            >
              {index + 1}
            </div>

            <span
              className={`mt-2 text-wrap text-[10px] font-medium leading-tight sm:text-[11px] ${
                isActive
                  ? "text-[#283C5D]"
                  : isCompleted
                    ? "text-[#283C5D]/70"
                    : "text-[#283C5D]/35"
              }`}
            >
              {t(step.labelKey)}
            </span>
          </div>

          {index < steps.length - 1 ? (
            <div
              className={`mx-2 mt-3 h-px min-w-8 flex-1 sm:mx-3 ${
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