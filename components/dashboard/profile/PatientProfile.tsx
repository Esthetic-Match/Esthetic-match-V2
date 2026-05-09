"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Camera,
  CreditCard,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  User,
  Video,
} from "lucide-react";
import ImageUploadModal from "./UI/ImageUploadModal";

type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: string;
};

type PatientProfileData = {
  id: string;
  userId: string;
  avatar: string | null;
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
  notes: string | null;
  stripeCustomerId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    dateOfBirth: string | null;
  };
};

type PatientProfileProps = {
  user: SessionUser;
};

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return email?.[0]?.toUpperCase() ?? "P";
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "Not added";
}

function formatConsultationType(value?: string | null) {
  if (value === "in_clinic") return "In clinic";
  if (value === "online") return "Online";
  return "Not selected";
}

export default function PatientProfile({ user }: PatientProfileProps) {
  const [patient, setPatient] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  async function fetchPatientProfile() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch(`/api/patient-profile/${user.id}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || "Failed to load patient profile.");
        return;
      }

      setPatient(data.patientProfile);
    } catch {
      setErrorMessage("Failed to load patient profile.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user.id) {
      fetchPatientProfile();
    }
  }, [user.id]);

  async function handleAvatarUploaded(url: string) {
    const response = await fetch(`/api/patient-profile/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatar: url }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(data?.error || "Failed to update avatar.");
      return;
    }

    setPatient(data.patientProfile);
  }

  async function handleDeleteAvatar() {
    const response = await fetch(`/api/patient-profile/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatar: null }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(data?.error || "Failed to delete avatar.");
      return;
    }

    setPatient(data.patientProfile);
    setIsAvatarModalOpen(false);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-lg">
        <p className="text-sm text-[#283C5D]/60">Loading profile...</p>
      </div>
    );
  }

  if (errorMessage || !patient) {
    return (
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-lg">
        <p className="text-sm text-red-500">
          {errorMessage || "Patient profile not found."}
        </p>
      </div>
    );
  }

  const name = patient.user.name ?? user.name ?? "Patient";
  const email = patient.user.email ?? user.email;
  const avatar = patient.avatar || patient.user.image || user.image;
  const initials = getInitials(name, email);

  const fullAddress = [
    patient.address,
    patient.city,
    patient.zipCode,
    patient.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="relative z-20 mx-auto max-w-6xl rounded-3xl border border-gray-300/10 bg-white px-6 py-8 shadow-lg md:px-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="relative flex-shrink-0">
          <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#283c5d] shadow-md">
            {avatar ? (
              <Image
                src={avatar}
                alt={`${name} profile photo`}
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <span className="text-3xl font-semibold text-white">
                {initials}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#283C5D] shadow-md transition hover:bg-[#283c5d] hover:text-white active:scale-[0.96]"
            aria-label="Edit profile photo"
          >
            <Camera size={18} />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl">
                {name}
              </h1>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#283C5D]/75">
                  <User size={17} className="text-[#d8bd8d]" />
                  <span>{email}</span>
                </div>

                {fullAddress ? (
                  <div className="flex items-center gap-3 text-sm text-[#283C5D]/75">
                    <MapPin size={17} className="text-[#283C5D]/55" />
                    <span>{fullAddress}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <Link
              href="/dashboard/settings"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-2 text-sm font-medium text-[#283C5D] shadow-sm transition hover:bg-[#FAF9F7] active:scale-[0.98]"
            >
              <Pencil size={18} />
              <span>Edit Profile</span>
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 border-t border-black/10 pt-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">Gender</p>
              <p className="mt-2 text-sm font-semibold text-[#283C5D]">
                {formatValue(patient.gender)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">
                Date of birth
              </p>
              <p className="mt-2 text-sm font-semibold text-[#283C5D]">
                {formatValue(patient.user.dateOfBirth)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">
                Preferred consultation
              </p>
              <p className="mt-2 text-sm font-semibold text-[#283C5D]">
                {formatConsultationType(patient.preferredConsultationType)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#283C5D]">
            <Phone size={17} className="text-[#d8bd8d]" />
            Contact
          </div>

          <div className="space-y-3 text-sm text-[#283C5D]/75">
            <p>
              <span className="font-medium text-[#283C5D]">Phone:</span>{" "}
              {formatValue(patient.phoneNumber)}
            </p>
            <p>
              <span className="font-medium text-[#283C5D]">Email:</span>{" "}
              {email}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#283C5D]">
            {patient.preferredConsultationType === "online" ? (
              <Video size={17} className="text-[#d8bd8d]" />
            ) : (
              <Building2 size={17} className="text-[#d8bd8d]" />
            )}
            Preferences
          </div>

          <div className="space-y-3 text-sm text-[#283C5D]/75">
            <p>
              <span className="font-medium text-[#283C5D]">
                Consultation:
              </span>{" "}
              {formatConsultationType(patient.preferredConsultationType)}
            </p>
            <p>
              <span className="font-medium text-[#283C5D]">Language:</span>{" "}
              {formatValue(patient.preferredLanguage)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#283C5D]">
            <CreditCard size={17} className="text-[#d8bd8d]" />
            Payments
          </div>

          <div className="rounded-2xl bg-[#FAF9F7] px-4 py-4 text-sm text-[#283C5D]/75">
            {patient.stripeCustomerId ? (
              <p>Payment profile connected.</p>
            ) : (
              <p>No payment profile connected yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#283C5D]">
          <MessageSquare size={17} className="text-[#d8bd8d]" />
          Notes
        </div>

        <p className="min-h-20 rounded-2xl bg-[#FAF9F7] px-4 py-4 text-sm leading-6 text-[#283C5D]/75">
          {patient.notes?.trim() || "No notes added yet."}
        </p>
      </div>

      <ImageUploadModal
        isOpen={isAvatarModalOpen}
        ImagePath={`patient-profile/${user.id}/avatar`}
        currentImage={patient.avatar}
        onClose={() => setIsAvatarModalOpen(false)}
        onImageloaded={handleAvatarUploaded}
        onDeleteBanner={handleDeleteAvatar}
      />
    </section>
  );
}