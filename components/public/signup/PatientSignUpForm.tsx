"use client";

import { useState } from "react";
import { CalendarDays, Eye, EyeClosed, Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";

import MessageText from "@/components/UI/MessageText";
import type { PatientSignUpFormProps } from "@/app/[locale]/(public)/sign-up/types";
import WhiteshadowBackground from "@/components/UI/WhiteShadowBackground";
import BlueBanner from "@/components/UI/BlueBanner";
import InputField from "@/components/UI/InputField";
import GoogleAuthButton from "@/components/UI/GoogleAuthbutton";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const passwordsMatch =
    Boolean(password) && Boolean(confirmPassword) && password === confirmPassword;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError("");

    if (!password || !confirmPassword) {
      setLocalError(t("errors.passwordRequired"));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t("errors.passwordMismatch"));
      return;
    }

    onSubmit(e);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-black">
      <WhiteshadowBackground />
      <BlueBanner variant="blue" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-[#283C5D]/10 backdrop-blur-md"
        >
          <div className="mb-7 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#d8bd8d]">
              Esthetic Match
            </p>

            <h1 className="text-2xl font-semibold leading-tight text-[#283C5D]">
              {t("heading")}
            </h1>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#283C5D]/55">
              {t("subheading")}
            </p>
          </div>

          <GoogleAuthButton role="PATIENT" />

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#283C5D]/10" />
            <span className="text-xs font-medium text-[#283C5D]/45">
              {t("orSignUpWithEmail")}
            </span>
            <div className="h-px flex-1 bg-[#283C5D]/10" />
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
                  className="text-[#d8bd8d] transition hover:scale-[1.05]"
                >
                  {showPassword ? (
                    <EyeClosed size={15} />
                  ) : (
                    <Eye size={15} />
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
                  className="text-[#d8bd8d] transition hover:scale-[1.05]"
                >
                  {showConfirmPassword ? (
                    <EyeClosed size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              }
            />
          </div>

          <div className="mt-4 space-y-2">
            <MessageText message={localError} variant="error" />
            <MessageText message={errorMessage} variant="error" />
          </div>
                    <label className="mt-6 flex items-start gap-3 rounded-2xl border border-[#283C5D]/10 bg-white/70 p-4 text-sm leading-6 text-[#283C5D]/75">
            <input
              type="checkbox"
              checked={hasAcceptedTerms}
              onChange={(event) => setHasAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#283C5D]/20 accent-[#d8bd8d] cursor-pointer"
            />
          
            <span>
              {t("agree")}{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#283C5D] underline underline-offset-4 hover:text-[#d8bd8d]"
              >
                {t("privacyPolicy")}
              </a>{" "}
              and{" "}
              <a
                href="/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#283C5D] underline underline-offset-4 hover:text-[#d8bd8d]"
              >
                {t("termsOfUse")}
              </a>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading || !passwordsMatch || !hasAcceptedTerms}
            className="mt-5 h-11 w-full cursor-pointer rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6] text-sm font-semibold text-[#0f233f] shadow-sm transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? t("signingUp") : t("SignUpButton")}
          </button>
        </form>
      </section>
    </main>
  );
}