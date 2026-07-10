"use client";

import { useState } from "react";
import { Building2, Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";
import InputField from "@/components/UI/InputField";
import GoogleClinicLocationFields from "@/components/UI/GoogleClinicLocationFields";

type DoctorEditProfileProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    dateOfBirth: string | null;
    image: string | null;
  };
  doctorProfile: {
    id: string;
    clinicName: string;
    yearsOfExperience?: number | null;
    workAddress: string;
    city: string | null;
    country: string | null;
    zipCode: string | null;
    RPPS: string | null;
    workLatitude: number | null;
    workLongitude: number | null;
    googlePlaceId: string | null;
    googleMapsUri?: string | null;
    googleRating?: number | null;
    googleReviewCount?: number | null;
  } | null;
};

export default function DoctorEditProfile({
  user,
  doctorProfile,
}: DoctorEditProfileProps) {
  const t = useTranslations("settings");

  const [name, setName] = useState(user.name ?? "");
  const [email] = useState(user.email);

  const [clinicName, setClinicName] = useState(
    doctorProfile?.clinicName ?? ""
  );

  const [workAddress, setWorkAddress] = useState(
    doctorProfile?.workAddress ?? ""
  );

  const [city, setCity] = useState(
    doctorProfile?.city ?? ""
  );

  const [country, setCountry] = useState(
    doctorProfile?.country ?? ""
  );

  const [zipCode, setZipCode] = useState(
    doctorProfile?.zipCode ?? ""
  );

  const [yoe, setYoe] = useState(
    doctorProfile?.yearsOfExperience ?? 0
  );

  const [googlePlaceId, setGooglePlaceId] = useState(
    doctorProfile?.googlePlaceId ?? ""
  );

  const [workLatitude, setWorkLatitude] = useState<number | null>(
    doctorProfile?.workLatitude ?? null
  );

  const [workLongitude, setWorkLongitude] = useState<number | null>(
    doctorProfile?.workLongitude ?? null
  );

  const [googleMapsUri, setGoogleMapsUri] = useState<string | null>(
    doctorProfile?.googleMapsUri ?? null
  );

  const [googleRating, setGoogleRating] = useState<number | null>(
    doctorProfile?.googleRating ?? null
  );

  const [googleReviewCount, setGoogleReviewCount] = useState<
    number | null
  >(doctorProfile?.googleReviewCount ?? null);

  const [RPPS, setRPPS] = useState(
    doctorProfile?.RPPS ?? ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  async function handleSaveProfile() {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const response = await fetch("/api/doctor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name,
          clinicName,
          RPPS,
          yearsOfExperience: yoe,
          workAddress,
          city,
          country,
          zipCode,
          googlePlaceId,
          googleMapsUri,
          googleRating,
          googleReviewCount,
          workLatitude,
          workLongitude,
        }),
      });

      if (!response.ok) {
        const result = (await response
          .json()
          .catch(() => null)) as unknown;

        const message =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "Failed to save profile.";

        throw new Error(message);
      }

      setSaveSuccess("Profile saved successfully.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          {t("doctorEditProfile.doctorProfile")}
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          {t("doctorEditProfile.title")}
        </h2>

        <div className="my-4 border-t border-gray-300" />
      </div>

      <div className="space-y-4 rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label={t("doctorEditProfile.fullName")}
            placeholder={t(
              "doctorEditProfile.doctorNamePlaceholder"
            )}
            value={name}
            onChange={setName}
            disabled
            icon={<User size={16} />}
            styleChange="bg-gray-400"
          />

          <InputField
            label={t(
              "doctorEditProfile.emailCannotEdit"
            )}
            placeholder={t(
              "doctorEditProfile.emailPlaceholder"
            )}
            value={email}
            onChange={() => {}}
            icon={<Mail size={16} />}
            disabled
            styleChange="bg-gray-400"
          />
        </div>

        <InputField
          label={t(
            "doctorEditProfile.yearsOfExperience"
          )}
          placeholder={t(
            "doctorEditProfile.yearsPlaceholder"
          )}
          value={yoe.toString()}
          type="number"
          onChange={() => {}}
          onNumberChange={setYoe}
          icon={<Building2 size={15} />}
        />

        <InputField
          label={t("doctorEditProfile.clinicName")}
          placeholder={t(
            "doctorEditProfile.clinicNamePlaceholder"
          )}
          value={clinicName}
          onChange={setClinicName}
          icon={<Building2 size={16} />}
        />

        <InputField
          label={t("doctorEditProfile.RPPS")}
          placeholder={t(
            "doctorEditProfile.RPPSPlaceholder"
          )}
          value={RPPS}
          onChange={setRPPS}
          icon={<Building2 size={16} />}
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
          onGoogleMapsUriChange={setGoogleMapsUri}
          onGoogleRatingChange={setGoogleRating}
          onGoogleReviewCountChange={
            setGoogleReviewCount
          }
        />

        {saveError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {saveError}
          </p>
        ) : null}

        {saveSuccess ? (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {saveSuccess}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-black hover:bg-[#d8bd8d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? t("doctorEditProfile.saving")
            : t("doctorEditProfile.saveChanges")}
        </button>
      </div>
    </div>
  );
}