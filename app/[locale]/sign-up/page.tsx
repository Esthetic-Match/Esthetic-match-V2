"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

import AccountTypeSelector from "@/components/signup/AccountTypeSelector";
import PatientSignUpForm from "@/components/signup/PatientSignUpForm";
import DoctorSignUpForm from "@/components/signup/DoctorSignUpForm";
import VerifyEmail from "@/components/signup/VerifyEmail";
import BackButton from "@/components/UI/BackButton";

import type { AccountType } from "./types";

export default function SignUpPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType>(null);
  const [signUpStep, setSignUpStep] = useState<"form" | "verifyEmail">("form");

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [clinicName, setClinicName] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [workLatitude, setWorkLatitude] = useState<number | null>(null);
  const [workLongitude, setWorkLongitude] = useState<number | null>(null);

  const [verificationEmail, setVerificationEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function resetMessages() {
    setErrorMessage("");
    setInfoMessage("");
  }

  function resetFormState() {
    setName("");
    setDob("");
    setEmail("");
    setPassword("");
    setClinicName("");
    setWorkAddress("");
    setCity("");
    setCountry("");
    setZipCode("");
    setGooglePlaceId("");
    setWorkLatitude(null);
    setWorkLongitude(null);
    setYearsOfExperience(0);
  }

  function handleBack() {
    setAccountType(null);
    setSignUpStep("form");
    setVerificationEmail("");
    resetMessages();
    resetFormState();
  }

  async function handlePatientSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetMessages();

    if (!name.trim()) return setErrorMessage("Please enter your name.");
    if (!dob) return setErrorMessage("Please enter your date of birth.");
    if (!email.trim()) return setErrorMessage("Please enter your email.");
    if (!password.trim()) return setErrorMessage("Please enter your password.");

    setIsLoading(true);

    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      role: "PATIENT",
      dateOfBirth: dob,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Something went wrong.");
      return;
    }

    setVerificationEmail(email.trim());
    setSignUpStep("verifyEmail");
    setInfoMessage("We sent a verification code to your email.");
  }

  async function handleCreateDoctorAccount() {
    resetMessages();
    setIsLoading(true);

    try {
      if (!name.trim()) throw new Error("Please enter your name.");
      if (!email.trim()) throw new Error("Please enter your email.");
      if (!dob) return setErrorMessage("Please enter your date of birth.");
      if (!password.trim()) throw new Error("Please enter your password.");
      if (!clinicName.trim()) throw new Error("Please enter your clinic name.");
      if (!workAddress.trim())
        throw new Error("Please enter your clinic address.");
      if (!city.trim()) throw new Error("Please enter your city.");
      if (!country.trim()) throw new Error("Please enter your country.");

      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        role: "DOCTOR",
        dateOfBirth: dob,
      });

      if (error) {
        throw new Error(error.message || "Could not create doctor account.");
      }

      const userId = data?.user?.id;

      if (!userId) {
        throw new Error("Account created, but user ID was not returned.");
      }

      const profileRes = await fetch("/api/doctor-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          clinicName: clinicName.trim(),
          workAddress: workAddress.trim(),
          city: city.trim(),
          country: country.trim(),
          zipCode: zipCode.trim(),
          workLatitude,
          workLongitude,
          yearsOfExperience,
        }),
      });

      if (!profileRes.ok) {
        const profileData = await profileRes.json().catch(() => null);
        throw new Error(
          profileData?.error || "Doctor profile could not be created."
        );
      }

      setVerificationEmail(email.trim());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not create doctor account."
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <BackButton onBack={() => router.back()} />

      {accountType === null && (
        <AccountTypeSelector
          infoMessage={infoMessage}
          onSelectPatient={() => {
            resetMessages();
            setAccountType("patient");
          }}
          onSelectDoctor={() => {
            resetMessages();
            setAccountType("doctor");
          }}
        />
      )}

      {accountType === "patient" && signUpStep === "form" && (
        <PatientSignUpForm
          name={name}
          dob={dob}
          email={email}
          password={password}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onBack={handleBack}
          onSubmit={handlePatientSubmit}
          onNameChange={setName}
          onDobChange={setDob}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      )}

      {accountType === "patient" && signUpStep === "verifyEmail" && (
        <VerifyEmail email={verificationEmail} role="PATIENT" />
      )}

      {accountType === "doctor" && (
        <DoctorSignUpForm
          name={name}
          email={email}
          dob={dob}
          password={password}
          errorMessage={errorMessage}
          clinicName={clinicName}
          workAddress={workAddress}
          city={city}
          country={country}
          zipCode={zipCode}
          googlePlaceId={googlePlaceId}
          workLatitude={workLatitude}      
          workLongitude={workLongitude}
          yearsOfExperience={yearsOfExperience}     
          isLoading={isLoading}
          onBack={handleBack}
          onNameChange={setName}
          onEmailChange={setEmail}
          onDobChange={setDob}
          onPasswordChange={setPassword}
          onYearsOfExperienceChange={setYearsOfExperience}
          onCityChange={setCity}
          onCountryChange={setCountry}
          onZipCodeChange={setZipCode}
          onClinicNameChange={setClinicName}
          onWorkAddressChange={setWorkAddress}
          onGooglePlaceIdChange={setGooglePlaceId}
          onWorkLatitudeChange={setWorkLatitude}
          onWorkLongitudeChange={setWorkLongitude}
          onCreateDoctorAccount={handleCreateDoctorAccount}
        />
      )}
    </main>
  );
}