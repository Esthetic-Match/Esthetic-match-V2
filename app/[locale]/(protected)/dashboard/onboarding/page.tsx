"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import MessageText from "@/components/UI/MessageText";
import BlueBanner from "@/components/UI/BlueBanner";
import WhiteshadowBackground from "@/components/UI/WhiteShadowBackground";
import DoctorSpecialtyDetailsStep from "@/components/signup/DoctorSpecialtyDetailsStep";

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

  return (
    <>
      <BlueBanner variant="blue" />
      <WhiteshadowBackground />

      <form
        onSubmit={handleSubmit}
        className="relative z-9999 mx-auto max-w-4xl space-y-5 p-6"
      >
        <DoctorSpecialtyDetailsStep
          subStep={subStep}
          selectedSpecialties={selectedSpecialties}
          selectedServiceCategories={selectedServiceCategories}
          selectedServices={selectedServices}
          otherSpecialtyText={otherSpecialtyText}
          onToggleSpecialty={(value) =>
            toggleValue(value, setSelectedSpecialties)
          }
          onToggleServiceCategory={(value) =>
            toggleValue(value, setSelectedServiceCategories)
          }
          onToggleService={(value) =>
            toggleValue(value, setSelectedServices)
          }
          onOtherSpecialtyTextChange={setOtherSpecialtyText}
        />

        <MessageText message={errorMessage} variant="error" />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-full rounded-full border border-black px-4 py-3 text-black hover:bg-gray-300 cursor-pointer active:scale-[0.98]"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#283C5D] px-4 py-3 text-white cursor-pointer hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {subStep === "categories"
              ? isLoading
                ? "Saving..."
                : "Complete onboarding"
              : "Continue"}
          </button>
        </div>
      </form>
    </>
  );
}