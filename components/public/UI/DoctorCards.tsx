"use client";

import Image from "next/image";
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
};

export type CardTranslations = {
  reviews: string;
  free: string;
  viewProfile: string;
  verifiedProfile?: string;
  inClinic?: string;
  online?: string;
  from?: string;
  years?: string;
  experience?: string;
};

export type SpecialtyTranslations = Record<string, string>;

type DoctorCardProps = {
  doctor: DoctorCardData;
  t: CardTranslations;
  specialtyT: SpecialtyTranslations;
  showDetails?: boolean;
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

export default function DoctorCards({
  doctor,
  t,
  specialtyT,
  showDetails = true,
}: DoctorCardProps) {
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

  return (
    <article
      itemScope
      itemType="https://schema.org/Physician"
      className="group overflow-hidden rounded-[2rem] border border-[#CEB591]/25 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(40,60,93,0.14)]"
    >
      <div className="relative h-26 bg-gradient-to-br from-[#F1E1C6] via-white to-[#CEB591]/35">
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#283C5D] shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-[#CEB591]" />
          {t.verifiedProfile}
        </div>

        {doctor.googleRating !== null && doctor.googleReviewCount !== null ? (
          <div
            itemProp="aggregateRating"
            itemScope
            itemType="https://schema.org/AggregateRating"
            className="absolute right-5 top-23 flex items-center gap-1 rounded-full bg-[#283C5D] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            <Star className="h-3.5 w-3.5 fill-[#CEB591] text-[#CEB591]" />
            <span itemProp="ratingValue">{doctor.googleRating.toFixed(1)}</span>
            <span className="text-white/70">
              ({doctor.googleReviewCount})
            </span>
            <meta
              itemProp="reviewCount"
              content={String(doctor.googleReviewCount)}
            />
          </div>
        ) : null}

        <div className="absolute -bottom-12 left-6 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-[#283C5D] shadow-xl">
          <Image
            src={doctor.avatar || "/images/default-doctor.png"}
            alt={`${doctor.name}, ${specialties
              .map((id) => specialtyT[id] ?? id)
              .join(", ")}`}
            fill
            sizes="96px"
            className="object-cover"
            itemProp="image"
          />
        </div>
      </div>

      <div className="px-6 pb-6 pt-16">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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
        </div>

        {location ? (
          <p
            itemProp="address"
            className="mt-4 flex items-center gap-2 text-sm text-[#283C5D]/60"
          >
            <MapPin className="h-4 w-4 shrink-0 text-[#CEB591]" />
            <span className="truncate">{location}</span>
          </p>
        ) : null}

        {showDetails && doctor.yearsOfExperience ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F8F3EA] px-3 py-2 text-xs font-semibold text-[#283C5D]/70">
            <BriefcaseBusiness className="h-4 w-4 text-[#CEB591]" />
            <span>
              {doctor.yearsOfExperience}+ {t.years ?? "yrs"}{" "}
              {t.experience ?? "experience"}
            </span>
          </div>
        ) : null}

        {showDetails && visibleTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {visibleTags.map((id) => (
              <span
                key={id}
                itemProp="medicalSpecialty"
                className="rounded-full border border-[#CEB591]/35 bg-[#F1E1C6]/35 px-3 py-1 text-xs font-semibold text-[#283C5D]"
              >
                {specialtyT[id] ?? id}
              </span>
            ))}

            {remainingTagCount > 0 ? (
              <span className="rounded-full border border-[#CEB591]/35 bg-white px-3 py-1 text-xs font-semibold text-[#283C5D]/60">
                +{remainingTagCount}
              </span>
            ) : null}
          </div>
        ) : null}

        <div
          className={
            shouldShowOnlineCard
              ? "mt-6 grid grid-cols-2 gap-3"
              : "mt-6 grid grid-cols-1 gap-3"
          }
        >
          <div className="rounded-2xl bg-[#FCFCFB] p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#CEB591]" />
            </div>
        
            <p className="mt-2 text-sm font-bold text-[#283C5D]">
              {inClinicPrice ? inClinicPrice : t.free}
            </p>
          </div>
        
          {shouldShowOnlineCard ? (
            <div className="rounded-2xl bg-[#FCFCFB] p-4">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-[#CEB591]" />
              </div>
          
              <p className="mt-2 text-sm font-bold text-[#283C5D]">
                {onlinePrice ? onlinePrice : t.free}
              </p>
            </div>
          ) : null}
        </div>

        <Link
          href={`/doctors/${doctor.slug}`}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#283C5D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1f2f49] active:scale-[0.98]"
        >
          {t.viewProfile}
        </Link>
      </div>
    </article>
  );
}