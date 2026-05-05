"use client";

import { useState } from "react";
import InputField from "../UI/InputField";
import { User, Mail, CalendarDays } from "lucide-react";

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
  const [name, setName] = useState(user.name ?? "");
  const [email] = useState(user.email); // read-only
  const [dob, setDob] = useState(user.dateOfBirth ?? "");

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Patient Profile
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Edit Profile
        </h2>
        <div className="border-t border-gray-300 my-4"></div>
      </div>

      <div className="space-y-4 rounded-2xl p-6">

        <InputField
          label="Full name"
          placeholder="Your name"
          value={name}
          onChange={setName}
          icon={<User size={16} />}
        />

        <InputField
          label="Email"
          placeholder="Email"
          value={email}
          onChange={() => {}}
          disabled
          icon={<Mail size={16} />}
          styleChange={"bg-gray-200"}
        />

        <InputField
          label="Date of birth"
          type="date"
          placeholder="Date of birth"
          value={dob}
          onChange={setDob}
          icon={<CalendarDays size={16} />}
        />

        <button
          type="button"
          className="w-full mt-4 rounded-full bg-gradient-to-r 
          from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}