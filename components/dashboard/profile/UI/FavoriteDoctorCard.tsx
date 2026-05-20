"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

type FavoriteDoctorCardProps = {
  doctor: {
    id: string;
    clinicName?: string | null;
    specialtyIds?: string[] | null;
    googleRating?: number | null;
    googleReviewCount?: number | null;
    country?: string | null;
    avatar?: string | null;
    user?: {
      name?: string | null;
    } | null;
  };
};

export default function FavoriteDoctorCard({
  doctor,
}: FavoriteDoctorCardProps) {
    const t = useTranslations("specialitiesName");
  const [imageSrc, setImageSrc] = useState(
    doctor.avatar || "/images/default-doctor.png"
  );

  const doctorName =
    doctor.user?.name ?? doctor.clinicName ?? "Doctor";

  const specialty =
    doctor.specialtyIds?.[0]
      ?.replaceAll("_", " ")
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Doctor";

  return (
    <Link
      href={`/doctors/${doctor.id}`}
      className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-44 bg-[#F2F3F5]">
        <Image
          src={imageSrc}
          alt={doctorName}
          fill
          onError={() => setImageSrc("/images/default-doctor.png")}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <div className="mb-3">
          <p className="text-lg font-semibold text-[#283C5D]">
            Dr. {doctorName}
          </p>

          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8bd8d]">
            {t(specialty.toLowerCase())}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-[#283C5D]/60">
          <MapPin size={15} />

          <span>{doctor.country || "Location not added"}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="text-sm font-medium text-[#283C5D]">
            ★ {doctor.googleRating ?? "0"}

            <span className="text-[#283C5D]/45">
              {" "}({doctor.googleReviewCount ?? "0"})
            </span>
          </span>

          <ArrowRight
            size={17}
            className="text-[#283C5D] transition group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}