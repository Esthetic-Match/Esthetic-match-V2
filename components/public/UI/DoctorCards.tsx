"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Building2,
  Monitor,
  BriefcaseBusiness,
  Star,
  MapPin,
  ShieldCheck,
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

type DoctorCardProps = {
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
  if (amount === null) return null;
  return `${amount} ${currency.toUpperCase()}`;
}

const FALLBACK_BANNER_CLASS =
  "bg-gradient-to-br from-[#F1E1C6] via-white to-[#CEB591]/35";

export default function DoctorCards({
  doctor,
  specialtyT,
  showDetails = true,
  showSpecialties = true,
}: DoctorCardProps) {
  const t = useTranslations("home.Home");

  const specialties = doctor.specialtyIds;

  const mainTags =
    doctor.topThree && doctor.topThree.length > 0
      ? doctor.topThree
      : specialties;

  const visibleTags = mainTags.slice(0, 3);
  const remainingTagCount = Math.max(mainTags.length - visibleTags.length, 0);

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

  const location = [doctor.city, doctor.country].filter(Boolean).join(", ");

  const hasBanner = Boolean(doctor.clinicBanner);

  return (
    <article
      itemScope
      itemType="https://schema.org/Physician"
      className="group flex flex-col overflow-hidden rounded-[2rem] border border-[#CEB591]/25 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(40,60,93,0.14)]"
    >
      {/* ── Banner ── */}
      <div
        className={`relative h-28 shrink-0 ${
          hasBanner ? "" : FALLBACK_BANNER_CLASS
        }`}
      >
        {hasBanner ? (
          <Image
            src={doctor.clinicBanner!}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            aria-hidden="true"
          />
        ) : null}

        {/* Verified badge */}
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#283C5D] shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-[#CEB591]" />
          {t("veriiedDoctors")}
        </div>

        {/* Rating badge */}
        {doctor.googleRating !== null && doctor.googleReviewCount !== null ? (
          <div
            itemProp="aggregateRating"
            itemScope
            itemType="https://schema.org/AggregateRating"
            className="absolute -bottom-4 right-5 flex items-center gap-1 rounded-full bg-[#283C5D] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            <Star className="h-3.5 w-3.5 fill-[#CEB591] text-[#CEB591]" />
            <span itemProp="ratingValue">{doctor.googleRating.toFixed(1)}</span>
            <span className="text-white/70">({doctor.googleReviewCount})</span>
            <meta
              itemProp="reviewCount"
              content={String(doctor.googleReviewCount)}
            />
          </div>
        ) : null}

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-[#283C5D] shadow-xl">
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

      {/* ── Body — grows to fill card height ── */}
      <div className="flex flex-1 flex-col px-6 pb-6 pt-16">
        {/* Doctor name + clinic */}
        <div>
          <h3
            itemProp="name"
            className="truncate text-xl font-bold tracking-tight text-[#283C5D]"
          >
            {doctor.name}
          </h3>

          {doctor.clinicName ? (
            <p className="mt-1 truncate text-sm font-medium text-[#283C5D]/65">
              {doctor.clinicName}
            </p>
          ) : null}
        </div>

        {/* Location */}
        {location ? (
          <p
            itemProp="address"
            className="mt-4 flex items-center gap-2 text-sm text-[#283C5D]/60"
          >
            <MapPin className="h-4 w-4 shrink-0 text-[#CEB591]" />
            <span className="truncate">{location}</span>
          </p>
        ) : null}

        {/* Experience */}
        {showDetails && doctor.yearsOfExperience ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F8F3EA] px-3 py-2 text-xs font-semibold text-[#283C5D]/70">
            <BriefcaseBusiness className="h-4 w-4 text-[#CEB591]" />
            <span>
              {doctor.yearsOfExperience}+ {t("years")} {t("experience")}
            </span>
          </div>
        ) : null}

        {/* ── Specialties ── */}
        {(showDetails || showSpecialties) && visibleTags.length > 0 ? (
          <div className="mt-5 border-t border-[#CEB591]/20 pt-4">
            <p className="mb-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-[#283C5D]/40">
              Specialties
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {visibleTags.map((id: string) => (
                <span
                  key={id}
                  itemProp="medicalSpecialty"
                  className="rounded-full border border-[#CEB591]/40 bg-[#F1E1C6]/40 px-3.5 py-1 text-xs font-semibold text-[#283C5D] transition-colors hover:bg-[#F1E1C6]/70"
                >
                  {specialtyT[id] ?? id}
                </span>
              ))}

              {remainingTagCount > 0 ? (
                <span className="rounded-full border border-[#CEB591]/30 bg-white px-3 py-1 text-xs font-semibold text-[#283C5D]/55">
                  +{remainingTagCount}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ── Footer — pushed to bottom via mt-auto ── */}
        <div className="mt-auto pt-6">
          <p className="mb-2 text-xs font-semibold leading-snug text-[#283C5D]/55">
            {t("consultationPricesTitle")}
          </p>

          {/* Price cards */}
          <div
            className={
              shouldShowOnlineCard
                ? "grid grid-cols-2 gap-3"
                : "grid grid-cols-1 gap-3"
            }
          >
            <div className="flex flex-col rounded-2xl bg-[#FCFCFB] p-4">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-[#CEB591]" />
                <span className="text-xs font-medium leading-tight text-[#283C5D]/50">
                  {t("inClinic")}
                </span>
              </div>
          
              <p className="mt-auto pt-2 text-sm font-bold text-[#283C5D]">
                {inClinicPrice ? inClinicPrice : t("free")}
              </p>
            </div>
          
            {shouldShowOnlineCard ? (
              <div className="flex flex-col rounded-2xl bg-[#FCFCFB] p-4">
                <div className="flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 shrink-0 text-[#CEB591]" />
                  <span className="text-xs font-medium leading-tight text-[#283C5D]/50">
                    {t("online")}
                  </span>
                </div>
            
                <p className="mt-auto pt-2 text-sm font-bold text-[#283C5D]">
                  {onlinePrice ? onlinePrice : t("free")}
                </p>
              </div>
            ) : null}
          </div>
          
          {/* CTA button */}
          <Link
            href={`/doctors/${doctor.slug}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#283C5D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#D0B796] hover:text-[#283C5D] active:scale-[0.98]"
          >
            {t("viewProfile")}
          </Link>
        </div>
      </div>
    </article>
  );
}