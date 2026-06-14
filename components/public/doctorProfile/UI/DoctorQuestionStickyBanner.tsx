"use client";

import FreeOnlineConsultationButton from "./FreeOnlineConsultationButton";
import StripeConsultationCheckOutButton from "@/components/public/UI/StripeConsultationCheckOutButton";
import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type DoctorQuestionStickyBannerProps = {
  doctorProfileId: string;
  doctorName: string;
  onlineConsulPrice: number | null;
  currency: string | null;
};

function getCurrencySymbol(currency?: string | null) {
  switch (currency?.toLowerCase()) {
    case "usd":
      return "$";
    case "eur":
      return "€";
    case "gbp":
      return "£";
    case "chf":
      return "CHF";
    default:
      return currency?.toUpperCase() || "";
  }
}

function formatPrice(price: number | null, currency: string | null) {
  if (!price || price <= 0) return "Free";

  const symbol = getCurrencySymbol(currency);
  return symbol ? `${symbol} ${price}` : price.toString();
}

export default function DoctorQuestionStickyBanner({
  doctorProfileId,
  doctorName,
  onlineConsulPrice,
  currency,
}: DoctorQuestionStickyBannerProps) {
  const t =  useTranslations("doctor.doctor.profile.stickyContactBanner");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [canFavorite, setCanFavorite] = useState(false);

  const isFree = !onlineConsulPrice || onlineConsulPrice <= 0;
  const formattedPrice = formatPrice(onlineConsulPrice, currency);

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

  useEffect(() => {
  async function checkRole() {
    try {
      const res = await fetch("/api/auth/get-session");
      const data = await res.json();

      if (data?.user?.role === "PATIENT") {
        setCanFavorite(true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  checkRole();
}, []);

return (
  <div className="fixed inset-x-0 bottom-4 z-50 px-3 sm:px-4 md:bottom-6">
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-[#d8bd8d]/40 bg-white/95 p-4 shadow-2xl shadow-[#283C5D]/10 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {canFavorite ? (
          <button
            type="button"
            onClick={handleFavorite}
            disabled={isLoading}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:opacity-80 transition sm:h-12 sm:w-12 ${
              isFavorited
                ? "bg-[#d8bd8d] text-white"
                : "bg-[#283c5d] text-[#d8bd8d]"
            }`}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Heart
                size={18}
                className={isFavorited ? "fill-current" : ""}
              />
            )}
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-[#283C5D] sm:text-base">
            {t("title", { doctorName })}
          </p>

          <p className="mt-1 text-xs font-medium leading-relaxed text-[#283C5D]/55 sm:text-sm">
            {t("subtitle")}
          </p>

          <p className="mt-2 text-sm font-bold text-[#d8bd8d] sm:hidden">
            {isFree ? t("free") : t("fromPrice", { price: formattedPrice })}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        <p className="text-sm font-bold text-[#d8bd8d] max-sm:hidden">
          {isFree ? t("free") : t("fromPrice", { price: formattedPrice })}
        </p>

        {isFree ? (
          <FreeOnlineConsultationButton doctorProfileId={doctorProfileId} />
        ) : (
          <StripeConsultationCheckOutButton
            doctorProfileId={doctorProfileId}
            consultationType="ONLINE"
            price={onlineConsulPrice}
            currency={currency}
          />
        )}
      </div>
    </div>
  </div>
);
}