"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import MessageText from "@/components/UI/MessageText";
import OnboardingInfoSelection from "@/components/dashboard/onboarding/OnboardingInfoSelection";
import PaymentAndPrices from "@/components/dashboard/onboarding/PaymentAndPrices";
import {
  getProcedureIdsForCategories,
  getVisibleCategories,
  parseOnboardingCatalogueResponse,
  type OnboardingCatalogue,
} from "@/components/public/signup/util/utils";

type DoctorOnboardingStep =
  | "specialties"
  | "categories"
  | "topProcedures"
  | "payment";

type DoctorSpecialtySubStep =
  | "specialties"
  | "categories"
  | "topProcedures";

function toggleStringValue(value: string, values: string[]) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getResponseErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const response = payload as Record<string, unknown>;

  if (typeof response.message === "string") {
    return response.message;
  }

  if (typeof response.error === "string") {
    return response.error;
  }

  return null;
}

export default function DoctorOnboardingPage() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<DoctorOnboardingStep>("specialties");
  const [catalogue, setCatalogue] = useState<OnboardingCatalogue | null>(null);
  const [catalogueError, setCatalogueError] = useState("");
  const [catalogueRequestKey, setCatalogueRequestKey] = useState(0);

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [otherSpecialtyText, setOtherSpecialtyText] = useState("");
  const [selectedTopProcedures, setSelectedTopProcedures] = useState<string[]>(
    [],
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalogue() {
      setCatalogue(null);
      setCatalogueError("");

      try {
        const response = await fetch(
          `/api/doctor-profile/onboarding?locale=${encodeURIComponent(locale)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getResponseErrorMessage(payload) ??
              "Could not load the onboarding catalogue.",
          );
        }

        const nextCatalogue = parseOnboardingCatalogueResponse(payload);

        if (!nextCatalogue) {
          throw new Error("The server returned an invalid catalogue response.");
        }

        setCatalogue(nextCatalogue);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCatalogueError(
          error instanceof Error
            ? error.message
            : "Could not load the onboarding catalogue.",
        );
      }
    }

    void loadCatalogue();

    return () => {
      controller.abort();
    };
  }, [catalogueRequestKey, locale]);

  const visibleCategories = useMemo(() => {
    if (!catalogue) {
      return [];
    }

    return getVisibleCategories(
      catalogue.categories,
      selectedSpecialties,
    );
  }, [catalogue, selectedSpecialties]);

  const isPaymentStep = step === "payment";
  const subStep: DoctorSpecialtySubStep =
    step === "categories"
      ? "categories"
      : step === "topProcedures"
        ? "topProcedures"
        : "specialties";

  function handleToggleSpecialty(specialtyId: string) {
    if (!catalogue) {
      return;
    }

    const nextSpecialties = toggleStringValue(
      specialtyId,
      selectedSpecialties,
    );
    const nextVisibleCategories = getVisibleCategories(
      catalogue.categories,
      nextSpecialties,
    );
    const visibleCategoryIds = new Set(
      nextVisibleCategories.map((category) => category.id),
    );
    const nextCategories = selectedCategories.filter((categoryId) =>
      visibleCategoryIds.has(categoryId),
    );
    const allowedProcedureIds = new Set(
      getProcedureIdsForCategories(nextVisibleCategories, nextCategories),
    );
    const nextProcedures = selectedProcedures.filter((procedureId) =>
      allowedProcedureIds.has(procedureId),
    );

    setSelectedSpecialties(nextSpecialties);
    setSelectedCategories(nextCategories);
    setSelectedProcedures(nextProcedures);
    setSelectedTopProcedures((previous) =>
      previous.filter((procedureId) => allowedProcedureIds.has(procedureId)),
    );

    if (!nextSpecialties.includes("other_specialty")) {
      setOtherSpecialtyText("");
    }
  }

  function handleToggleCategory(categoryId: string) {
    const nextCategories = toggleStringValue(categoryId, selectedCategories);
    const allowedProcedureIds = new Set(
      getProcedureIdsForCategories(visibleCategories, nextCategories),
    );
    const nextProcedures = selectedProcedures.filter((procedureId) =>
      allowedProcedureIds.has(procedureId),
    );

    setSelectedCategories(nextCategories);
    setSelectedProcedures(nextProcedures);
    setSelectedTopProcedures((previous) =>
      previous.filter((procedureId) => allowedProcedureIds.has(procedureId)),
    );
  }

  function handleToggleProcedure(procedureId: string) {
    const nextProcedures = toggleStringValue(
      procedureId,
      selectedProcedures,
    );

    setSelectedProcedures(nextProcedures);

    if (!nextProcedures.includes(procedureId)) {
      setSelectedTopProcedures((previous) =>
        previous.filter((id) => id !== procedureId),
      );
    }
  }

  function handleToggleTopProcedure(procedureId: string) {
    if (!selectedProcedures.includes(procedureId)) {
      return;
    }

    setSelectedTopProcedures((previous) => {
      if (previous.includes(procedureId)) {
        return previous.filter((id) => id !== procedureId);
      }

      if (previous.length >= 3) {
        return previous;
      }

      return [...previous, procedureId];
    });
  }

  function handleSelectAllProcedures(procedureIds: string[]) {
    setSelectedProcedures((previous) =>
      Array.from(new Set([...previous, ...procedureIds])),
    );
  }

  function handleDeselectAllProcedures(procedureIds: string[]) {
    const idsToRemove = new Set(procedureIds);

    setSelectedProcedures((previous) =>
      previous.filter((id) => !idsToRemove.has(id)),
    );
    setSelectedTopProcedures((previous) =>
      previous.filter((id) => !idsToRemove.has(id)),
    );
  }

  function handleBack() {
    setErrorMessage("");

    if (step === "payment") {
      setStep("topProcedures");
      return;
    }

    if (step === "topProcedures") {
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
    const response = await fetch("/api/doctor-profile/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        specialtyIds: selectedSpecialties,
        categoryIds: selectedCategories,
        procedureIds: selectedProcedures,
        topThree: selectedTopProcedures,
        otherSpecialtyText,
      }),
    });

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);

      throw new Error(
        getResponseErrorMessage(payload) ?? "Could not save onboarding.",
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (step === "specialties") {
      if (selectedSpecialties.length === 0) {
        setErrorMessage(t("errors.selectSpecialty"));
        return;
      }

      setStep("categories");
      return;
    }

    if (step === "categories") {
      if (selectedCategories.length === 0) {
        setErrorMessage(t("errors.selectCategory"));
        return;
      }

      setStep("topProcedures");
      return;
    }

    if (step === "topProcedures") {
      if (selectedTopProcedures.length !== 3) {
        setErrorMessage(t("errors.selectTopProcedures"));
        return;
      }

      setIsLoading(true);

      try {
        await saveSpecialtyOnboarding();
        setStep("payment");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not save onboarding.",
        );
      } finally {
        setIsLoading(false);
      }
    }
  }

  if (!catalogue && !catalogueError) {
    return (
      <div className="relative z-20 mx-auto flex min-h-[320px] max-w-4xl items-center justify-center p-8">
        <Loader2
          aria-label="Loading onboarding catalogue"
          className="h-7 w-7 animate-spin text-[#283C5D]"
        />
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="relative z-20 mx-auto mt-10 max-w-4xl p-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">{catalogueError}</p>

          <button
            type="button"
            onClick={() => setCatalogueRequestKey((value) => value + 1)}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isPaymentStep ? (
        <div className="relative z-20 mx-auto mt-10 max-w-4xl space-y-5 p-8">
          <PaymentAndPrices />
          <MessageText message={errorMessage} variant="error" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="relative z-20 mx-auto mt-10 max-w-4xl space-y-5 p-8"
        >
          <OnboardingInfoSelection
            catalogue={catalogue}
            subStep={subStep}
            selectedSpecialties={selectedSpecialties}
            selectedCategories={selectedCategories}
            selectedProcedures={selectedProcedures}
            otherSpecialtyText={otherSpecialtyText}
            selectedTopProcedures={selectedTopProcedures}
            onToggleTopProcedure={handleToggleTopProcedure}
            onToggleSpecialty={handleToggleSpecialty}
            onToggleCategory={handleToggleCategory}
            onToggleProcedure={handleToggleProcedure}
            onOtherSpecialtyTextChange={setOtherSpecialtyText}
            onSelectAllProcedures={handleSelectAllProcedures}
            onDeselectAllProcedures={handleDeselectAllProcedures}
          />

          <MessageText message={errorMessage} variant="error" />

          <div className="mt-8 space-y-3">
            <div className="flex flex-col justify-between gap-x-4 gap-y-4 md:flex-row">
              <div className="flex w-full items-start gap-3 rounded-3xl bg-gray-200 px-4 py-4 text-black/60 sm:items-center sm:rounded-full sm:px-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white sm:h-15 sm:w-15">
                  <ShieldCheck
                    size={26}
                    className="text-[#283C5D] sm:size-[35px]"
                  />
                </div>

                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-sm font-semibold leading-snug text-[#283C5D] sm:truncate sm:text-base">
                    {t("secure info")}
                  </p>

                  <p className="mt-1 text-xs leading-snug text-black/40 sm:text-sm">
                    {t("garantee")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 cursor-pointer rounded-full border border-black px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-300 active:scale-[0.98]"
                >
                  {t("back")}
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 cursor-pointer rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === "topProcedures"
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