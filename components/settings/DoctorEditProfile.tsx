"use client";

import { useState } from "react";
import { User, Mail, Building2, MapPin, Map, Globe, Hash } from "lucide-react";
import InputField from "@/components/UI/InputField";
import {formatLabel} from "@/utils/dashboard/helper";
import { Pencil } from "lucide-react";
import SpecialtyModal from "./UI/SpecialtyModal";
import CategoryProcedureModal from "./UI/CategoryProcedureModal";


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
    yearsOfExperience: number;
    specialtyIds: string[];
    subcategoryIds: string[];
    procedureIds: string[];
    subzoneIds: string[];
    workAddress: string;
    city: string | null;
    country: string | null;
    zipCode: string | null;
    workLatitude: number | null;
    workLongitude: number | null;
    googlePlaceId: string | null;
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
  const [modalType, setModalType] = useState<"specialtyIds" | "subcategoryIds" | null>(null);
  const [specialtyIds, setSpecialtyIds] = useState(doctorProfile?.specialtyIds ?? []);
  const [subcategoryIds, setSubcategoryIds] = useState(doctorProfile?.subcategoryIds ?? []);
  const [procedureIds, setProcedureIds] = useState(doctorProfile?.procedureIds ?? []);


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

        <InputField
          label="Clinic address"
          placeholder="Work address"
          value={workAddress}
          onChange={setWorkAddress}
          icon={<MapPin size={16} />}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <InputField
            label="City"
            placeholder="City"
            value={city}
            onChange={setCity}
            icon={<Map size={16} />}
          />

          <InputField
            label="Country"
            placeholder="Country"
            value={country}
            onChange={setCountry}
            icon={<Globe size={16} />}
          />

          <InputField
            label="Zip code"
            placeholder="Zip code"
            value={zipCode}
            onChange={setZipCode}
            icon={<Hash size={16} />}
          />
        </div>

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
              {(doctorProfile?.procedureIds ?? []).map((procedure) => (
                <Chip
                  key={procedure}
                  label={formatLabel(procedure)}
                />
              ))}
            </div>
          </div>
        </div>
            
        <button
          type="button"
          className="w-full rounded-full bg-gradient-to-r 
          from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white hover:bg-[#d8bd8d]"
        >
          Save changes
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
    selectedProcedureIds={doctorProfile?.procedureIds ?? []}
    onClose={() => setModalType(null)}
    onSaved={({ subcategoryIds, procedureIds }) => {
      setSubcategoryIds(subcategoryIds);
      setProcedureIds(procedureIds);
      setModalType(null);
    }}
  />
)}
    </div>
  );
}