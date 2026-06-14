"use client";

import { useState } from "react";
import ClinicBanner from "./UI/ClinicBanner";
import ImageUploadModal from "./UI/ImageUploadModal";
import type { DoctorProfileData } from "./types";
import { handleImageUpload } from "@/lib/helpers/helper";

const fallbackBanner = "/dev/clinic-banner-placeholder.jpg";

type ClinicBannerManagerProps = {
  doctorId: string;
  clinicBanner: string | null;
  isLoadingProfile: boolean;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void;
};

export default function ClinicBannerManager({
  doctorId,
  clinicBanner,
  isLoadingProfile,
  onUpdateProfile,
}: ClinicBannerManagerProps) {
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<string | null>(null);

  const displayedBanner = currentBanner ?? clinicBanner ?? fallbackBanner;

  async function handleBannerUploaded(url: string) {
    await handleImageUpload({
      newUrl: url,
      currentValue: displayedBanner,
      setValue: setCurrentBanner,
      field: "clinicBanner",
      onUpdateProfile,
    });
  }

  async function handleDeleteBanner() {
    await handleImageUpload({
      newUrl: null,
      currentValue: displayedBanner,
      fallbackValue: fallbackBanner,
      setValue: setCurrentBanner,
      field: "clinicBanner",
      onUpdateProfile,
    });
  }

  return (
    <>
      <ClinicBanner
        clinicBanner={displayedBanner}
        isLoading={isLoadingProfile}
        onEdit={() => setIsBannerModalOpen(true)}
      />

      <ImageUploadModal
        isOpen={isBannerModalOpen}
        ImagePath={`doctor-profile/${doctorId}/banner`}
        currentImage={displayedBanner === fallbackBanner ? null : displayedBanner}
        onClose={() => setIsBannerModalOpen(false)}
        onImageloaded={handleBannerUploaded}
        onDeleteBanner={handleDeleteBanner}
      />
    </>
  );
}