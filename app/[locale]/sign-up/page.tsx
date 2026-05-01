"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import AccountTypeSelector from "@/components/signup/AccountTypeSelector";
import PatientSignUpForm from "@/components/signup/PatientSignUpForm";
import DoctorSignUpForm from "@/components/signup/DoctorSignUpForm";

import type { AccountType } from "./types";
import BackButton from "@/components/UI/BackButton";

export default function SignUpPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType>(null);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSubzones, setSelectedSubzones] = useState<string[]>([]);
  const [otherSpecialtyText, setOtherSpecialtyText] = useState("");

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
    setSelectedSpecialties([]);
    setSelectedServiceCategories([]);
    setSelectedServices([]);
    setSelectedSubzones([]);
    setOtherSpecialtyText("");
  }

  function handleDoctorSelect() {
    setAccountType("doctor");
    resetMessages();
  }

  function handlePatientSelect() {
    setAccountType("patient");
    resetMessages();
  }

  function handleBack() {
    setAccountType(null);
    resetMessages();
    resetFormState();
  }

  function toggleItem(
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function handleToggleSpecialty(id: string) {
    toggleItem(id, setSelectedSpecialties);
  }

  function handleToggleServiceCategory(id: string) {
    toggleItem(id, setSelectedServiceCategories);
  }

  function handleToggleService(id: string) {
    toggleItem(id, setSelectedServices);
  }

  async function handlePatientSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetMessages();

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!dob) {
      setErrorMessage("Please enter your date of birth.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

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

    router.push("/dashboard");
    router.refresh();
  }

  async function handleDoctorSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetMessages();
  
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
  
    if (!dob) {
      setErrorMessage("Please enter your date of birth.");
      return;
    }
  
    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }
  
    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }
  
    if (selectedSpecialties.length === 0) {
      setErrorMessage("Please select at least one specialty.");
      return;
    }
  
    if (
      selectedSpecialties.includes("other_specialty") &&
      !otherSpecialtyText.trim()
    ) {
      setErrorMessage("Please specify the other specialty.");
      return;
    }
  
    setIsLoading(true);
  
    const signUpResult = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      role: "DOCTOR",
      dateOfBirth: dob,
    });
  
    if (signUpResult.error) {
      setIsLoading(false);
      setErrorMessage(signUpResult.error.message || "Something went wrong.");
      return;
    }
  
    const profileResponse = await fetch("/api/doctor-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        specialties: selectedSpecialties,
        serviceCategories: selectedServiceCategories,
        services: selectedServices,
        subzones: selectedSubzones,
        otherSpecialtyText: otherSpecialtyText.trim() || null,
      }),
    });
  
    const profileData = await profileResponse.json();
  
    setIsLoading(false);
  
    if (!profileResponse.ok) {
      setErrorMessage(profileData?.error || "Failed to save doctor profile.");
      return;
    }
  
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="">
      <BackButton onBack={() => router.back()} />

      {accountType === null && (
        <AccountTypeSelector
          infoMessage={infoMessage}
          onSelectPatient={handlePatientSelect}
          onSelectDoctor={handleDoctorSelect}
        />
      )}

      {accountType === "patient" && (
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

    {accountType === "doctor" && (
      <DoctorSignUpForm
        name={name}
        dob={dob}
        email={email}
        password={password}
        selectedSpecialties={selectedSpecialties}
        selectedServiceCategories={selectedServiceCategories}
        selectedServices={selectedServices}
        otherSpecialtyText={otherSpecialtyText}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onBack={handleBack}
        onSubmit={handleDoctorSubmit}
        onNameChange={setName}
        onDobChange={setDob}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onToggleSpecialty={handleToggleSpecialty}
        onToggleServiceCategory={handleToggleServiceCategory}
        onToggleService={handleToggleService}
        onOtherSpecialtyTextChange={setOtherSpecialtyText}
      />
    )}
    </main>
  );
}