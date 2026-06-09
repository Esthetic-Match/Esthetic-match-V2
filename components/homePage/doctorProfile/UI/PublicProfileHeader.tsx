import Image from "next/image";
import { BadgeCheck, Building2, MapPin, Award } from "lucide-react";
import { getTranslations } from "next-intl/server";
import DoctorFavoriteButton from "./FavoriteButton";

type PublicProfileHeaderProps = {
  doctorProfile: {
    id: string;
    avatar: string | null;
    clinicName: string;
    specialtyIds: string[];
    topThree: string[];
    workAddress: string;
    city: string | null;
    country: string | null;
    yearsOfExperience: number | null;
    googleRating: number | null;
    googleReviewCount: number | null;
    RPPS: string | null;
    user: {
      name: string | null;
      image: string | null;
    };
  };
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default async function PublicProfileHeader({
  doctorProfile,
}: PublicProfileHeaderProps) {
  const t = await getTranslations("doctor.doctor.profile");
  const specialtiesT = await getTranslations("specialitiesName");
  const proceduresT = await getTranslations("proceduresName");

  const name = doctorProfile.user.name ?? "Doctor";
  const avatar = doctorProfile.avatar ?? doctorProfile.user.image;
  const initials = getInitials(name);
  const RPPS = doctorProfile.RPPS;

  const location = [
    doctorProfile.workAddress,
    doctorProfile.city,
    doctorProfile.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      itemScope
      itemType="https://schema.org/Physician"
      className="relative z-20 mx-auto -mt-16 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white px-6 pb-8 pt-8 shadow-lg md:-mt-20 md:px-10 md:pt-10"
    >
      <DoctorFavoriteButton doctorProfileId={doctorProfile.id} />

      <div className="relative mx-auto -mt-24 mb-6 h-40 w-40 md:absolute md:-top-20 md:left-10 md:mx-0 md:mb-0 md:mt-0">
        <div className="relative h-40 w-40 rounded-full border-4 border-white bg-white shadow-md">
          {avatar?.trim() ? (
            <Image
              src={avatar}
              alt={`${name}`}
              fill
              priority
              sizes="160px"
              className="rounded-full object-cover"
              itemProp="image"
            />
          ) : (
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-[#283c5d] text-2xl font-semibold text-white">
              {initials}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 md:ml-48 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 pr-14">
            <h1
              itemProp="name"
              className="text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl"
            >
              {name}
            </h1>

            <BadgeCheck
              size={18}
              className="fill-[#d8bd8d] text-white"
              aria-hidden="true"
            />
          </div>

          <div className="mt-5 space-y-3">
            {doctorProfile.clinicName ? (
              <div className="flex items-center gap-3 text-sm font-medium text-[#283C5D]">
                <Building2 size={17} className="text-[#d8bd8d]" />
                <span itemProp="worksFor">{doctorProfile.clinicName}</span>
              </div>
            ) : null}

            {location ? (
              <div
                itemProp="address"
                itemScope
                itemType="https://schema.org/PostalAddress"
                className="flex items-center gap-3 text-sm text-[#283C5D]/75"
              >
                <MapPin size={17} className="text-[#283C5D]/55" />
                <span>{location}</span>

                <meta
                  itemProp="streetAddress"
                  content={doctorProfile.workAddress}
                />
                {doctorProfile.city ? (
                  <meta
                    itemProp="addressLocality"
                    content={doctorProfile.city}
                  />
                ) : null}
                {doctorProfile.country ? (
                  <meta
                    itemProp="addressCountry"
                    content={doctorProfile.country}
                  />
                ) : null}
              </div>
            ) : null}

            {RPPS ? (
              <div className="flex items-center gap-3 text-sm text-[#283C5D]/75">
                <Award size={17} className="text-[#283C5D]/55" />
                <span className="text-sm font-medium tracking-tight">
                  {t("header.RPPS")} {RPPS}
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-7 grid max-w-4xl grid-cols-1 gap-6 border-t border-black/10 pt-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">
                {t("header.specialty")}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {doctorProfile.specialtyIds.length > 0 ? (
                  doctorProfile.specialtyIds.map((item) => (
                    <span
                      key={item}
                      itemProp="medicalSpecialty"
                      className="inline-flex rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-1.5 text-xs font-medium text-[#283C5D]"
                    >
                      {specialtiesT(item)}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-1.5 text-xs font-medium text-[#283C5D]">
                    {t("common.notAvailable")}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">
                {t("header.topProcedures")}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {doctorProfile.topThree.length > 0 ? (
                  doctorProfile.topThree.map((procedure) => (
                    <span
                      key={procedure}
                      className="inline-flex rounded-full border border-[#d8bd8d]/40 bg-[#d8bd8d] px-4 py-1.5 text-xs font-medium text-[#283C5D]"
                    >
                      {proceduresT(procedure)}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex rounded-full border border-dashed border-black/10 bg-[#FAF9F7] px-4 py-1.5 text-xs font-medium text-[#283C5D]/55">
                    {t("header.noTopProcedures")}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">
                {t("header.yearsOfExperience")}
              </p>

              <p className="mt-2 text-sm font-semibold text-[#283C5D]">
                {doctorProfile.yearsOfExperience != null
                  ? `${doctorProfile.yearsOfExperience} ${t("header.years")}`
                  : t("common.notAvailable")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}