"use client";

import { ExternalLink, Globe2, Share2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const SOCIAL_MEDIA_PLATFORMS = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "YOUTUBE",
  "LINKEDIN",
  "X",
  "SNAPCHAT",
  "WEBSITE",
  "OTHER",
] as const;

type SocialMediaPlatform = (typeof SOCIAL_MEDIA_PLATFORMS)[number];

const PLATFORM_TRANSLATION_KEYS = {
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  TIKTOK: "tiktok",
  YOUTUBE: "youtube",
  LINKEDIN: "linkedin",
  X: "x",
  SNAPCHAT: "snapchat",
  WEBSITE: "website",
  OTHER: "other",
} as const satisfies Record<SocialMediaPlatform, string>;

type PublicSocialMediaLink = {
  id: string;
  platform: SocialMediaPlatform;
  url: string;
  username: string | null;
  label: string | null;
  sortOrder: number;
};

type PublicLinksResponse = {
  links: PublicSocialMediaLink[];
};

type DoctorSocialMediaLinksProps = {
  doctorId: string;
  className?: string;
};

const PLATFORM_ICON_PATHS: Partial<Record<SocialMediaPlatform, string>> = {
  INSTAGRAM: "/icons/igIcon.svg",
  FACEBOOK: "/icons/facebookIcon.svg",
  TIKTOK: "/icons/tiktokIcon.svg",
  YOUTUBE: "/icons/youtubeIcon.svg",
  LINKEDIN: "/icons/linkedinIcon.svg",
  X: "/icons/xIcon.svg",
  SNAPCHAT: "/icons/snapchatIcon.svg",
};

function PlatformIcon({ platform }: { platform: SocialMediaPlatform }) {
  const iconPath = PLATFORM_ICON_PATHS[platform];

  if (iconPath) {
    return (
      <Image
        src={iconPath}
        alt=""
        width={20}
        height={20}
        aria-hidden="true"
        className="h-5 w-5 object-contain transition duration-300 group-hover:scale-105"
      />
    );
  }

  if (platform === "WEBSITE") {
    return <Globe2 size={18} aria-hidden="true" />;
  }

  return <Share2 size={18} aria-hidden="true" />;
}

function getDisplayText(
  link: PublicSocialMediaLink,
  translatedPlatformName: string,
) {
  const label = link.label?.trim();
  const username = link.username?.trim();

  if (label) {
    return label;
  }

  if (username) {
    return username.startsWith("@") ? username : `@${username}`;
  }

  return translatedPlatformName;
}

export default function DoctorSocialMediaLinks({
  doctorId,
  className = "",
}: DoctorSocialMediaLinksProps) {
  const t = useTranslations("doctor.socialMediaDisplay");
  const tPlatforms = useTranslations("doctor.socialMedia.platforms");

  const [links, setLinks] = useState<PublicSocialMediaLink[] | null>(null);

  useEffect(() => {
    const normalizedDoctorId = doctorId.trim();

    if (!normalizedDoctorId) {
      return;
    }

    const controller = new AbortController();

    async function fetchLinks() {
      try {
        const response = await fetch(
          `/api/public-pages/doctor-social-media/${encodeURIComponent(
            normalizedDoctorId,
          )}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          if (!controller.signal.aborted) {
            setLinks([]);
          }

          return;
        }

        const data = (await response.json()) as PublicLinksResponse;

        if (!controller.signal.aborted) {
          setLinks(data.links);
        }
      } catch {
        if (!controller.signal.aborted) {
          setLinks([]);
        }
      }
    }

    void fetchLinks();

    return () => {
      controller.abort();
    };
  }, [doctorId]);

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={`w-full px-4 py-2 sm:px-6 lg:px-8 ${className}`}>
      <section
        aria-labelledby="doctor-social-media-heading"
        className="relative z-20 mx-auto w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-gray-300/10 bg-white shadow-lg"
      >
        <div className="flex items-center gap-3 border-b border-[#283C5D]/10 px-6 py-5 sm:px-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#B89558]">
            <Share2 size={18} aria-hidden="true" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B89558]">
              {t("eyebrow")}
            </p>

            <h2
              id="doctor-social-media-heading"
              className="mt-1 text-lg font-semibold text-[#283C5D]"
            >
              {t("title")}
            </h2>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          {links.map((link) => {
            const platformName = tPlatforms(
              PLATFORM_TRANSLATION_KEYS[link.platform],
            );

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("openPlatform", {
                  platform: platformName,
                })}
                className="group flex min-h-16 items-center gap-3 rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#D8BD8D]/60 hover:bg-white hover:shadow-[0_12px_30px_rgba(40,60,93,0.08)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#283C5D] shadow-sm transition duration-300 group-hover:shadow-md">
                  <PlatformIcon platform={link.platform} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#283C5D]/50">
                    {platformName}
                  </span>

                  <span className="mt-1 block truncate text-sm font-semibold text-[#283C5D]">
                    {getDisplayText(link, platformName)}
                  </span>
                </span>

                <ExternalLink
                  size={15}
                  aria-hidden="true"
                  className="shrink-0 text-[#283C5D]/35 transition group-hover:text-[#B89558]"
                />
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}