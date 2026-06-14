"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { DoctorSignUpProps } from "@/app/[locale]/(public)/sign-up/types";

import MessageText from "@/components/UI/MessageText";
import BlueBanner from "@/components/UI/BlueBanner";
import DoctorAccountDetailsStep from "./DoctorAccountDetailsStep";
import VerifyEmail from "./VerifyEmail";
import { useTranslations } from "next-intl";

type DoctorSignupStep = "account" | "verify-email";

export default function DoctorSignUpForm(props: DoctorSignUpProps) {
  const t = useTranslations("home.Home");
  const router = useRouter();

  const { password, email, errorMessage, isLoading, onBack } = props;

  const [step, setStep] = useState<DoctorSignupStep>("account");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  async function createDoctorAccount() {
    setLocalError("");

    if (!password || !confirmPassword) {
      setLocalError("Please enter and confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    await props.onCreateDoctorAccount();

    setStep("verify-email");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (step === "account") {
      await createDoctorAccount();
    }
  }

  return (
    <>
      <BlueBanner variant="blue" />

      {step === "verify-email" ? (
        <div className="relative z-9999 mx-auto max-w-2xl p-6">
          <VerifyEmail
            email={email}
            role="DOCTOR"
            onVerified={() => router.push("/sign-in")}
          />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="relative z-9999 mx-auto max-w-2xl space-y-4 p-6"
        >
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
            yearsOfExperience={props.yearsOfExperience} 
            onNameChange={props.onNameChange}
            onEmailChange={props.onEmailChange}
            onYearsOfExperienceChange={props.onYearsOfExperienceChange}
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

          <MessageText message={localError} variant="error" />
          <MessageText message={errorMessage} variant="error" />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-full border border-black px-4 py-3 text-black hover:bg-gray-300 cursor-pointer active:scale-[0.98]"
            >
              {t("back")}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#283C5D] px-4 py-3 text-white cursor-pointer hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? t("one moment") : t("signUp")}
            </button>
          </div>
        </form>
      )}
    </>
  );
}