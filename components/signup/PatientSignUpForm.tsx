"use client";

import { useState } from "react";
import BackButton from "@/components/UI/BackButton";
import MessageText from "@/components/UI/MessageText";
import TextInput from "@/components/UI/TextInput";
import type { PatientSignUpFormProps } from "@/app/sign-up/types";

export default function PatientSignUpForm({
  name,
  dob,
  email,
  password,
  errorMessage,
  isLoading,
  onBack,
  onSubmit,
  onNameChange,
  onDobChange,
  onEmailChange,
  onPasswordChange,
}: PatientSignUpFormProps) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

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

    // if valid → continue with original submit
    onSubmit(e);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BackButton onBack={onBack} />

      <div>
        <p className="mb-2 text-sm font-medium">Signing up as Patient</p>
      </div>

      <TextInput
        placeholder="Name"
        value={name}
        onChange={onNameChange}
      />

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

      {/* Local validation (password mismatch) */}
      <MessageText message={localError} variant="error" />

      {/* Backend validation */}
      <MessageText message={errorMessage} variant="error" />

      <button
        type="submit"
        disabled={isLoading || !passwordsMatch}
        className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {isLoading ? "Creating account..." : "Sign up as Patient"}
      </button>
    </form>
  );
}