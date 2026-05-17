"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

import MessageText from "@/components/UI/MessageText";
import DoctorSpecialtyDetailsStep from "@/components/signup/DoctorSpecialtyDetailsStep";
import PaymentAndPrices from "@/components/signup/PaymentAndPrices";
import { ShieldCheck } from "lucide-react";

type DoctorOnboardingStep = "specialties" | "categories" | "payment";
type DoctorSpecialtySubStep = "specialties" | "categories";

export default function DoctorOnboardingPage() {
  const t = useTranslations("signUp.onboarding");
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [step, setStep] = useState<DoctorOnboardingStep>("specialties");

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<
    string[]
  >([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherSpecialtyText, setOtherSpecialtyText] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isPaymentStep = step === "payment";
  const subStep: DoctorSpecialtySubStep =
    step === "categories" ? "categories" : "specialties";

  function toggleValue(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  function handleBack() {
    setErrorMessage("");

    if (step === "payment") {
      setStep("categories");
      return;
    }

    if (step === "categories") {
      setStep("specialties");
      return;
    }

    router.push("/dashboard");
  }

  async function saveSpecialtyOnboarding() {
    const res = await fetch("/api/doctor-profile/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        specialtyIds: selectedSpecialties,
        subcategoryIds: selectedServiceCategories,
        procedureIds: selectedServices,
        otherSpecialtyText,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Could not save onboarding.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (step === "specialties") {
      if (selectedSpecialties.length === 0) {
        setErrorMessage("Please select at least one specialty.");
        return;
      }

      setStep("categories");
      return;
    }

    if (step === "categories") {
      if (selectedServiceCategories.length === 0) {
        setErrorMessage("Please select at least one category.");
        return;
      }

      setIsLoading(true);

      try {
        await saveSpecialtyOnboarding();
        setStep("payment");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not save onboarding."
        );
      } finally {
        setIsLoading(false);
      }

      return;
    }
  }

  function getSelectedCategoryProcedureIds(): string[] {
    return DoctorCatalog.categories
      .filter((category) =>
        selectedServiceCategories.includes(category.category)
      )
      .flatMap((category) =>
        category.subcategories.flatMap((subcategory) =>
          subcategory.procedures.map((procedure) => procedure.id)
        )
      );
  }

  function handleSelectAllProcedures(procedureIds: string[]) {
    setSelectedServices((prev) =>
      Array.from(new Set([...prev, ...procedureIds]))
    );
  }
  
  function handleDeselectAllProcedures(procedureIds: string[]) {
    setSelectedServices((prev) =>
      prev.filter((id) => !procedureIds.includes(id))
    );
  }

  return (
    <div>
      {isPaymentStep ? (
        <div className="relative z-20 mx-auto max-w-4xl space-y-5 p-8 mt-10">
          <PaymentAndPrices />

          <MessageText message={errorMessage} variant="error" />

        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="relative z-20 mx-auto max-w-4xl space-y-5 p-8 mt-10"
        >
          <DoctorSpecialtyDetailsStep
            subStep={subStep}
            selectedSpecialties={selectedSpecialties}
            selectedServiceCategories={selectedServiceCategories}
            selectedServices={selectedServices}
            otherSpecialtyText={otherSpecialtyText}
            onToggleSpecialty={(value: string) =>
              toggleValue(value, setSelectedSpecialties)
            }
            onToggleServiceCategory={(value: string) =>
              toggleValue(value, setSelectedServiceCategories)
            }
            onToggleService={(value: string) =>
              toggleValue(value, setSelectedServices)
            }
            onOtherSpecialtyTextChange={setOtherSpecialtyText}
            onSelectAllProcedures={handleSelectAllProcedures}
            onDeselectAllProcedures={handleDeselectAllProcedures}
          />

          <MessageText message={errorMessage} variant="error" />

          <div className="space-y-3 mt-8">
            <div className="flex flex-col gap-y-4 gap-x-4 md:flex-row justify-between">
              <div className="flex items-center gap-3 rounded-full bg-gray-200 px-4 py-3 text-black/60">
                <div className="flex h-15 w-15 flex-shrink-0 items-center justify-center rounded-full border border-black/10 bg-white">
                  <ShieldCheck size={35} className="text-[#283C5D]" />
                </div>

                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold text-[#283C5D] sm:text-base">
                    {t("secure info")}
                  </p>

                  <p className="text-xs text-black/40 sm:text-sm">
                    {t("garantee")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 rounded-full border border-black px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-300 active:scale-[0.98] cursor-pointer"
                >
                  {t("back")}
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {step === "categories"
                    ? isLoading
                      ? t("saving")
                      : t("submit")
                    : t("continue")}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}