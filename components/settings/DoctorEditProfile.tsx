"use client";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { useState } from "react";
import { User, Mail, Building2, MapPin, Map, Globe, Hash } from "lucide-react";
import InputField from "@/components/UI/InputField";


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

function getSpecialties(ids: string[]) {
  return DoctorCatalog.specialties.items.filter((specialty) =>
    ids.includes(specialty)
  );
}

function getCategories(ids: string[]) {
  return DoctorCatalog.categories
    .filter((category) => ids.includes(category.category))
    .map((category) => category.category);
}

function getProcedures(ids: string[]) {
  return DoctorCatalog.categories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      subcategory.procedures
        .filter((procedure) => ids.includes(procedure.id))
        .map((procedure) => procedure.name)
    )
  );
}

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Doctor Profile
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Edit Profile
        </h2>
        <div className="border-t border-gray-300 my-4"></div>
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
            label="Email"
            placeholder="Email"
            value={email}
            onChange={() => {}}
            icon={<Mail size={16} />}
            disabled
          />
        </div>

        <InputField
          label="Clinic name"
          placeholder="Clinic name"
          value={clinicName}
          onChange={setClinicName}
          icon={<Building2 size={16} />}
        />

        <InputField
          label="Work address"
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

        <div className="space-y-4 rounded-xl bg-[#FAF9F7] p-4 text-sm text-gray-600">
          <div>
            <p className="mb-2 font-medium text-[#283C5D]">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {getSpecialties(doctorProfile?.specialtyIds ?? []).map(
                (specialty) => (
                  <Chip key={specialty} label={specialty} />
                )
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-[#283C5D]">Categories</p>
            <div className="flex flex-wrap gap-2">
              {getCategories(doctorProfile?.subcategoryIds ?? []).map(
                (category) => (
                  <Chip key={category} label={category} />
                )
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-[#283C5D]">Procedures</p>
            <div className="flex flex-wrap gap-2">
              {getProcedures(doctorProfile?.procedureIds ?? []).map(
                (procedure) => (
                  <Chip key={procedure} label={procedure} />
                )
              )}
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
    </div>
  );
}