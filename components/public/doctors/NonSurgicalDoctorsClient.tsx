// app/[locale]/doctors/non-surgical/NonSurgicalDoctorsClient.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import DoctorCards, {
  type DoctorCardData,
  type SpecialtyTranslations,
} from "@/components/public/UI/DoctorCards";

const NON_SURGICAL_SPECIALTIES = [
  "aesthetic_doctor",
  "dermatologist",
  "ophthalmologist",
  "dentist",
  "orthodontist",
  "general_practitioner",
  "oculoplastic_surgeon",
] as const;

type DoctorApiItem = {
  id: string;
  slug: string;
  name: string;
  specialtyIds: string[];
  avatar: string;
  city: string | null;
  country: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  yearsOfExperience: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  stripeConnectOnboardingComplete?: boolean;
  onlineActive?: boolean;
  currency: string;
  clinicBanner?: string | null;
};

type DoctorsApiPayload = {
  doctors: DoctorApiItem[];
  page: number;
  limit: number;
  hasMore: boolean;
};

type DoctorsApiResponse = {
  data?: DoctorsApiPayload;
  doctors?: DoctorApiItem[];
  page?: number;
  limit?: number;
  hasMore?: boolean;
};

type LoadState = "idle" | "loading" | "success" | "error";

function humanizeId(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDoctorsPayload(response: DoctorsApiResponse): DoctorsApiPayload {
  if (response.data) {
    return response.data;
  }

  return {
    doctors: response.doctors ?? [],
    page: response.page ?? 1,
    limit: response.limit ?? 12,
    hasMore: response.hasMore ?? false,
  };
}

function toDoctorCardData(doctor: DoctorApiItem): DoctorCardData {
  return {
    id: doctor.id,
    slug: doctor.slug,
    name: doctor.name,
    specialtyIds: doctor.specialtyIds,
    avatar: doctor.avatar || "/images/default-doctor.png",
    city: doctor.city,
    country: doctor.country,
    googleRating: doctor.googleRating,
    googleReviewCount: doctor.googleReviewCount,
    yearsOfExperience: doctor.yearsOfExperience,
    inClinicPrice: doctor.inClinicPrice,
    onlineConsulPrice: doctor.onlineConsulPrice,
    stripeConnectOnboardingComplete: doctor.stripeConnectOnboardingComplete,
    onlineActive: doctor.onlineActive,
    currency: doctor.currency,
    clinicBanner: doctor.clinicBanner,
  };
}

export default function NonSurgicalDoctorsClient() {
  const t = useTranslations("doctor.doctor.nonSurgicalSpecialists");
  const specialtyT = useTranslations("specialitiesName");

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [doctors, setDoctors] = useState<DoctorApiItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const specialtyTranslations = useMemo<SpecialtyTranslations>(() => {
    const allSpecialtyIds = [
      ...new Set([
        ...NON_SURGICAL_SPECIALTIES,
        ...doctors.flatMap((doctor) => doctor.specialtyIds),
      ]),
    ];

    const translations: SpecialtyTranslations = {};

    allSpecialtyIds.forEach((id) => {
      try {
        translations[id] = specialtyT(id);
      } catch {
        translations[id] = humanizeId(id);
      }
    });

    return translations;
  }, [doctors, specialtyT]);

const requestDoctors = useCallback(
  async (nextPage: number): Promise<DoctorsApiPayload> => {
    const searchParams = new URLSearchParams({
      specialty: NON_SURGICAL_SPECIALTIES.join(","),
      page: String(nextPage),
      limit: "12",
    });

    const response = await fetch(
      `/api/public-pages/doctor-profile?${searchParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = (await response.json().catch(() => null)) as
      | DoctorsApiResponse
      | null;

    if (!response.ok || !result) {
      throw new Error(t("errorText"));
    }

    return getDoctorsPayload(result);
  },
  [t]
);

const fetchDoctors = useCallback(
  async ({ nextPage, append }: { nextPage: number; append: boolean }) => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const payload = await requestDoctors(nextPage);

      setDoctors((currentDoctors) =>
        append ? [...currentDoctors, ...payload.doctors] : payload.doctors
      );
      setPage(payload.page);
      setHasMore(payload.hasMore);
      setLoadState("success");
    } catch (error) {
      setLoadState("error");
      setErrorMessage(error instanceof Error ? error.message : t("errorText"));
    }
  },
  [requestDoctors, t]
);

useEffect(() => {
  let isMounted = true;

  requestDoctors(1)
    .then((payload) => {
      if (!isMounted) return;

      setDoctors(payload.doctors);
      setPage(payload.page);
      setHasMore(payload.hasMore);
      setLoadState("success");
    })
    .catch((error: unknown) => {
      if (!isMounted) return;

      setLoadState("error");
      setErrorMessage(error instanceof Error ? error.message : t("errorText"));
    });

  return () => {
    isMounted = false;
  };
}, [requestDoctors, t]);

  const isLoading = loadState === "loading";

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <section className="relative overflow-hidden border-b border-[#CEB591]/20 bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,60,93,0.72)_0%,rgba(40,60,93,0.42)_22%,rgba(250,249,247,0)_55%),radial-gradient(circle_at_top_left,rgba(206,181,145,0.28),transparent_34%),linear-gradient(135deg,#ffffff_0%,#FAF9F7_48%,rgba(241,225,198,0.55)_100%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CEB591]/30 bg-white/80 px-4 py-2 text-sm font-bold text-[#283C5D] shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-[#CEB591]" />
              {t("eyebrow")}
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight text-[#283C5D] md:text-6xl">
              {t("title")}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#283C5D]/65 md:text-lg">
              {t("description")}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {NON_SURGICAL_SPECIALTIES.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full border border-[#CEB591]/35 bg-[#F1E1C6]/40 px-4 py-2 text-sm font-bold text-[#283C5D]"
                >
                  {specialtyTranslations[specialty] ?? humanizeId(specialty)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white/80 p-6 shadow-[0_24px_80px_rgba(40,60,93,0.1)] backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1E1C6] text-[#283C5D]">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#283C5D]">
                  {t("sideCardTitle")}
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#283C5D]/60">
                  {t("sideCardText")}
                </p>
              </div>
            </div>

            <Link
              href="/doctors"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1f2f49]"
            >
              {t("browseAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#CEB591]">
              {t("resultsEyebrow")}
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#283C5D]">
              {t("resultsTitle")}
            </h2>
          </div>

          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-bold text-[#283C5D]/65 shadow-sm">
            {doctors.length} {t("resultsCount")}
          </span>
        </div>

        {loadState === "error" ? (
          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
            <h2 className="text-2xl font-bold text-[#283C5D]">
              {t("errorTitle")}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
              {errorMessage ?? t("errorText")}
            </p>

            <button
              type="button"
              onClick={() => void fetchDoctors({ nextPage: 1, append: false })}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#283C5D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1f2f49]"
            >
              <RefreshCw className="h-4 w-4" />
              {t("tryAgain")}
            </button>
          </div>
        ) : null}

        {isLoading && doctors.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[470px] animate-pulse rounded-[2rem] border border-[#CEB591]/20 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.06)]"
              />
            ))}
          </div>
        ) : null}

        {loadState !== "error" && doctors.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {doctors.map((doctor) => (
                <DoctorCards
                  key={doctor.id}
                  doctor={toDoctorCardData(doctor)}
                  specialtyT={specialtyTranslations}
                  showDetails
                />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    void fetchDoctors({ nextPage: page + 1, append: true })
                  }
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#283C5D] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#1f2f49] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {t("loadMore")}
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {loadState === "success" && doctors.length === 0 ? (
          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
            <h2 className="text-2xl font-bold text-[#283C5D]">
              {t("emptyTitle")}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
              {t("emptyText")}
            </p>

            <Link
              href="/doctors"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1f2f49]"
            >
              {t("browseAll")}
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}