"use client";

import { useEffect, useState } from "react";
import ClinicBannerManager from "./ClinicBannerManager";
import ProfileHeader from "./ProfileHeader"
import type { DoctorProfileData } from "./types";
import ExpertiseSection from "./ExpertiseSection";
import BookingAndPrices from "./BookingAndPrices";
import Gallery from "./patientGallery/Gallery";

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

  async function updateDoctorProfile(
      data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
    ) {
      if (!profile) return;

      const previousProfile = profile;

      setProfile((prev) => (prev ? { ...prev, ...data } : prev));

      try {
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

        const result = await res.json();

        setProfile(result.profile);
      } catch {
        // rollback
        setProfile(previousProfile);
      }
    }

  return (
    <div className="p-2">
      <ClinicBannerManager
          doctorId={user.id}
          clinicBanner={profile?.clinicBanner || fallbackBanner}
          isLoadingProfile={isLoadingProfile}
          onUpdateProfile={updateDoctorProfile}
        />
        <ProfileHeader
          doctorId={user.id}
          name={profile?.user?.name || "Doctor"}
          avatar={profile?.avatar || profile?.user?.image}
          specialty={profile?.specialtyIds || []}
          clinicName={profile?.clinicName}
          workAddress={profile?.workAddress}
          yearsOfExperience={profile?.yearsOfExperience}
          topThree={profile?.topThree}
          onUpdateProfile={updateDoctorProfile}
        />
        <ExpertiseSection
          procedureIds={profile?.procedureIds || []}
          paidPlan={profile?.paidPlan || "free"}
        />
        <BookingAndPrices
          inClinicPrice={profile?.inClinicPrice}
          onlineConsulPrice={profile?.onlineConsulPrice}
          bookingLink={profile?.bookingLink}
          socialMediaLink={profile?.SocialMediaLink}
          onUpdateProfile={updateDoctorProfile}
          workLatitude={profile?.workLatitude}
          workLongitude={profile?.workLongitude}
          googlePlaceId={profile?.googlePlaceId}
        />
        <Gallery userId={user.id}/>
    </div>
  );
}