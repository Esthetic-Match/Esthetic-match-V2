"use client";

import { useState } from "react";
import MessageText from "@/components/UI/MessageText";
import TextInput from "@/components/UI/TextInput";
import type { DoctorSignUpProps } from "@/app/sign-up/types";

import SpecialtySelector from "./SpecialtySelector";
import SpecialtyProcedureSection from "./SpecialtyProcedureSection";
import VisibleCategorySelectors from "./VisibleCategorySelectors";
import { getVisibleCategories } from "./util/utils";
import BlueBanner from "../UI/BlueBanner";

export default function DoctorSignUpForm({
  name,
  dob,
  email,
  password,

  selectedSpecialties,
  selectedServiceCategories,
  selectedServices,

  otherSpecialtyText,

  errorMessage,
  isLoading,

  onBack,
  onSubmit,

  onNameChange,
  onDobChange,
  onEmailChange,
  onPasswordChange,

  onToggleSpecialty,
  onToggleServiceCategory,
  onToggleService,

  onOtherSpecialtyTextChange,
}: DoctorSignUpProps) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const hasOtherSpecialty =
    selectedSpecialties.includes("Other specialty") ||
    selectedSpecialties.includes("other specialty") ||
    selectedSpecialties.includes("other_specialty");

  const visibleCategories = getVisibleCategories(selectedSpecialties);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError("");

    if (!password || !confirmPassword) {
      setLocalError("Please enter and confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    onSubmit(e);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BlueBanner variant="blue"/>

      <p className="mb-2 text-sm font-medium">Signing up as Doctor</p>

      <TextInput placeholder="Name" value={name} onChange={onNameChange} />

      <TextInput
        placeholder="Date of Birth"
        type="date"
        value={dob}
        onChange={onDobChange}
      />

      <TextInput
        placeholder="Email"
        type="email"
        value={email}
        onChange={onEmailChange}
      />

      <TextInput
        placeholder="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
      />

      <TextInput
        placeholder="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <SpecialtySelector
        selectedSpecialties={selectedSpecialties}
        onToggleSpecialty={onToggleSpecialty}
      />

      {hasOtherSpecialty ? (
        <TextInput
          placeholder="Please specify other specialty"
          value={otherSpecialtyText}
          onChange={onOtherSpecialtyTextChange}
        />
      ) : null}

      <SpecialtyProcedureSection
        selectedSpecialties={selectedSpecialties}
        selectedServices={selectedServices}
        visibleCategories={visibleCategories}
        onToggleService={onToggleService}
      />

      <VisibleCategorySelectors
        visibleCategories={visibleCategories}
        selectedServiceCategories={selectedServiceCategories}
        selectedServices={selectedServices}
        onToggleServiceCategory={onToggleServiceCategory}
        onToggleService={onToggleService}
      />

      <MessageText message={localError} variant="error" />
      <MessageText message={errorMessage} variant="error" />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {isLoading ? "Creating account..." : "Sign up as Doctor"}
      </button>
    </form>
  );
}