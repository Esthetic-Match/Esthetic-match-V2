"use client";

import { useEffect, useState } from "react";
import ClinicBanner from "./UI/ClinicBanner";
import EditBannerModal from "./UI/EditBannerModal";

const fallbackBanner = "/dev/clinic-banner-placeholder.jpg";

type DoctorProfileData = {
  id: string;
  userId: string;
  clinicName: string;
  clinicBanner: string | null;
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
};

type ClinicBannerManagerProps = {
  doctorId: string;
};

export default function ClinicBannerManager({
  doctorId,
}: ClinicBannerManagerProps) {
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [clinicBanner, setClinicBanner] = useState<string | null>(fallbackBanner);
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchDoctorProfile() {
      try {
        const res = await fetch("/api/doctor-profile", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Could not fetch doctor profile.");
        }

        const data = await res.json();

        setProfile(data.profile);

        if (data.profile?.clinicBanner) {
          setClinicBanner(data.profile.clinicBanner);
        } else {
          setClinicBanner(fallbackBanner);
        }
      } catch {
        setClinicBanner(fallbackBanner);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchDoctorProfile();
  }, []);

  async function updateDoctorProfile(data: { clinicBanner: string | null }) {
    const res = await fetch("/api/doctor-profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Could not update doctor profile.");
    }

    return res.json();
  }

  async function handleBannerUploaded(url: string) {
    const previousBanner = clinicBanner;

    setClinicBanner(url);

    try {
      const data = await updateDoctorProfile({
        clinicBanner: url,
      });

      setProfile(data.profile);
    } catch {
      setClinicBanner(previousBanner);
    }
  }

  async function handleDeleteBanner() {
    const previousBanner = clinicBanner;

    setClinicBanner(fallbackBanner);

    try {
      const data = await updateDoctorProfile({
        clinicBanner: null,
      });

      setProfile(data.profile);
    } catch {
      setClinicBanner(previousBanner);
    }
  }

  return (
    <>
      <ClinicBanner
        clinicBanner={clinicBanner}
        isLoading={isLoadingProfile}
        onEdit={() => setIsBannerModalOpen(true)}
      />

      <EditBannerModal
        isOpen={isBannerModalOpen}
        doctorId={doctorId}
        currentBanner={profile?.clinicBanner}
        onClose={() => setIsBannerModalOpen(false)}
        onBannerUploaded={handleBannerUploaded}
        onDeleteBanner={handleDeleteBanner}
      />
    </>
  );
}