"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  MapPin,
  Pencil,
  Building2,
  BadgeCheck,
  Award,
  Share2 ,
  SquareChartGantt,
  Check,
} from "lucide-react";
import { handleImageUpload } from "@/lib/helpers/helper";
import ImageUploadModal from "./UI/ImageUploadModal";
import type { DoctorProfileData } from "./types";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

type ProfileHeaderProps = {
  userId: string;
  slug?: string | null;
  name: string;
  specialty?: string[] | null;
  clinicName?: string | null;
  workAddress?: string | null;
  topThree?: string[] | null;
  avatar?: string | null;
  yearsOfExperience?: number | null;
  RPPS?: string | null;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void;
};

const fallbackAvatar = "/dev/profile-placeholder.jpg";

export default function ProfileHeader({
  userId,
  slug,
  name,
  specialty,
  clinicName,
  workAddress,
  topThree,
  avatar,
  yearsOfExperience,
  onUpdateProfile,
  RPPS,
}: ProfileHeaderProps) {
  const t = useTranslations("dashboard");
  const specialtiesT = useTranslations("specialitiesName");
  const proceduresT = useTranslations("proceduresName");
  const locale = useLocale();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    avatar || fallbackAvatar
  );
  const [copied, setCopied] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "EM";

  async function handleAvatarUploaded(url: string) {
    await handleImageUpload({
      newUrl: url,
      currentValue: currentAvatar,
      setValue: setCurrentAvatar,
      field: "avatar",
      onUpdateProfile,
    });
  }

  async function handleDeleteAvatar() {
    await handleImageUpload({
      newUrl: null,
      currentValue: currentAvatar,
      fallbackValue: fallbackAvatar,
      setValue: setCurrentAvatar,
      field: "avatar",
      onUpdateProfile,
    });
  }

  async function copyProfileUrl() {
    if (!slug) return;

    const profileUrl = `${window.location.origin}/${locale}/doctors/${slug}`;

    await navigator.clipboard.writeText(profileUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <section className="relative z-20 mx-auto -mt-16 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white px-6 pb-8 pt-24 shadow-lg md:-mt-20 md:px-10 md:pt-10">
      <div className="absolute -top-20 left-6 md:left-10">
        <div className="relative h-40 w-40 rounded-full border-4 border-white bg-white shadow-md md:h-40 md:w-40">
          {avatar ? (
            <Image
              src={avatar}
              alt={`${name} ${t("header.profilePhoto")}`}
              aria-label={t("header.editProfilePhoto")}
              fill
              sizes="160px"
              className="rounded-full object-cover"
            />
          ) : (
            <div className="absolute flex h-38 w-38 items-center justify-center rounded-full bg-[#283c5d] text-2xl font-semibold text-white">
              {initials}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsAvatarModalOpen(true);
            }}
            className="absolute bottom-1 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 
            bg-white text-[#283C5D] cursor-pointer shadow-md transition hover:text-white hover:bg-[#283c5d] hover:border-white hover:border-2 active:scale-[0.96]"
            aria-label="Edit profile photo"
          >
            <Camera size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:ml-48 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl">
              {name}
            </h1>

            <BadgeCheck size={18} className="fill-[#d8bd8d] text-white" />
          </div>

          <div className="mt-5 space-y-3">
            {clinicName ? (
              <div className="flex items-center gap-3 text-sm font-medium text-[#283C5D]">
                <Building2 size={17} className="text-[#d8bd8d]" />
                <span>{clinicName}</span>
              </div>
            ) : null}

            {workAddress ? (
              <div className="flex items-center gap-3 text-sm text-[#283C5D]/75">
                <MapPin size={17} className="text-[#283C5D]/55" />
                <span>{workAddress}</span>
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
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#283C5D]/45">
                {t("header.specialty")}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {specialty && specialty.length > 0 ? (
                  specialty.map((item) => (
                    <span
                      key={item}
                      className="inline-flex rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-1.5 text-xs font-medium text-[#283C5D]"
                    >
                      {specialtiesT(item)}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-1.5 text-xs font-medium text-[#283C5D]">
                    {t("common.notAvailableShort")}
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-[#283C5D]/45">
                {t("header.topProcedures")}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {topThree && topThree.length > 0 ? (
                  topThree.map((procedure) => (
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

            <div className="min-w-0">
              <p className="text-xs font-medium text-[#283C5D]/45">
                {t("header.yearsOfExperience")}
              </p>

              <p className="mt-2 text-sm font-semibold text-[#283C5D]">
                {yearsOfExperience != null
                  ? t("header.years", { count: yearsOfExperience })
                  : t("common.notAvailable")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center sm:flex-col">
          <Link
            href="/dashboard/settings"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#283C5D]/10 bg-white px-6 py-2 text-xs 
            font-medium text-[#283C5D] shadow-sm transition hover:bg-[#283C5D] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <Pencil size={20} />
            <p className="pl-2">{t("header.edit")}</p>
          </Link>
          
          <button
            type="button"
            onClick={copyProfileUrl}
            disabled={!slug}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#283C5D]/10 bg-white px-6 py-2 text-xs 
            font-medium text-[#283C5D] shadow-sm transition hover:bg-[#283C5D] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {copied ? <Check size={18} /> : <Share2  size={18} />}
            <p>{t("header.copy")}</p>
          </button>
          
          <Link
            href={`/doctors/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#283C5D]/10 bg-white px-6 py-2 text-xs 
            font-medium text-[#283C5D] shadow-sm transition hover:bg-[#283C5D] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <SquareChartGantt  size={20} />
            <p className="pl-2">{t("header.viewPublicProfile")}</p>
          </Link>
        </div>
      </div>

      <ImageUploadModal
        isOpen={isAvatarModalOpen}
        ImagePath={`doctor-profile/${userId}/avatar`}
        currentImage={currentAvatar === fallbackAvatar ? null : currentAvatar}
        onClose={() => setIsAvatarModalOpen(false)}
        onImageloaded={handleAvatarUploaded}
        onDeleteBanner={handleDeleteAvatar}
      />
    </section>
  );
}