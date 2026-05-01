"use client";

import { useState } from "react";
import { CalendarDays, Eye, EyeClosed, Mail, User } from "lucide-react";
import InputField from "../UI/InputField";
import { useTranslations } from "next-intl";

type DoctorAccountDetailsStepProps = {
  name: string;
  dob: string;
  email: string;
  password: string;
  confirmPassword: string;

  onNameChange: (value: string) => void;
  onDobChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
};

export default function DoctorAccountDetailsStep({
  name,
  dob,
  email,
  password,
  confirmPassword,
  onNameChange,
  onDobChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: DoctorAccountDetailsStepProps) {
  const t = useTranslations("signUp.signUpForm");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col items-center text-center">
        <p className="mt-2 max-w-xs text-xs leading-tight text-black/30">
          {t("heading")}
        </p>
      </div>

      <InputField
        label={t("FullName")}
        placeholder={t("NameDescription")}
        value={name}
        onChange={onNameChange}
        icon={<User size={15} />}
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
        label={t("Email")}
        placeholder={t("EmailDescription")}
        type="email"
        value={email}
        onChange={onEmailChange}
        icon={<Mail size={15} />}
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
            className="text-[#f4e4c6]"
          >
            {showPassword ? (
              <EyeClosed
                size={15}
                className="cursor-pointer text-[#FFD78C] hover:scale-[1.05]"
              />
            ) : (
              <Eye
                size={15}
                className="cursor-pointer text-[#FFD78C] hover:scale-[1.05]"
              />
            )}
          </button>
        }
      />

      <InputField
        label={t("ConfirmPassword")}
        placeholder={t("ConfirmPasswordDescription")}
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        icon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label="Toggle confirm password visibility"
            className="text-[#f4e4c6]"
          >
            {showConfirmPassword ? (
              <EyeClosed
                size={15}
                className="cursor-pointer text-[#FFD78C] hover:scale-[1.05]"
              />
            ) : (
              <Eye
                size={15}
                className="cursor-pointer text-[#FFD78C] hover:scale-[1.05]"
              />
            )}
          </button>
        }
      />
    </>
  );
}