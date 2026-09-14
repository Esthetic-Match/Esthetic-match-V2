"use client";

import {
  ArrowUpRight,
  Building2,
  Globe2,
  MapPin,
  Star,
  Video,
} from "lucide-react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import { Link } from "@/i18n/navigation";

import type {
  LumiDoctor,
} from "./types";

type Props = {
  doctor: LumiDoctor;
};

function formatPrice(
  value: number | string | null,
  currency: string,
  locale: string,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return null;
  }

  try {
    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",

        currency:
          currency?.toUpperCase() ||
          "EUR",

        maximumFractionDigits: 0,
      },
    ).format(numericValue);
  } catch {
    return `${numericValue} ${currency}`;
  }
}

export default function LumiDoctorCard({
  doctor,
}: Props) {
  const t = useTranslations(
    "lumi.LumiDoctorCard",
  );

  const locale =
    useLocale();

  const initials =
    doctor.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase(),
      )
      .join("") || "DR";

  const rating =
    doctor.googleRating ??
    doctor.emRating;

  const inClinicPrice =
    formatPrice(
      doctor.inClinicPrice,
      doctor.currency,
      locale,
    );

  const onlinePrice =
    formatPrice(
      doctor.onlineConsulPrice,
      doctor.currency,
      locale,
    );

  const profileHref =
    doctor.slug
      ? `/doctors/${doctor.slug}`
      : null;

  return (
    <article className="flex w-[300px] shrink-0 snap-start flex-col rounded-[1.5rem] border border-[#283C5D]/10 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-[350px]">
      {/* Doctor */}
      <div className="flex items-center gap-3">
        {doctor.avatar ? (
          <img
            src={doctor.avatar}
            alt={
              doctor.name ??
              t("doctorFallback")
            }
            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-sm font-semibold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[#061A2D]">
            {doctor.name ??
              t("doctorFallback")}
          </h3>

          {doctor.clinicName && (
            <p className="mt-0.5 truncate text-xs text-[#283C5D]/55">
              {doctor.clinicName}
            </p>
          )}

          {rating !== null && (
            <div className="mt-1.5 flex items-center gap-1">
              <Star
                size={13}
                className="fill-[#D8BD8D] text-[#D8BD8D]"
              />

              <span className="text-xs font-semibold text-[#283C5D]">
                {rating.toFixed(
                  1,
                )}
              </span>

              {(doctor.googleReviewCount ??
                doctor.emReviewCount) >
                0 && (
                <span className="text-[11px] text-[#283C5D]/40">
                  (
                  {doctor.googleReviewCount ??
                    doctor.emReviewCount}
                  )
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#283C5D]/60">
        {(doctor.city ||
          doctor.country) && (
          <span className="flex items-center gap-1.5">
            <MapPin
              size={13}
            />

            {[
              doctor.city,
              doctor.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        )}

        {doctor.onlineActive && (
          <span className="flex items-center gap-1.5">
            <Globe2
              size={13}
            />

            {t(
              "onlineAvailable",
            )}
          </span>
        )}
      </div>

      {/* Experience */}
      {doctor.yearsOfExperience !==
        null && (
        <p className="mt-3 text-xs text-[#283C5D]/55">
          {t(
            "yearsExperience",
            {
              years:
                doctor.yearsOfExperience,
            },
          )}
        </p>
      )}

      {/* Relevant procedures */}
      {doctor
        .matchedProcedures
        .length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {doctor.matchedProcedures
            .slice(0, 2)
            .map(
              (procedure) => (
                <span
                  key={
                    procedure.procedureId
                  }
                  className="rounded-full bg-[#FAF9F7] px-2.5 py-1 text-[11px] font-medium text-[#283C5D]/70"
                >
                  {
                    procedure.name
                  }
                </span>
              ),
            )}
        </div>
      )}

      {/* Consultation prices */}
      {(inClinicPrice ||
        onlinePrice) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {inClinicPrice && (
            <div className="rounded-xl bg-[#FAF9F7] px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#283C5D]/45">
                <Building2
                  size={12}
                />

                {t(
                  "inClinic",
                )}
              </div>

              <p className="mt-1 text-sm font-semibold text-[#061A2D]">
                {inClinicPrice}
              </p>
            </div>
          )}

          {onlinePrice && (
            <div className="rounded-xl bg-[#FAF9F7] px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#283C5D]/45">
                <Video
                  size={12}
                />

                {t(
                  "online",
                )}
              </div>

              <p className="mt-1 text-sm font-semibold text-[#061A2D]">
                {onlinePrice}
              </p>
            </div>
          )}
        </div>
      )}

      {/* View profile */}
      {profileHref && (
        <div className="mt-auto pt-4">
          <Link
            href={profileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#283C5D] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#061A2D]"
          >
            {t(
              "viewProfile",
            )}

            <ArrowUpRight
              size={14}
            />
          </Link>
        </div>
      )}
    </article>
  );
}