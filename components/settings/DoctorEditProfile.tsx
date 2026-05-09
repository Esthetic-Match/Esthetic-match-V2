"use client";

import { useState } from "react";
import { User, Mail, Building2 } from "lucide-react";
import InputField from "@/components/UI/InputField";
import {formatLabel} from "@/utils/dashboard/helper";
import { Pencil } from "lucide-react";
import SpecialtyModal from "./UI/SpecialtyModal";
import CategoryProcedureModal from "./UI/CategoryProcedureModal";
import TopThreeProceduresModal from "./UI/TopThreeProceduresModal";
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
  specialtyIds: string[];
  subcategoryIds: string[];
  procedureIds: string[];
  subzoneIds: string[];
  workAddress: string;
  city: string | null;
  country: string | null;
  zipCode: string | null;
  topThree?: string[];
  workLatitude: number | null;
  workLongitude: number | null;
  googlePlaceId: string | null;
  googleMapsUri?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  otherSpecialtyText: string | null;
} | null; 
};

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white border border-1 px-3 py-1 text-xs font-medium text-[#283C5D]">
      {label}
    </span>
  );
}

export default function DoctorEditProfile({
  user,
  doctorProfile,
}: DoctorEditProfileProps) {
  const [name, setName] = useState(user.name ?? "");
  const [email] = useState(user.email);
  const [clinicName, setClinicName] = useState(doctorProfile?.clinicName ?? "");
  const [workAddress, setWorkAddress] = useState(
    doctorProfile?.workAddress ?? ""
  );
  const [city, setCity] = useState(doctorProfile?.city ?? "");
  const [country, setCountry] = useState(doctorProfile?.country ?? "");
  const [zipCode, setZipCode] = useState(doctorProfile?.zipCode ?? "");
  const [yoe, setYoe] = useState(doctorProfile?.yearsOfExperience ?? 0);
  const [modalType, setModalType] = useState<"specialtyIds" | "subcategoryIds" | "topThree" | null>(null);
  const [specialtyIds, setSpecialtyIds] = useState(doctorProfile?.specialtyIds ?? []);
  const [subcategoryIds, setSubcategoryIds] = useState(doctorProfile?.subcategoryIds ?? []);
  const [procedureIds, setProcedureIds] = useState(doctorProfile?.procedureIds ?? []);
  const [topThree, setTopThree] = useState(doctorProfile?.topThree ?? []);
  const [googlePlaceId, setGooglePlaceId] = useState(doctorProfile?.googlePlaceId ?? "");
  const [workLatitude, setWorkLatitude] = useState<number | null>(doctorProfile?.workLatitude ?? null);
  const [workLongitude, setWorkLongitude] = useState<number | null>(doctorProfile?.workLongitude ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [googleMapsUri, setGoogleMapsUri] = useState(doctorProfile?.googleMapsUri ?? null);
  const [googleRating, setGoogleRating] = useState(doctorProfile?.googleRating ?? null);
  const [googleReviewCount, setGoogleReviewCount] = useState(doctorProfile?.googleReviewCount ?? null);

  async function handleSaveProfile() {
  try {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const res = await fetch("/api/doctor-profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        name,
        clinicName,
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

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Failed to save profile.");
    }

    setSaveSuccess("Profile saved successfully.");
  } catch (error) {
    setSaveError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  } finally {
    setIsSaving(false);
  }
}

function syncTopThreeWithProcedures(
  topThree: string[],
  procedureIds: string[]
) {
  const allowedProcedures = new Set(procedureIds);

  return topThree.filter((procedureId) =>
    allowedProcedures.has(procedureId)
  );
}

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Doctor Profile
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Edit Profile
        </h2>
        <div className="border-t border-gray-300 my-4"/>
      </div>

      <div className="space-y-4 rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Full name"
            placeholder="Doctor name"
            value={name}
            onChange={setName}
            icon={<User size={16} />}
          />

          <InputField
            label="Email (cannot be edited)"
            placeholder="Email"
            value={email}
            onChange={() => {}}
            icon={<Mail size={16} />}
            disabled
            styleChange={"bg-gray-400"}
          />
        </div>

        <InputField
          label={"Years of Experience"}
          placeholder={"0"}
          value={yoe?.toString() ?? ""}
          type="number"
          onChange={() => {}}
          onNumberChange={setYoe}
          icon={<Building2 size={15} />}
        />

        <InputField
          label="Clinic name"
          placeholder="Clinic name"
          value={clinicName}
          onChange={setClinicName}
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
          onGoogleReviewCountChange={setGoogleReviewCount}
        />

        {/* Specialties, categories, procedures sections */}
        <div className="space-y-4 rounded-xl bg-[#FAF9F7] p-4 text-sm text-gray-600">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-[#283C5D]">Specialties</p>

              <button
                type="button"
                onClick={() => setModalType("specialtyIds")}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
              >
                <Pencil size={14} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(doctorProfile?.specialtyIds ?? []).map((specialty) => (
                <Chip key={specialty} label={formatLabel(specialty)} />
              ))}
            </div>
          </div>

            <div className="border-t border-gray-300 my-4"/>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-[#283C5D]">Categories</p>
            
              <button
                type="button"
                onClick={() => setModalType("subcategoryIds")}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
              >
                <Pencil size={14} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(doctorProfile?.subcategoryIds ?? []).map((category) => (
                 <Chip key={category} label={formatLabel(category)} />
              ))}
            </div>
          </div>
            
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-[#283C5D]">Procedures</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {procedureIds.map((procedure) => (
                <Chip key={procedure} label={formatLabel(procedure)} />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 my-4" />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-[#283C5D]">Top 3 Procedures</p>

            <button
              type="button"
              onClick={() => setModalType("topThree")}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
            >
              <Pencil size={14} />
            </button>
          </div>

          {(doctorProfile?.topThree ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topThree.map((procedure) => (
                <Chip key={procedure} label={formatLabel(procedure)} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-3 text-xs text-[#283C5D]/60">
              You have not selected your top three procedures yet.
            </p>
          )}
        </div>
            
        {saveError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {saveError}
          </p>
        )}
        
        {saveSuccess && (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {saveSuccess}
          </p>
        )}
        
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full rounded-full bg-gradient-to-r 
          from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white 
          hover:bg-[#d8bd8d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        

      </div>
      {modalType === "specialtyIds" && (
        <SpecialtyModal
          open={true}
          selectedIds={specialtyIds}
          onClose={() => setModalType(null)}
          onSaved={(updatedIds) => {
            setSpecialtyIds(updatedIds);
            setModalType(null);
          }}
        />
      )}

      {modalType === "subcategoryIds" && (
        <CategoryProcedureModal
          open={true}
          specialtyIds={specialtyIds}
          selectedCategoryIds={subcategoryIds}
          selectedProcedureIds={procedureIds}
          onClose={() => setModalType(null)}
          onSaved={({ subcategoryIds, procedureIds }) => {
            const syncedTopThree = syncTopThreeWithProcedures(topThree, procedureIds);
          
            setSubcategoryIds(subcategoryIds);
            setProcedureIds(procedureIds);
            setTopThree(syncedTopThree);
          
            fetch("/api/doctor-profile", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: user.id,
                subcategoryIds,
                procedureIds,
                topThree: syncedTopThree,
              }),
            });
          
            setModalType(null);
          }}
        />
      )}
      {modalType === "topThree" && (
        <TopThreeProceduresModal
          open
          selectedProcedureIds={procedureIds}
          selectedTopThree={topThree}
          onClose={() => setModalType(null)}
          onSaved={(updatedTopThree) => {
            setTopThree(updatedTopThree);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}