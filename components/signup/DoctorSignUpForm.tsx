"use client";

import { useState } from "react";
import type { DoctorSignUpProps } from "@/app/[locale]/sign-up/types";

import MessageText from "@/components/UI/MessageText";
import BlueBanner from "../UI/BlueBanner";
import WhiteshadowBackground from "../UI/WhiteShadowBackground";

import DoctorAccountDetailsStep from "./DoctorAccountDetailsStep";
import DoctorSpecialtyDetailsStep from "./DoctorSpecialtyDetailsStep";
import { useTranslations } from "next-intl";

type DoctorSignupStep = 1 | 2 | 3;
type DoctorSpecialtySubStep = "specialties" | "categories";

export default function DoctorSignUpForm(props: DoctorSignUpProps) {
  const t = useTranslations("signUp.doctorSignUp");
  const { password, errorMessage, isLoading, onBack, onSubmit } = props;

  const [step, setStep] = useState<DoctorSignupStep>(1);
  const [specialtySubStep, setSpecialtySubStep] =
    useState<DoctorSpecialtySubStep>("specialties");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  function goToNextStep() {
    setLocalError("");

    if (step === 1) {
      if (!password || !confirmPassword) {
        setLocalError("Please enter and confirm your password.");
        return;
      }

      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2 && specialtySubStep === "specialties") {
      if (props.selectedSpecialties.length === 0) {
        setLocalError("Please select at least one specialty.");
        return;
      }

      setSpecialtySubStep("categories");
      return;
    }
  }

  function goToPreviousStep() {
    setLocalError("");

    if (step === 1) {
      onBack();
      return;
    }

    if (step === 2 && specialtySubStep === "categories") {
      setSpecialtySubStep("specialties");
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError("");

    if (step === 1) {
      goToNextStep();
      return;
    }

    if (step === 2 && specialtySubStep === "specialties") {
      goToNextStep();
      return;
    }

    if (step === 2 && specialtySubStep === "categories") {
      onSubmit(e);
      return;
    }
  }

  return (
    <>
      <BlueBanner variant="blue" />
      <WhiteshadowBackground />

      <form
        onSubmit={handleSubmit}
        className="relative z-9999 mx-auto max-w-2xl space-y-4 p-6"
      >
        {step === 1 ? (
          <DoctorAccountDetailsStep
            name={props.name}
            email={props.email}
            password={props.password}
            confirmPassword={confirmPassword}
            clinicName={props.clinicName}
            workAddress={props.workAddress}
            city={props.city}
            country={props.country}
            zipCode={props.zipCode}
            onNameChange={props.onNameChange}
            onEmailChange={props.onEmailChange}
            onPasswordChange={props.onPasswordChange}
            onConfirmPasswordChange={setConfirmPassword}
            onClinicNameChange={props.onClinicNameChange}
            onWorkAddressChange={props.onWorkAddressChange}
            onCityChange={props.onCityChange}
            onCountryChange={props.onCountryChange}
            onZipCodeChange={props.onZipCodeChange}
            onGooglePlaceIdChange={props.onGooglePlaceIdChange}
            onWorkLatitudeChange={props.onWorkLatitudeChange}
            onWorkLongitudeChange={props.onWorkLongitudeChange}
          />
        ) : null}

        {step === 2 ? (
          <DoctorSpecialtyDetailsStep
            subStep={specialtySubStep}
            selectedSpecialties={props.selectedSpecialties}
            selectedServiceCategories={props.selectedServiceCategories}
            selectedServices={props.selectedServices}
            otherSpecialtyText={props.otherSpecialtyText}
            onToggleSpecialty={props.onToggleSpecialty}
            onToggleServiceCategory={props.onToggleServiceCategory}
            onToggleService={props.onToggleService}
            onOtherSpecialtyTextChange={props.onOtherSpecialtyTextChange}
          />
        ) : null}

        <MessageText message={localError} variant="error" />
        <MessageText message={errorMessage} variant="error" />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="w-full rounded border border-black rounded-full px-4 py-3 text-black hover:bg-gray-300 cursor-pointer active:scale-[0.98]"
          >
            {t("back")}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#283C5D] px-4 py-3 text-white cursor-pointer hover:hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {step === 2 && specialtySubStep === "categories"
              ? isLoading
                ? "Creating account..."
                : "Sign up as Doctor"
              : "Continue"}
          </button>
        </div>
      </form>
    </>
  );
}