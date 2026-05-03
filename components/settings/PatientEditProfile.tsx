"use client";

type PatientEditProfileProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    dateOfBirth: string | null;
    image: string | null;
  };
  patientProfile: {
    id: string;
  } | null;
};

export default function PatientEditProfile({
  user,
}: PatientEditProfileProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Patient Profile
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Edit Profile
        </h2>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full name</label>
          <input
            defaultValue={user.name ?? ""}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
            placeholder="Your name"
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Date of birth</label>
          <input
            type="date"
            defaultValue={user.dateOfBirth ?? ""}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
          />
        </div>

        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-r 
              from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white hover:bg-[#d8bd8d]"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}