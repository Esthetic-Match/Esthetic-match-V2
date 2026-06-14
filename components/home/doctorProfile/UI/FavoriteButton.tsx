"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

type DoctorFavoriteButtonProps = {
  doctorProfileId: string;
};

export default function FavoriteButton({
  doctorProfileId,
}: DoctorFavoriteButtonProps) {
  const router = useRouter();

  const [canFavorite, setCanFavorite] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkRoleAndFavoriteStatus() {
      try {
        const res = await fetch("/api/auth/get-session");
        const data = await res.json();

        if (!data?.user) {
          setCanFavorite(true);
          return;
        }


        if (data?.user?.role === "PATIENT") {
          setCanFavorite(true);

          const profileRes = await fetch("/api/patient-profile");
          const profileData = await profileRes.json();

          const favoriteIds =
            profileData?.favoriteDoctorIds ||
            profileData?.favorite ||
            profileData?.patientProfile?.favorite ||
            [];

          setIsFavorited(favoriteIds.includes(doctorProfileId));
        }
      } catch (error) {
        console.error(error);
      }
    }

    checkRoleAndFavoriteStatus();
  }, [doctorProfileId]);

    async function handleFavorite() {
      try {
        setIsLoading(true);
    
        const sessionRes = await fetch("/api/auth/get-session");
        const sessionData = await sessionRes.json();
    
        if (!sessionData?.user) {
          router.push("/sign-in");
          return;
        }
    
        const res = await fetch(`/api/patient-profile/${sessionData.user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            favorite: [doctorProfileId],
          }),
        });
    
        const data = await res.json().catch(() => null);
    
        if (!res.ok) {
          throw new Error(data?.error || "Could not favorite doctor.");
        }
    
        setIsFavorited(data.patientProfile.favorite.includes(doctorProfileId));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

  if (!canFavorite) return null;

  return (
    <button
      type="button"
      onClick={handleFavorite}
      disabled={isLoading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={`absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:w-12 cursor-pointer ${
        isFavorited
          ? "bg-[#d8bd8d] text-white"
          : "bg-[#283C5D] text-[#d8bd8d]"
      }`}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Heart size={18} className={isFavorited ? "fill-current" : ""} />
      )}
    </button>
  );
}