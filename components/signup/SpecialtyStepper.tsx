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
                  {t(step.labelKey)}
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