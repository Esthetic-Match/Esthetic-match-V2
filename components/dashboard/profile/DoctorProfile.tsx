"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import ClinicBannerManager from "./ClinicBannerManager";
import ProfileHeader from "./ProfileHeader";
import type { DoctorProfileData } from "./types";
import ExpertiseSection from "./ExpertiseSection";
import BookingAndPrices from "./BookingAndPrices";
import Gallery from "./patientGallery/Gallery";
import GoogleReviewsList from "@/components/UI/GoogleReviewsList";
import DoctorInstagramReelsManager from "./DoctorInstagramReelsManager";
import TopThreeProceduresSection from "./TopThreeProceduresSection";

const fallbackBanner = "/images/fallback/blue-bg.png";

type DoctorProfileResponse = {
  onboardingCompleted: boolean;
  profile: DoctorProfileData | null;
};

export default function DoctorProfile({ user }: { user: { id: string } }) {
  const router = useRouter();

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

        const data = (await res.json()) as DoctorProfileResponse;

        if (!data.onboardingCompleted) {
          router.replace("/dashboard");
          return;
        }

        if (!data.profile) {
          router.replace("/dashboard");
          return;
        }

        setProfile(data.profile);
      } catch {
        setProfile(null);
        router.replace("/dashboard");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchDoctorProfile();
  }, [router]);

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

      const result = (await res.json()) as {
        profile: DoctorProfileData;
      };

      setProfile(result.profile);
    } catch {
      setProfile(previousProfile);
    }
  }

  if (isLoadingProfile || !profile) {
    return null;
  }

  return (
    <div className="p-2">
      <ClinicBannerManager
        doctorId={user.id}
        clinicBanner={profile.clinicBanner || fallbackBanner}
        isLoadingProfile={isLoadingProfile}
        onUpdateProfile={updateDoctorProfile}
      />

      <ProfileHeader
        userId={user.id}
        doctorId={profile.id}
        slug={profile.slug}
        name={profile.user?.name || "Doctor"}
        avatar={profile.avatar || profile.user?.image}
        specialty={profile.specialtyIds || []}
        clinicName={profile.clinicName}
        RPPS={profile.RPPS}
        workAddress={profile.workAddress}
        yearsOfExperience={profile.yearsOfExperience}
        onUpdateProfile={updateDoctorProfile}
      />

      <TopThreeProceduresSection
        procedureIds={profile.procedureIds}
        topThree={profile.topThree}
      />

      <BookingAndPrices
        inClinicPrice={profile.inClinicPrice}
        onlineConsulPrice={profile.onlineConsulPrice}
        bookingLinks={profile.bookingLinks}
        clinicName={profile.clinicName}
        onUpdateProfile={updateDoctorProfile}
        workLatitude={profile.workLatitude}
        onlineActive={profile.onlineActive}
        workLongitude={profile.workLongitude}
        googlePlaceId={profile.googlePlaceId}
        stripeConnectOnboardingComplete={profile.stripeConnectOnboardingComplete}
        googleReviewCount={profile.googleReviewCount}
        googleRating={profile.googleRating}
        currency={profile.currency}
      />
      
      <GoogleReviewsList googlePlaceId={profile.googlePlaceId} />

      <DoctorInstagramReelsManager doctorProfileId={profile.id} />
      
      <ExpertiseSection
        userId={user.id}
        specialtyIds={profile.specialtyIds}
        subcategoryIds={profile.subcategoryIds}
        procedureIds={profile.procedureIds}
      />

      <Gallery
        userId={user.id}
        procedureIds={profile.procedureIds}
      />
    </div>
  );
}