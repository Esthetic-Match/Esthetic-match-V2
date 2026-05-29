import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Building2, Monitor, BriefcaseBusiness, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

export type DoctorCardData = {
  id: string;
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
  currency: string;
};

type DoctorCardProps = {
  doctor: DoctorCardData;
};

export default async function DoctorCards({ doctor }: DoctorCardProps) {
  const t = await getTranslations("home.Home");
  const specialtyT = await getTranslations("specialitiesName");

  const specialties = doctor.specialtyIds;

  return (
    <article
      itemScope
      itemType="https://schema.org/Physician"
      className="relative flex min-h-[285px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-3">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#FAF9F7]">
          <Image
            src={doctor.avatar || "/images/default-doctor.png"}
            alt={`${doctor.name}, ${specialties
              .map((specialtyId) => specialtyT(specialtyId))
              .join(", ")}`}
            fill
            sizes="96px"
            className="object-cover"
            itemProp="image"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 itemProp="name" className="text-xs font-bold text-[#283C5D]">
            {doctor.name}
          </h3>

          {doctor.googleReviewCount && doctor.googleRating ? (
            <div
              itemProp="aggregateRating"
              itemScope
              itemType="https://schema.org/AggregateRating"
              className="mt-2 flex items-center gap-1 text-[10px] text-[#283C5D]/60"
            >
              <Star size={11} className="fill-[#d8bd8d] text-[#d8bd8d]" />

              <span itemProp="ratingValue">{doctor.googleRating}</span>

              <span>
                ({doctor.googleReviewCount} {t("reviews")})
              </span>

              <meta
                itemProp="reviewCount"
                content={String(doctor.googleReviewCount)}
              />
            </div>
          ) : null}

          <p itemProp="address" className="mt-1 text-[10px] text-[#283C5D]/45">
            {[doctor.city, doctor.country].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#283C5D]/10 pt-3">
        {doctor.yearsOfExperience ? (
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FAF9F7] px-2 py-2 text-[10px] font-semibold text-[#283C5D]/65">
            <BriefcaseBusiness size={13} className="text-[#d8bd8d]" />
            <span>{doctor.yearsOfExperience}+ yrs</span>
          </div>
        ) : null}

        {doctor.inClinicPrice ? (
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FAF9F7] px-2 py-2 text-[10px] font-semibold text-[#283C5D]/65">
            <Building2 size={13} className="text-[#d8bd8d]" />
            <span>
              {doctor.inClinicPrice} {doctor.currency.toUpperCase()}
            </span>
          </div>
        ) : 
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FAF9F7] px-2 py-2 text-[10px] font-semibold text-[#283C5D]/65">
            <Building2 size={13} className="text-[#d8bd8d]" />
            <span>
              {t("free")}
            </span>
          </div>
        }

        {doctor.onlineConsulPrice ? (
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FAF9F7] px-2 py-2 text-[10px] font-semibold text-[#283C5D]/65">
            <Monitor size={13} className="text-[#d8bd8d]" />
            <span>
              {doctor.onlineConsulPrice} {doctor.currency.toUpperCase()}
            </span>
          </div>
        ) : 
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FAF9F7] px-2 py-2 text-[10px] font-semibold text-[#283C5D]/65">
            <Monitor size={13} className="text-[#d8bd8d]" />
            <span>
              {t("free")}
            </span>
          </div>
          }
      </div>

      {specialties.length > 0 ? (
        <div className="mt-3 border-t border-[#283C5D]/10 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((specialtyId) => (
              <span
                key={specialtyId}
                itemProp="medicalSpecialty"
                className="rounded-full border border-[#283C5D]/15 bg-white px-2.5 py-1 text-[9px] font-semibold text-[#283C5D]/65"
              >
                {specialtyT(specialtyId)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-auto pt-4">
        <Link
          href={`/doctors/${doctor.id}`}
          className="w-full inline-flex rounded-full justify-center border border-[#d8bd8d]/60 px-4 py-1.5 text-[10px] font-semibold uppercase 
          tracking-[0.08em] text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white active:scale-[0.98]"
        >
          {t("viewProfile")}
        </Link>
      </div>
    </article>
  );
}