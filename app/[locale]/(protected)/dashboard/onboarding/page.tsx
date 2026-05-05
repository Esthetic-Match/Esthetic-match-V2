"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Category,
  Subcategory,
  Procedure,
} from "@/app/[locale]/sign-up/types";
import { DoctorCatalog } from "@/lib/doctorCatalogue";


import MessageText from "@/components/UI/MessageText";
import BlueBanner from "@/components/UI/BlueBanner";
import WhiteshadowBackground from "@/components/UI/WhiteShadowBackground";
import DoctorSpecialtyDetailsStep from "@/components/signup/DoctorSpecialtyDetailsStep";
import { ShieldCheck } from "lucide-react";

type DoctorSpecialtySubStep = "specialties" | "categories";

export default function DoctorOnboardingPage() {
  const router = useRouter();

  const [subStep, setSubStep] =
    useState<DoctorSpecialtySubStep>("specialties");

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<
    string[]
  >([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherSpecialtyText, setOtherSpecialtyText] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  function toggleValue(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  function handleBack() {
    setErrorMessage("");

    if (subStep === "categories") {
      setSubStep("specialties");
      return;
    }

    router.push("/dashboard");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (subStep === "specialties") {
      if (selectedSpecialties.length === 0) {
        setErrorMessage("Please select at least one specialty.");
        return;
      }

      setSubStep("categories");
      return;
    }

    if (selectedServiceCategories.length === 0) {
      setErrorMessage("Please select at least one category.");
      return;
    }

    setIsLoading(true);

    try {
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

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save onboarding."
      );
    } finally {
      setIsLoading(false);
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

function handleSelectAllProcedures() {
  const procedureIds = getSelectedCategoryProcedureIds();

  setSelectedServices((prev) =>
    Array.from(new Set([...prev, ...procedureIds]))
  );
}

function handleDeselectAllProcedures() {
  const procedureIds = getSelectedCategoryProcedureIds();

  setSelectedServices((prev) =>
    prev.filter((id) => !procedureIds.includes(id))
  );
}

  return (
    <div className="overflow-hidden">
      <BlueBanner variant="blue" />
      <WhiteshadowBackground />

      <form
        onSubmit={handleSubmit}
        className="relative z-50 mx-auto max-w-4xl space-y-5 p-8"
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
          onToggleService={(value: string) => toggleValue(value, setSelectedServices)}
          onOtherSpecialtyTextChange={setOtherSpecialtyText}
          onSelectAllProcedures={handleSelectAllProcedures}
          onDeselectAllProcedures={handleDeselectAllProcedures}
        />

        <MessageText message={errorMessage} variant="error" />

        {/* Continue/Back section */}
        <div className="space-y-3 mt-8">
          <div className="flex flex-col gap-y-4 md:flex-row justify-between">
          {/* Security message */}
          <div className="flex items-center gap-2 text-xs md:min-w-[300px] max-h-[60px] text-black/50 bg-gray-200 rounded-full px-4 pr-10 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white">
              <ShieldCheck size={24} className="text-[#283C5D]" />
            </div>
              
            <div className="leading-tight">
              <p className="font-medium text-lg sm:text-xl text-[#283C5D]">
                Your information is secure
              </p>
              <p className="text-[11px] text-xs sm:text-lg text-black/40">
                We guarantee confidentiality and data protection
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 rounded-full border border-black sm:px-8 py-3 text-black hover:bg-gray-300 cursor-pointer active:scale-[0.98]"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-full bg-[#283C5D] sm:px-10 px-4 py-3 text-white cursor-pointer hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {subStep === "categories"
                ? isLoading
                  ? "Saving..."
                  : "Submit"
                : "Continue"}
            </button>
          </div>
        </div>      
        </div>
      </form>
    </div>
  );
}