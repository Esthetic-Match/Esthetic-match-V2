"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import UploadImageWidget from "@/components/UI/UploadImageWidget";

type DoctorMediaProfile = {
  id: string;
  userId: string;
  clinicName: string;
  avatar: string | null;
  clinicBanner: string | null;
  user: {
    name: string | null;
    email: string;
  };
};

type MediaField =
  | "avatar"
  | "clinicBanner";

type MediaUploadState = {
  profile: DoctorMediaProfile;
  field: MediaField;
};

type MediaStatusProps = {
  hasImage: boolean;
};

type DoctorMediaImageProps = {
  src: string | null;
  alt: string;
  fallback?: string;
};

type MediaUploadModalProps = {
  profile: DoctorMediaProfile;
  field: MediaField;
  onClose: () => void;
  onUploaded: (url: string) => Promise<void>;
};

function MediaStatus({
  hasImage,
}: MediaStatusProps) {
  const t = useTranslations(
    "admin.adminDoctorMediaManager"
  );

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        hasImage
          ? "bg-[#FAF2DE] text-[#283C5D]"
          : "bg-[#283C5D]/10 text-[#283C5D]/55"
      }`}
    >
      {hasImage
        ? t("status.yes")
        : t("status.no")}
    </span>
  );
}

function DoctorMediaImage({
  src,
  alt,
  fallback = "/images/default-doctor.png",
}: DoctorMediaImageProps) {
  const [imageSrc, setImageSrc] =
    useState(src || fallback);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="44px"
      className="object-cover"
      onError={() => {
        setImageSrc(fallback);
      }}
    />
  );
}

function MediaUploadModal({
  profile,
  field,
  onClose,
  onUploaded,
}: MediaUploadModalProps) {
  const t = useTranslations(
    "admin.adminDoctorMediaManager"
  );

  const isAvatar = field === "avatar";

  const uploadPath = isAvatar
    ? `doctor-profile/${profile.userId}/avatar`
    : `doctor-profile/${profile.id}/banner`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
              {t("modal.eyebrow")}
            </p>

            <h2 className="mt-2 text-lg font-bold text-[#283C5D]">
              {isAvatar
                ? t(
                    "modal.uploadProfilePicture"
                  )
                : t(
                    "modal.uploadBannerPicture"
                  )}
            </h2>

            <p className="mt-1 text-sm text-[#283C5D]/55">
              {profile.clinicName} ·{" "}
              {profile.user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t(
              "modal.closeAriaLabel"
            )}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/60 transition hover:bg-black/10"
          >
            <X size={18} />
          </button>
        </div>

        <UploadImageWidget
          type={
            isAvatar
              ? "profile"
              : "banner"
          }
          access="public"
          uploadPath={uploadPath}
          label={
            isAvatar
              ? t(
                  "modal.profileUploadLabel"
                )
              : t(
                  "modal.bannerUploadLabel"
                )
          }
          onUploaded={(url: string) => {
            void onUploaded(url);
          }}
        />
      </div>
    </div>
  );
}

export default function AdminDoctorMediaManager() {
  const t = useTranslations(
    "admin.adminDoctorMediaManager"
  );

  const [profiles, setProfiles] = useState<
    DoctorMediaProfile[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    activeUpload,
    setActiveUpload,
  ] = useState<MediaUploadState | null>(
    null
  );

  useEffect(() => {
    async function fetchProfiles(): Promise<void> {
      try {
        const res = await fetch(
          "/api/admin/doctor-media"
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Could not load doctor media."
          );
        }

        setProfiles(data.doctorProfiles);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchProfiles();
  }, []);

  async function updateDoctorMedia(
    doctorProfileId: string,
    field: MediaField,
    url: string
  ): Promise<void> {
    const res = await fetch(
      `/api/admin/doctor-media/${doctorProfileId}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          [field]: url,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.error ||
          "Could not update doctor media."
      );
    }

    setProfiles(
      (
        currentProfiles: DoctorMediaProfile[]
      ): DoctorMediaProfile[] =>
        currentProfiles.map(
          (
            profile: DoctorMediaProfile
          ): DoctorMediaProfile =>
            profile.id ===
            doctorProfileId
              ? data.doctorProfile
              : profile
        )
    );

    setActiveUpload(null);
  }

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            {t("eyebrow")}
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
            {t("description")}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF2DE] text-[#d8bd8d]">
          <ImageIcon size={26} />
        </div>
      </div>

      <div className="max-h-[620px] overflow-auto rounded-2xl border border-[#283C5D]/10">
        <table className="min-w-[1050px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#FAF9F7] text-xs uppercase tracking-[0.18em] text-[#283C5D]/60">
            <tr>
              <th className="px-5 py-4 font-bold">
                {t("columns.doctor")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t(
                  "columns.profilePicture"
                )}
              </th>

              <th className="px-5 py-4 font-bold">
                {t(
                  "columns.bannerPicture"
                )}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.uploadProfile")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.uploadBanner")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#283C5D]/10">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#d8bd8d]" />
                  </div>
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[#283C5D]/60"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              profiles.map(
                (
                  profile: DoctorMediaProfile
                ) => (
                  <tr
                    key={profile.id}
                    className="bg-white transition hover:bg-[#FAF9F7]"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#FAF2DE]">
                          <DoctorMediaImage
                            src={profile.avatar}
                            alt={t(
                              "imageAlt.profile",
                              {
                                doctor:
                                  profile
                                    .clinicName ||
                                  profile.user
                                    .name ||
                                  t(
                                    "unnamedDoctor"
                                  ),
                              }
                            )}
                          />
                        </div>

                        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#283C5D]/10">
                          <DoctorMediaImage
                            src={
                              profile.clinicBanner
                            }
                            alt={t(
                              "imageAlt.banner",
                              {
                                clinic:
                                  profile
                                    .clinicName ||
                                  t(
                                    "unnamedClinic"
                                  ),
                              }
                            )}
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-[#283C5D]">
                            {profile.clinicName}
                          </p>

                          <p className="mt-1 text-xs text-[#283C5D]/50">
                            {profile.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <MediaStatus
                        hasImage={Boolean(
                          profile.avatar
                        )}
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <MediaStatus
                        hasImage={Boolean(
                          profile.clinicBanner
                        )}
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveUpload({
                            profile,
                            field: "avatar",
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-[#d8bd8d]/40 px-4 py-2 text-xs font-bold text-[#283C5D] transition hover:bg-[#FAF2DE]"
                      >
                        <Pencil size={14} />

                        {t("actions.profile")}
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveUpload({
                            profile,
                            field:
                              "clinicBanner",
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-[#d8bd8d]/40 px-4 py-2 text-xs font-bold text-[#283C5D] transition hover:bg-[#FAF2DE]"
                      >
                        <Pencil size={14} />

                        {t("actions.banner")}
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {activeUpload ? (
        <MediaUploadModal
          profile={activeUpload.profile}
          field={activeUpload.field}
          onClose={() =>
            setActiveUpload(null)
          }
          onUploaded={(
            url: string
          ): Promise<void> =>
            updateDoctorMedia(
              activeUpload.profile.id,
              activeUpload.field,
              url
            )
          }
        />
      ) : null}
    </section>
  );
}