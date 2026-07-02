"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import StripeConsultationCheckOutButton from "@/components/public/doctorProfile/UI/StripeConsultationCheckOutButton";
import FreeOnlineConsultationButton from "./FreeOnlineConsultationButton";

type DoctorQuestionStickyBannerProps = {
  doctorProfileId: string;
  doctorName: string;
  onlineConsulPrice: number | null;
  onlineActive: boolean;
  stripeConnectOnboardingComplete?: boolean | null;
  currency: string | null;
};

type SessionUser = {
  id: string;
  role?: string | null;
};

type SessionResponse = {
  user?: SessionUser | null;
};

type PatientProfileResponse = {
  patientProfile?: {
    favorite?: string[];
  };
  error?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseSessionResponse(value: unknown): SessionResponse {
  if (!isRecord(value)) {
    return {};
  }

  const user = value.user;

  if (!isRecord(user)) {
    return {};
  }

  const id = user.id;
  const role = user.role;

  if (typeof id !== "string") {
    return {};
  }

  return {
    user: {
      id,
      role: typeof role === "string" ? role : null,
    },
  };
}

function parsePatientProfileResponse(value: unknown): PatientProfileResponse {
  if (!isRecord(value)) {
    return {};
  }

  const error = value.error;
  const patientProfile = value.patientProfile;

  if (!isRecord(patientProfile)) {
    return {
      error: typeof error === "string" ? error : undefined,
    };
  }

  const favorite = patientProfile.favorite;

  return {
    error: typeof error === "string" ? error : undefined,
    patientProfile: {
      favorite: Array.isArray(favorite)
        ? favorite.filter((item): item is string => typeof item === "string")
        : [],
    },
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

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
  if (!price || price <= 0) {
    return "Free";
  }

  const symbol = getCurrencySymbol(currency);

  return symbol ? `${symbol} ${price}` : price.toString();
}

export default function DoctorQuestionStickyBanner({
  doctorProfileId,
  doctorName,
  onlineConsulPrice,
  onlineActive,
  stripeConnectOnboardingComplete,
  currency,
}: DoctorQuestionStickyBannerProps) {
  const t = useTranslations("doctor.doctor.profile.stickyContactBanner");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [canFavorite, setCanFavorite] = useState(false);

  const canShowOnlineConsultation = Boolean(stripeConnectOnboardingComplete);
  const shouldShowOnlineConsultation = canShowOnlineConsultation && onlineActive;

  const isFree = !onlineConsulPrice || onlineConsulPrice <= 0;
  const formattedPrice = formatPrice(onlineConsulPrice, currency);

  async function handleFavorite() {
    try {
      setIsLoading(true);

      const sessionRes = await fetch("/api/auth/get-session");
      const sessionJson = await readJson(sessionRes);
      const sessionData = parseSessionResponse(sessionJson);

      if (!sessionData.user) {
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

      const json = await readJson(res);
      const data = parsePatientProfileResponse(json);

      if (!res.ok) {
        throw new Error(data.error || "Could not favorite doctor.");
      }

      setIsFavorited(
        data.patientProfile?.favorite?.includes(doctorProfileId) ?? false
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!shouldShowOnlineConsultation) {
      return;
    }

    async function checkRole() {
      try {
        const res = await fetch("/api/auth/get-session");
        const json = await readJson(res);
        const data = parseSessionResponse(json);

        if (data.user?.role === "PATIENT") {
          setCanFavorite(true);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void checkRole();
  }, [shouldShowOnlineConsultation]);

  if (!canShowOnlineConsultation) {
    return null;
  }

  if (!onlineActive) {
    return (
      <div className="fixed inset-x-0 bottom-4 z-50 px-3 sm:px-4 md:bottom-6">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center rounded-3xl border border-[#d8bd8d]/40 bg-white/95 p-4 shadow-2xl shadow-[#283C5D]/10 backdrop-blur-md sm:p-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]/45">
            Hidden
          </p>
        </div>
      </div>
    );
  }

  return (
<div className="fixed inset-x-0 bottom-4 z-50 px-3 sm:px-4 md:bottom-6">
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-[#d8bd8d]/45 bg-[#283C5D]/95 p-4 shadow-2xl shadow-[#283C5D]/25 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
    <div className="flex min-w-0 flex-1 items-start gap-4">
      {canFavorite ? (
        <button
          type="button"
          onClick={handleFavorite}
          disabled={isLoading}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition hover:opacity-80 sm:h-12 sm:w-12 ${
            isFavorited
              ? "border-[#d8bd8d] bg-[#d8bd8d] text-[#283C5D]"
              : "border-white/15 bg-white/10 text-[#d8bd8d]"
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
        <p className="text-sm font-bold leading-snug text-white sm:text-base">
          {t("title", { doctorName })}
        </p>

        <p className="mt-1 text-xs font-medium leading-relaxed text-white/65 sm:text-sm">
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