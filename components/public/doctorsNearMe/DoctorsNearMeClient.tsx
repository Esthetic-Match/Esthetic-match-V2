"use client";

import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  type DoctorCardData,
  type SpecialtyTranslations,
} from "@/components/public/UI/DoctorCards";
import { Loader2, RefreshCw } from "lucide-react";
import NearbyDoctorsMap from "./NearbyDoctorsMap";
import DoctorCardsHorizontal from "../UI/DoctorCardsHorizontal";

// ── Types ────────────────────────────────────────────────────────────────────

type DoctorCardDto = {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  clinicName: string;
  city: string | null;
  country: string | null;
  specialtyIds: string[];
  procedureIds: string[];
  topThree: string[];
  yearsOfExperience: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  stripeConnectOnboardingComplete?: boolean;
  onlineActive?: boolean;
  currency: string;
  distanceKm: number | null;
  clinicBanner?: string | null;
  workLatitude: number | null;
  workLongitude: number | null;
};

type DoctorsNearMeResponse = {
  city: string | null;
  country: string | null;
  matchMode: "city" | "radius";
  radiusKm: number;
  doctors: DoctorCardDto[];
};

type LoadState =
  | "idle"
  | "loading-location"
  | "loading-doctors"
  | "success"
  | "error"
  | "denied";

// ── Helpers ──────────────────────────────────────────────────────────────────

function humanizeId(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildSpecialtyTranslations(
  doctors: DoctorCardDto[]
): SpecialtyTranslations {
  const out: SpecialtyTranslations = {};

  for (const doctor of doctors) {
    for (const id of [...doctor.specialtyIds, ...doctor.topThree]) {
      out[id] = humanizeId(id);
    }
  }

  return out;
}

function toDoctorCardData(doctor: DoctorCardDto): DoctorCardData {
  return {
    id: doctor.id,
    slug: doctor.slug,
    name: doctor.name,
    specialtyIds: doctor.specialtyIds,
    avatar: doctor.avatar ?? "/images/default-doctor.png",
    city: doctor.city,
    country: doctor.country,
    googleRating: doctor.googleRating,
    googleReviewCount: doctor.googleReviewCount,
    yearsOfExperience: doctor.yearsOfExperience,
    inClinicPrice: doctor.inClinicPrice,
    onlineConsulPrice: doctor.onlineConsulPrice,
    stripeConnectOnboardingComplete:
      doctor.stripeConnectOnboardingComplete,
    onlineActive: doctor.onlineActive,
    currency: doctor.currency,
    clinicName: doctor.clinicName,
    topThree: doctor.topThree,
    clinicBanner: doctor.clinicBanner,
  };
}

function isDoctorsNearMeResponse(
  value: unknown
): value is DoctorsNearMeResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<DoctorsNearMeResponse>;

  return Array.isArray(candidate.doctors);
}

