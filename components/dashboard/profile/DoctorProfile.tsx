"use client";

import { useEffect, useState } from "react";
import ClinicBannerManager from "./ClinicBannerManager";
import ProfileHeader from "./ProfileHeader"
import type { DoctorProfileData } from "./types";

const fallbackBanner = "/images/fallback/blue-bg.png";

export default function DoctorProfile({ user }: { user: { id: string } }) {
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
      } catch {
        setProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchDoctorProfile();
  }, []);

  return (
    <div className="p-2">
      <ClinicBannerManager
        doctorId={user.id}
        clinicBanner={profile?.clinicBanner || fallbackBanner}
        isLoadingProfile={isLoadingProfile}
        onProfileUpdated={setProfile}
      />
        <ProfileHeader
          name={profile?.user?.name || "Doctor"}
          avatar={profile?.avatar || profile?.user?.image}
          specialty={profile?.specialtyIds?.[0] || "Aesthetic Doctor"}
          clinicName={profile?.clinicName}
          workAddress={profile?.workAddress}
          yearsOfExperience={profile?.yearsOfExperience}
        />
    </div>
  );
}