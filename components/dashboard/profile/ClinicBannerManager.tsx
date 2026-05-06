"use client";

import { useEffect, useState } from "react";
import ClinicBanner from "./UI/ClinicBanner";
import EditBannerModal from "./UI/EditBannerModal";
import type { DoctorProfileData } from "./types";

const fallbackBanner = "/dev/clinic-banner-placeholder.jpg";

type ClinicBannerManagerProps = {
  doctorId: string;
  clinicBanner: string;
  isLoadingProfile: boolean;
  onProfileUpdated: (profile: DoctorProfileData) => void;
};

export default function ClinicBannerManager({
  doctorId,
  clinicBanner,
  isLoadingProfile,
  onProfileUpdated,
}: ClinicBannerManagerProps) {
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(clinicBanner);

  useEffect(() => {
    setCurrentBanner(clinicBanner);
  }, [clinicBanner]);

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
    const previousBanner = currentBanner;

    setCurrentBanner(url);

    try {
      const data = await updateDoctorProfile({
        clinicBanner: url,
      });

      onProfileUpdated(data.profile);
    } catch {
      setCurrentBanner(previousBanner);
    }
  }

  async function handleDeleteBanner() {
    const previousBanner = currentBanner;

    setCurrentBanner(fallbackBanner);

    try {
      const data = await updateDoctorProfile({
        clinicBanner: null,
      });

      onProfileUpdated(data.profile);
    } catch {
      setCurrentBanner(previousBanner);
    }
  }

  return (
    <>
      <ClinicBanner
        clinicBanner={currentBanner}
        isLoading={isLoadingProfile}
        onEdit={() => setIsBannerModalOpen(true)}
      />

      <EditBannerModal
        isOpen={isBannerModalOpen}
        doctorId={doctorId}
        currentBanner={
          currentBanner === fallbackBanner ? null : currentBanner
        }
        onClose={() => setIsBannerModalOpen(false)}
        onBannerUploaded={handleBannerUploaded}
        onDeleteBanner={handleDeleteBanner}
      />
    </>
  );
}