function getApiErrorMessage(value: unknown, fallback: string) {
  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const candidate = value as { error?: unknown };

  return typeof candidate.error === "string"
    ? candidate.error
    : fallback;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DoctorsNearMeClient() {
  const t = useTranslations("doctor.doctor.nearme");
  const locale = useLocale();

  const [loadState, setLoadState] =
    useState<LoadState>("loading-location");

  const [data, setData] =
    useState<DoctorsNearMeResponse | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [selectedDoctorId, setSelectedDoctorId] =
    useState<string | null>(null);

  const isLoading =
    loadState === "loading-location" ||
    loadState === "loading-doctors";

  const localeRef = useRef(locale);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const fetchDoctorsForPosition = useCallback(
    async (
      position: GeolocationPosition
    ): Promise<DoctorsNearMeResponse> => {
      const response = await fetch(
        "/api/public-pages/doctors-near-me",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locale: localeRef.current,
          }),
        }
      );

      const result = (await response
        .json()
        .catch(() => null)) as unknown;

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            result,
            "Could not load doctors."
          )
        );
      }

      if (!isDoctorsNearMeResponse(result)) {
        throw new Error("Could not load doctors.");
      }

      return result;
    },
    []
  );

  const handleDoctorsNearMeSuccess = useCallback(
    async (position: GeolocationPosition) => {
      try {
        setLoadState("loading-doctors");

        const result =
          await fetchDoctorsForPosition(position);

        setData(result);
        setSelectedDoctorId(
          result.doctors[0]?.id ?? null
        );
        setLoadState("success");
      } catch (error) {
        setLoadState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t("errorText")
        );
      }
    },
    [fetchDoctorsForPosition, t]
  );

  const loadDoctorsNearMe = useCallback(() => {
    setErrorMessage(null);
    setLoadState("loading-location");

    if (!navigator.geolocation) {
      setLoadState("error");
      setErrorMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void handleDoctorsNearMeSuccess(position);
      },
      () => {
        setLoadState("denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 1000 * 60 * 5,
      }
    );
  }, [handleDoctorsNearMeSuccess]);

  useEffect(() => {
    let isMounted = true;

    if (!navigator.geolocation) {
      queueMicrotask(() => {
        if (!isMounted) {
          return;
        }

        setLoadState("error");
        setErrorMessage(
          "Geolocation is not supported by this browser."
        );
      });

      return () => {
        isMounted = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) {
          return;
        }

        void handleDoctorsNearMeSuccess(position);
      },
      () => {
        if (!isMounted) {
          return;
        }

        setLoadState("denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 1000 * 60 * 5,
      }
    );

    return () => {
      isMounted = false;
    };
  }, [handleDoctorsNearMeSuccess]);

  const specialtyTranslations =
    useMemo<SpecialtyTranslations>(() => {
      if (!data) {
        return {};
      }

      return buildSpecialtyTranslations(data.doctors);
    }, [data]);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-12">
        {loadState === "denied" && (
          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
            <h2 className="text-2xl font-bold text-[#283C5D]">
              {t("deniedTitle")}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
              {t("deniedText")}
            </p>
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
            <h2 className="text-2xl font-bold text-[#283C5D]">
              {t("errorTitle")}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
              {errorMessage ?? t("errorText")}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map(
              (_, index: number) => (
                <div
                  key={index}
                  className="h-[470px] animate-pulse rounded-[2rem] border border-[#CEB591]/20 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.06)]"
                />
              )
            )}
          </div>
        )}

        {loadState === "success" && data && (
          <>
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#CEB591]">
                  {data.matchMode === "city"
                    ? t("foundIn")
                    : t("foundNearby")}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#283C5D]">
                  {data.city
                    ? [data.city, data.country]
                        .filter(Boolean)
                        .join(", ")
                    : t("nearby")}
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center rounded-full border border-[#283C5D]/15 bg-white px-5 py-3 text-sm font-bold text-[#283C5D] transition hover:border-[#CEB591] hover:bg-[#F1E1C6]/35"
                >
                  {t("searchAll")}
                </Link>

                <button
                  type="button"
                  onClick={loadDoctorsNearMe}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#CEB591]/40 bg-[#F1E1C6]/45 px-5 py-3 text-sm font-bold text-[#283C5D] transition hover:border-[#CEB591] hover:bg-[#F1E1C6]/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}

                  {t("tryAgain")}
                </button>
              </div>
            </div>

            {data.doctors.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(360px,460px)_minmax(0,1fr)] xl:grid-cols-[minmax(300px,400px)_minmax(0,1fr)]">
                <div className="min-w-0 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
                  <NearbyDoctorsMap
                    doctors={data.doctors}
                    selectedDoctorId={selectedDoctorId}
                    className="h-full lg:[&>div:last-child]:h-[calc(100vh-14rem)]"
                  />
                </div>

                <aside className="min-w-0 rounded-[2rem] border border-[#CEB591]/25 bg-white/80 p-4 shadow-[0_24px_70px_rgba(40,60,93,0.08)] backdrop-blur">
                  <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#CEB591]/20 pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#CEB591]">
                        {t("doctorsIn")}
                      </p>

                      <h3 className="mt-1 text-xl font-bold tracking-tight text-[#283C5D]">
                        {t("nearbyDoctors")}
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#F1E1C6]/60 px-3 py-1.5 text-xs font-bold text-[#283C5D]">
                      {data.doctors.length}
                    </span>
                  </div>

                  <div className="max-h-[calc(100vh-15rem)] overflow-y-auto pr-1 [scrollbar-color:#CEB591_transparent] [scrollbar-width:thin]">
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
                      {data.doctors.map(
                        (doctor: DoctorCardDto) => {
                          const isSelected =
                            selectedDoctorId === doctor.id;

                          return (
                            <div
                              key={doctor.id}
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                const target =
                                  event.target;

                                if (
                                  !(target instanceof Element)
                                ) {
                                  return;
                                }

                                if (
                                  target.closest(
                                    "a, button"
                                  )
                                ) {
                                  return;
                                }

                                setSelectedDoctorId(
                                  doctor.id
                                );
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key !== "Enter" &&
                                  event.key !== " "
                                ) {
                                  return;
                                }

                                setSelectedDoctorId(
                                  doctor.id
                                );
                              }}
                              className={`cursor-pointer rounded-[2rem] transition ${
                                isSelected
                                  ? "ring-offset-white"
                                  : "hover:-translate-y-0.5"
                              }`}
                            >
                              <DoctorCardsHorizontal
                                doctor={toDoctorCardData(
                                  doctor
                                )}
                                specialtyT={
                                  specialtyTranslations
                                }
                                showDetails={false}
                              />
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
                <h2 className="text-2xl font-bold text-[#283C5D]">
                  {t("noDoctorsTitle")}
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
                  {t("noDoctorsText")}
                </p>

                <Link
                  href="/doctors"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1f2f49]"
                >
                  {t("searchAll")}
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}