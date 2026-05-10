"use client";

import { useEffect, useState } from "react";
import InputField from "@/components/UI/InputField";
import GoogleClinicLocationFields from "@/components/UI/GoogleClinicLocationFields";
import {
  CalendarDays,
  CheckCircle2,
  Languages,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";


type PatientEditProfileProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    dateOfBirth: string | null;
    image: string | null;
  };
};

type PatientProfileData = {
  id: string;
  gender: string | null;
  phoneNumber: string | null;
  city: string | null;
  country: string | null;
  zipCode: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  preferredConsultationType: string | null;
  preferredLanguage: string | null;
};

export default function PatientEditProfile({ user }: PatientEditProfileProps) {
  const t = useTranslations("settings");
  const [name] = useState(user.name ?? "");
  const [email] = useState(user.email);
  const [dob] = useState(user.dateOfBirth ?? "");

  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [workAddress, setWorkAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [workLatitude, setWorkLatitude] = useState<number | null>(null);
  const [workLongitude, setWorkLongitude] = useState<number | null>(null);

  const [preferredConsultationType, setPreferredConsultationType] =
    useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchPatientProfile() {
      try {
        setIsLoadingProfile(true);
        setErrorMessage("");

        const response = await fetch(`/api/patient-profile/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data?.error || "Failed to load patient profile.");
          return;
        }

        const profile: PatientProfileData = data.patientProfile;

        setGender(profile.gender ?? "");
        setPhoneNumber(profile.phoneNumber ?? "");
        setWorkAddress(profile.address ?? "");
        setCity(profile.city ?? "");
        setCountry(profile.country ?? "");
        setZipCode(profile.zipCode ?? "");
        setGooglePlaceId(profile.googlePlaceId ?? "");
        setWorkLatitude(profile.latitude ?? null);
        setWorkLongitude(profile.longitude ?? null);
        setPreferredConsultationType(profile.preferredConsultationType ?? "");
        setPreferredLanguage(profile.preferredLanguage ?? "");
      } catch {
        setErrorMessage("Failed to load patient profile.");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    if (user.id) {
      fetchPatientProfile();
    }
  }, [user.id]);

  function nullableString(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async function handleSaveChanges() {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/patient-profile/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gender: nullableString(gender),
          phoneNumber: nullableString(phoneNumber),

          address: nullableString(workAddress),
          city: nullableString(city),
          country: nullableString(country),
          zipCode: nullableString(zipCode),
          latitude: workLatitude,
          longitude: workLongitude,
          googlePlaceId: nullableString(googlePlaceId),

          preferredConsultationType:
            nullableString(preferredConsultationType),
          preferredLanguage: nullableString(preferredLanguage),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || "Failed to update profile.");
        return;
      }

      setSuccessMessage("Profile updated successfully.");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
  <div className="mx-auto flex max-w-xl flex-col justify-center space-y-5">
  <div>
    <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
      {t("editProfile.patientProfile")}
    </p>

    <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
      {t("editProfile.title")}
    </h2>

    <div className="my-4 border-t border-gray-300" />
  </div>

  <div className="space-y-4 rounded-2xl p-6">
    <InputField
      label={t("editProfile.fullName")}
      placeholder={t("editProfile.fullNamePlaceholder")}
      value={name}
      onChange={() => {}}
      icon={<User size={16} />}
      disabled
      styleChange="bg-gray-200"
    />

    <InputField
      label={t("editProfile.email")}
      placeholder={t("editProfile.emailPlaceholder")}
      value={email}
      onChange={() => {}}
      disabled
      icon={<Mail size={16} />}
      styleChange="bg-gray-200"
    />

    <InputField
      label={t("editProfile.dateOfBirth")}
      type="date"
      placeholder={t("editProfile.dateOfBirthPlaceholder")}
      value={dob}
      onChange={() => {}}
      disabled
      icon={<CalendarDays size={16} />}
      styleChange="bg-gray-200"
    />

    <div className="my-6 border-t border-gray-200" />

    <div>
      <p className="mb-2 block text-sm font-medium text-black">
        {t("editProfile.gender")}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {["male", "female", "other"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setGender(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition active:scale-[0.98] ${
              gender === option
                ? "border-[#d8bd8d] bg-[#283C5D] text-white"
                : "border-black/10 bg-white/85 text-black/60 hover:bg-white"
            }`}
          >
            {t(`editProfile.genderOptions.${option}`)}
          </button>
        ))}
      </div>
    </div>

    <InputField
      label={t("editProfile.phoneNumber")}
      placeholder={t("editProfile.phonePlaceholder")}
      value={phoneNumber}
      onChange={setPhoneNumber}
      icon={<Phone size={16} />}
    />

    <GoogleClinicLocationFields
      workAddress={workAddress}
      city={city}
      country={country}
      zipCode={zipCode}
      onWorkAddressChange={setWorkAddress}
      onCityChange={setCity}
      onCountryChange={setCountry}
      onZipCodeChange={setZipCode}
      onGooglePlaceIdChange={setGooglePlaceId}
      onWorkLatitudeChange={setWorkLatitude}
      onWorkLongitudeChange={setWorkLongitude}
      onGoogleMapsUriChange={() => {}}
      onGoogleRatingChange={() => {}}
      onGoogleReviewCountChange={() => {}}
    />

    <div>
      <p className="mb-2 block text-sm font-medium text-black">
        {t("editProfile.preferredConsultationType")}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: t("editProfile.consultationOptions.inClinic"),
            value: "in_clinic",
          },
          {
            label: t("editProfile.consultationOptions.online"),
            value: "online",
          },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPreferredConsultationType(option.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.98] ${
              preferredConsultationType === option.value
                ? "border-[#d8bd8d] bg-[#283C5D] text-white"
                : "border-black/10 bg-white/85 text-black/60 hover:bg-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>

    <InputField
      label={t("editProfile.preferredLanguage")}
      placeholder={t("editProfile.preferredLanguagePlaceholder")}
      value={preferredLanguage}
      onChange={setPreferredLanguage}
      icon={<Languages size={16} />}
    />

    {successMessage ? (
      <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle2 size={16} />
        {successMessage}
      </div>
    ) : null}

    {errorMessage ? (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {errorMessage}
      </p>
    ) : null}

    <button
      type="button"
      onClick={handleSaveChanges}
      disabled={isSaving}
      className="mt-4 w-full rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSaving
        ? t("editProfile.saving")
        : t("editProfile.saveChanges")}
    </button>
  </div>
</div>
  );
}