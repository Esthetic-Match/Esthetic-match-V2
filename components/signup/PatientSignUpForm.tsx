"use client";

import { useState } from "react";
import { CalendarDays, Eye, EyeClosed, Mail, User } from "lucide-react";

import { useTranslations } from "next-intl";
import MessageText from "@/components/UI/MessageText";
import type { PatientSignUpFormProps } from "@/app/[locale]/sign-up/types";
import WhiteshadowBackground from "../UI/WhiteShadowBackground";
import BlueBanner from "../UI/BlueBanner";
import InputField from "../UI/InputField";

export default function PatientSignUpForm({
  name,
  dob,
  email,
  password,
  errorMessage,
  isLoading,
  onSubmit,
  onNameChange,
  onDobChange,
  onEmailChange,
  onPasswordChange,
}: PatientSignUpFormProps) {
  const t = useTranslations("signUp.signUpForm");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

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
    <div className="relative min-h-screen bg-white">
      <BlueBanner variant="blue"/>
      <WhiteshadowBackground />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 mx-auto max-w-md px-6 py-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="mt-2 max-w-xs text-2xl leading-tight text-black">
            {t("heading")}
          </p>
          <p className="mt-2 max-w-xs text-xs leading-tight text-black/30">
            {t("subheading")}
          </p>
        </div>

        <div className="space-y-4">
          <InputField
            label={t("FullName")}
            placeholder={t("NameDescription")}
            value={name}
            onChange={onNameChange}
            icon={<User size={15} />}
          />

          <InputField
            label={t("Email")}
            placeholder={t("EmailDescription")}
            type="email"
            value={email}
            onChange={onEmailChange}
            icon={<Mail size={15} />}
          />

          <InputField
            label={t("DOB")}
            placeholder={t("DOBDescription")}
            type="date"
            value={dob}
            onChange={onDobChange}
            icon={<CalendarDays size={15} />}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-black">
              {t("Gender")}{" "}
              <span className="text-xs font-normal text-black/55">
                {t("Optional")}
              </span>
            </p>

            <div className="flex items-center gap-8 text-xs text-black/55">
              {["Male", "Female", "Others"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={item}
                    checked={gender === item}
                    onChange={() => setGender(item)}
                    className="h-3.5 w-3.5 border-none accent-[#d8bd8d]"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <InputField
            label={t("Password")}
            placeholder={t("PasswordDescription")}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={onPasswordChange}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
                className="text-[#f4e4c6]"
              >
                {showPassword ? (
                  <EyeClosed size={15} className="text-[#FFD78C]cursor-pointer hover:scale-[1.05]" />
                ) : (
                  <Eye size={15} className="text-[#FFD78C] cursor-pointer hover:scale-[1.05]" />
                )}
              </button>
            }
          />
          
          <InputField
            label={t("ConfirmPassword")}
            placeholder={t("ConfirmPasswordDescription")}
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label="Toggle confirm password visibility"
                className="text-[#f4e4c6]"
              >
                {showConfirmPassword ? (
                  <EyeClosed size={15} className="text-[#FFD78C] cursor-pointer hover:scale-[1.05]" />
                ) : (
                  <Eye size={15} className="text-[#FFD78C] cursor-pointer hover:scale-[1.05]" />
                )}
              </button>
            }
          />
        </div>

        <div className="mt-4">
          <MessageText message={localError} variant="error" />
          <MessageText message={errorMessage} variant="error" />
        </div>

        <button
          type="submit"
          disabled={isLoading || !passwordsMatch}
          className="mt-5 h-10 w-full cursor-pointer rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6] 
          text-sm font-semibold text-[#0f233f] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {isLoading ? t("signingUp"): t("SignUpButton")}
        </button>
      </form>
    </div>
  );
}
