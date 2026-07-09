"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  Monitor,
  ShieldCheck,
  Star,
} from "lucide-react";

export type DoctorCardData = {
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
  clinicName?: string | null;
  topThree?: string[];
  clinicBanner?: string | null;
};

export type SpecialtyTranslations = Record<string, string>;

type DoctorCardHorizontalProps = {
  doctor: DoctorCardData;
  specialtyT: SpecialtyTranslations;
  showDetails?: boolean;
  showSpecialties?: boolean;
};

function formatCurrency({
  amount,
  currency,
}: {
  amount: number | null;
  currency: string;
}) {
  if (amount === null) {
    return null;
  }

  return `${amount} ${currency.toUpperCase()}`;
}

const FALLBACK_BANNER_CLASS =
  "bg-gradient-to-br from-[#F1E1C6] via-white to-[#CEB591]/35";

export default function DoctorCardsHorizontal({
  doctor,
  specialtyT,
  showDetails = true,
  showSpecialties = true,
}: DoctorCardHorizontalProps) {
  const t = useTranslations("home.Home");

  const specialties = doctor.specialtyIds;

  const mainTags =
    doctor.topThree && doctor.topThree.length > 0
      ? doctor.topThree
      : specialties;

  const visibleTags = mainTags.slice(0, 3);

  const remainingTagCount = Math.max(
    mainTags.length - visibleTags.length,
    0
  );

  const inClinicPrice = formatCurrency({
    amount: doctor.inClinicPrice,
    currency: doctor.currency,
  });

  const onlinePrice = formatCurrency({
    amount: doctor.onlineConsulPrice,
    currency: doctor.currency,
  });

  const shouldShowOnlineCard =
    doctor.stripeConnectOnboardingComplete === true &&
    doctor.onlineActive === true;

  const location = [doctor.city, doctor.country]
    .filter(Boolean)
    .join(", ");

  const hasBanner = Boolean(doctor.clinicBanner);

  return (
    <article
      itemScope
      itemType="https://schema.org/Physician"
      className="group grid w-full grid-cols-[110px_minmax(0,1fr)] overflow-hidden rounded-[1.75rem] border border-[#CEB591]/25 bg-white shadow-[0_10px_35px_rgba(40,60,93,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(40,60,93,0.14)] sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)]"
    >
      {/* ── Left media panel ─────────────────────────────────────── */}
      <div
        className={`relative min-h-full overflow-hidden ${
          hasBanner ? "" : FALLBACK_BANNER_CLASS
        }`}
      >
        {hasBanner ? (
          <>
            <Image
              src={doctor.clinicBanner!}
              alt=""
              fill
              sizes="(max-width: 640px) 110px, (max-width: 1024px) 150px, 180px"
              className="object-cover transition duration-500 group-hover:scale-105"
              aria-hidden="true"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-[#07152A]/10 via-[#07152A]/15 to-[#07152A]/70" />
          </>
        ) : null}

        {/* Avatar */}
        <div className="absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-[3px] border-white bg-[#283C5D] shadow-xl sm:h-24 sm:w-24 sm:rounded-3xl">
          <Image
            src={doctor.avatar || "/images/default-doctor.png"}
            alt={`${doctor.name}, ${specialties
              .map((id: string) => specialtyT[id] ?? id)
              .join(", ")}`}
            fill
            sizes="96px"
            className="object-cover"
            itemProp="image"
          />
        </div>
      </div>

      {/* ── Main card content ────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col p-4 sm:p-5 lg:p-6">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3
              itemProp="name"
              className="break-words text-base font-bold leading-snug tracking-tight text-[#283C5D] sm:text-lg lg:text-xl"
            >
              {doctor.name}
            </h3>

            {doctor.clinicName ? (
              <p className="mt-1 break-words text-xs font-medium leading-relaxed text-[#283C5D]/60 sm:text-sm">
                {doctor.clinicName}
              </p>
            ) : null}
          </div>

          {/* Rating */}
          {doctor.googleRating !== null &&
          doctor.googleReviewCount !== null ? (
            <div
              itemProp="aggregateRating"
              itemScope
              itemType="https://schema.org/AggregateRating"
              className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-[#283C5D] px-2.5 py-1.5 text-[10px] font-bold text-white sm:text-xs"
            >
              <Star className="h-3.5 w-3.5 fill-[#CEB591] text-[#CEB591]" />

              <span itemProp="ratingValue">
                {doctor.googleRating.toFixed(1)}
              </span>

              <span className="text-white/65">
                ({doctor.googleReviewCount})
              </span>

              <meta
                itemProp="reviewCount"
                content={String(doctor.googleReviewCount)}
              />
            </div>
          ) : null}
        </div>

        {/* ── Location and experience ────────────────────────────── */}
        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {location ? (
            <p
              itemProp="address"
              className="flex min-w-0 items-start gap-1.5 text-xs leading-relaxed text-[#283C5D]/60 sm:text-sm"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#CEB591] sm:h-4 sm:w-4" />

              <span className="break-words">
                {location}
              </span>
            </p>
          ) : null}

          {showDetails && doctor.yearsOfExperience ? (
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F8F3EA] px-2.5 py-1.5 text-[10px] font-semibold text-[#283C5D]/70 sm:text-xs">
              <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0 text-[#CEB591]" />

              <span className="break-words">
                {doctor.yearsOfExperience}+ {t("years")}{" "}
                {t("experience")}
              </span>
            </div>
          ) : null}
        </div>

        {/* ── Specialties ────────────────────────────────────────── */}
        {(showDetails || showSpecialties) &&
        visibleTags.length > 0 ? (
          <div className="mt-4 border-t border-[#CEB591]/20 pt-3">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#283C5D]/40 sm:text-[10px]">
              Specialties
            </p>

            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((id: string) => (
                <span
                  key={id}
                  itemProp="medicalSpecialty"
                  className="max-w-full break-words rounded-full border border-[#CEB591]/40 bg-[#F1E1C6]/40 px-2.5 py-1 text-[10px] font-semibold leading-relaxed text-[#283C5D] sm:px-3 sm:text-xs"
                >
                  {specialtyT[id] ?? id}
                </span>
              ))}

              {remainingTagCount > 0 ? (
                <span className="rounded-full border border-[#CEB591]/30 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#283C5D]/55 sm:px-3 sm:text-xs">
                  +{remainingTagCount}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="mt-auto pt-4">
          <div className="border-t border-[#CEB591]/20 pt-3">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#283C5D]/40 sm:text-[10px]">
              {t("consultationPricesTitle")}
            </p>

            <div
              className={
                shouldShowOnlineCard
                  ? "grid gap-2 xl:grid-cols-2"
                  : "grid grid-cols-1 gap-2"
              }
            >
              {/* In clinic */}
              <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-[#FAFAF8] px-2.5 py-2.5 sm:px-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F1E1C6]/60">
                    <Building2 className="h-3.5 w-3.5 text-[#CEB591]" />
                  </div>

                  <span className="break-words text-[10px] font-medium leading-snug text-[#283C5D]/60 sm:text-xs">
                    {t("inClinic")}
                  </span>
                </div>

                <p className="shrink-0 whitespace-nowrap text-xs font-bold text-[#283C5D] sm:text-sm">
                  {inClinicPrice ?? t("free")}
                </p>
              </div>

              {/* Online */}
              {shouldShowOnlineCard ? (
                <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-[#FAFAF8] px-2.5 py-2.5 sm:px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F1E1C6]/60">
                      <Monitor className="h-3.5 w-3.5 text-[#CEB591]" />
                    </div>

                    <span className="break-words text-[10px] font-medium leading-snug text-[#283C5D]/60 sm:text-xs">
                      {t("online")}
                    </span>
                  </div>

                  <p className="shrink-0 whitespace-nowrap text-xs font-bold text-[#283C5D] sm:text-sm">
                    {onlinePrice ?? t("free")}
                  </p>
                </div>
              ) : null}
            </div>

            {/* CTA */}
            <div className="mt-3 flex justify-center sm:justify-end">
              <Link
                href={`/doctors/${doctor.slug}`}
                className="inline-flex w-full max-w-[180px] items-center justify-center rounded-full bg-[#283C5D] px-5 py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#D0B796] hover:text-[#283C5D] active:scale-[0.98] sm:text-sm"
              >
                {t("viewProfile")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}