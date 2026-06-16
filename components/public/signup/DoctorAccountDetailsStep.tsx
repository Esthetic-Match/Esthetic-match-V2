"use client";

import { useState } from "react";
import {
  Eye,
  EyeClosed,
  Mail,
  User,
  Building2,
} from "lucide-react";
import InputField from "@/components/UI/InputField";
import { useTranslations } from "next-intl";
import GoogleClinicLocationFields from "@/components/UI/GoogleClinicLocationFields";


type DoctorAccountDetailsStepProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;

  clinicName: string;
  workAddress: string;
  city: string;
  country: string;
  zipCode: string;
  yearsOfExperience: number;
  
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onYearsOfExperienceChange: (value: number) => void;

  onClinicNameChange: (value: string) => void;
  onWorkAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;

  onGooglePlaceIdChange?: (value: string) => void;
  onWorkLatitudeChange?: (value: number) => void;
  onWorkLongitudeChange?: (value: number) => void;
};

export default function DoctorAccountDetailsStep({
  name,
  email,
  password,
  confirmPassword,
  clinicName,
  workAddress,
  city,
  country,
  zipCode,
  onNameChange,
  onEmailChange,
  onYearsOfExperienceChange,
  onPasswordChange,
  yearsOfExperience,
  onConfirmPasswordChange,
  onClinicNameChange,
  onWorkAddressChange,
  onCityChange,
  onCountryChange,
  onZipCodeChange,
  onGooglePlaceIdChange,
  onWorkLatitudeChange,
  onWorkLongitudeChange,
}: DoctorAccountDetailsStepProps) {
  const t = useTranslations("signUp.signUpForm");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col items-center text-center">
        <p className="mt-2 max-w-xs text-2xl leading-tight text-normal text-black">
          {t("heading")}
        </p>
        <p className="mt-2 max-w-xs text-xs leading-tight text-black/30">
          {t("subheading")}
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
        label={t("yearsOfExperience")}
        placeholder={t("yearsOfExperienceDescription")}
        value={yearsOfExperience?.toString() ?? ""}
        type="number"
        onChange={() => {}}
        onNumberChange={onYearsOfExperienceChange}
        icon={<Building2 size={15} />}
      />

      <InputField
        label={t("ClinicName")}
        placeholder={t("ClinicNameDescription")}
        value={clinicName}
        onChange={onClinicNameChange}
        icon={<Building2 size={15} />}
      />

      <GoogleClinicLocationFields
        workAddress={workAddress}
        city={city}
        country={country}
        zipCode={zipCode}
        onWorkAddressChange={onWorkAddressChange}
        onCityChange={onCityChange}
        onCountryChange={onCountryChange}
        onZipCodeChange={onZipCodeChange}
        onGooglePlaceIdChange={onGooglePlaceIdChange}
        onWorkLatitudeChange={onWorkLatitudeChange}
        onWorkLongitudeChange={onWorkLongitudeChange}
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
            {showPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
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
            {showConfirmPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
          </button>
        }
      />
    </>
  );
}