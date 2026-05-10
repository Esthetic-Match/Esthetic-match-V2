"use client";

import { useEffect, useState } from "react";
import ClinicBanner from "./UI/ClinicBanner";
import ImageUploadModal from "./UI/ImageUploadModal";
import type { DoctorProfileData } from "./types";
import { handleImageUpload } from "@/utils/dashboard/helper";
import { useTranslations } from "next-intl";

const fallbackBanner = "/dev/clinic-banner-placeholder.jpg";

type ClinicBannerManagerProps = {
  doctorId: string;
  clinicBanner: string;
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
  const [currentBanner, setCurrentBanner] = useState<string | null>(clinicBanner);

  useEffect(() => {
    setCurrentBanner(clinicBanner);
  }, [clinicBanner]);


async function handleBannerUploaded(url: string) {
  await handleImageUpload({
    newUrl: url,
    currentValue: currentBanner,
    setValue: setCurrentBanner,
    field: "clinicBanner",
    onUpdateProfile,
  });
}

async function handleDeleteBanner() {
  await handleImageUpload({
    newUrl: null,
    currentValue: currentBanner,
    fallbackValue: fallbackBanner,
    setValue: setCurrentBanner,
    field: "clinicBanner",
    onUpdateProfile,
  });
}

  return (
    <>
      <ClinicBanner
        clinicBanner={currentBanner}
        isLoading={isLoadingProfile}
        onEdit={() => setIsBannerModalOpen(true)}
      />

      <ImageUploadModal
        isOpen={isBannerModalOpen}
        ImagePath={`doctor-profile/${doctorId}/banner`}
        currentImage={
          currentBanner === fallbackBanner ? null : currentBanner
        }
        onClose={() => setIsBannerModalOpen(false)}
        onImageloaded={handleBannerUploaded}
        onDeleteBanner={handleDeleteBanner}
      />
    </>
  );
}