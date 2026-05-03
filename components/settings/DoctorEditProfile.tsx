"use client";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

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
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Doctor Profile
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Edit Profile
        </h2>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <input
              defaultValue={user.name ?? ""}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
              placeholder="Doctor name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              defaultValue={user.email}
              disabled
              className="w-full rounded-xl border bg-gray-100 px-4 py-3 text-sm text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Clinic name</label>
          <input
            defaultValue={doctorProfile?.clinicName ?? ""}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
            placeholder="Clinic name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Work address</label>
          <input
            defaultValue={doctorProfile?.workAddress ?? ""}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
            placeholder="Work address"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            defaultValue={doctorProfile?.city ?? ""}
            className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
            placeholder="City"
          />

          <input
            defaultValue={doctorProfile?.country ?? ""}
            className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
            placeholder="Country"
          />

          <input
            defaultValue={doctorProfile?.zipCode ?? ""}
            className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
            placeholder="Zip code"
          />
        </div>

        <div className="space-y-4 rounded-xl bg-[#FAF9F7] p-4 text-sm text-gray-600">
          <div>
            <p className="mb-2 font-medium text-[#283C5D]">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {getSpecialties(doctorProfile?.specialtyIds ?? []).map((specialty) => (
                <Chip key={specialty} label={specialty} />
              ))}
            </div>
          </div>
            
          <div>
            <p className="mb-2 font-medium text-[#283C5D]">Categories</p>
            <div className="flex flex-wrap gap-2">
              {getCategories(doctorProfile?.subcategoryIds ?? []).map((category) => (
                <Chip key={category} label={category} />
              ))}
            </div>
          </div>
            
          <div>
            <p className="mb-2 font-medium text-[#283C5D]">Procedures</p>
            <div className="flex flex-wrap gap-2">
              {getProcedures(doctorProfile?.procedureIds ?? []).map((procedure) => (
                <Chip key={procedure} label={procedure} />
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
    </div>
  );
}