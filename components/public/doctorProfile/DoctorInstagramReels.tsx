"use client";

import { useEffect, useState } from "react";
import {
  Camera ,
  LoaderCircle,
  Play,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

type InstagramReelRecord = {
  id: string;
  url: string;
  sortOrder: number;
};

type DoctorInstagramReelsProps = {
  doctorProfileId: string;
};

type InstagramEmbedData = {
  shortcode: string;
  embedUrl: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPayloadRecord(
  payload: unknown
): Record<string, unknown> | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function parseReels(payload: unknown): InstagramReelRecord[] {
  const record = getPayloadRecord(payload);

  if (!record || !Array.isArray(record.reels)) {
    return [];
  }

  return record.reels.reduce<InstagramReelRecord[]>(
    (
      reels: InstagramReelRecord[],
      item: unknown
    ) => {
      if (!isRecord(item)) {
        return reels;
      }

      if (
        typeof item.id !== "string" ||
        typeof item.url !== "string" ||
        typeof item.sortOrder !== "number"
      ) {
        return reels;
      }

      reels.push({
        id: item.id,
        url: item.url,
        sortOrder: item.sortOrder,
      });

      return reels;
    },
    []
  );
}

async function parseJsonResponse(
  response: Response
): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return parsed;
  } catch {
    return {
      error: raw,
    };
  }
}

function getInstagramEmbedData(
  url: string
): InstagramEmbedData | null {
  const match = url.match(
    /instagram\.com\/(?:[^/]+\/)?(reel|p)\/([A-Za-z0-9_-]+)/
  );

  if (!match) {
    return null;
  }

  const contentType = match[1];
  const shortcode = match[2];

  return {
    shortcode,
    embedUrl: `https://www.instagram.com/${contentType}/${shortcode}/embed/`,
  };
}

function ReelCard({
  reel,
}: {
  reel: InstagramReelRecord;
}) {
  const t = useTranslations("doctorInstagramReels");

  const embedData = getInstagramEmbedData(reel.url);

  if (!embedData) {
    return null;
  }

  return (
    <article className="group relative w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-[#E7DDD0] bg-white p-2 shadow-[0_24px_70px_rgba(40,60,93,0.12)] transition duration-500 ease-out hover:border-[#D8BD8D] hover:shadow-[0_30px_90px_rgba(40,60,93,0.17)]">

      <div className="overflow-hidden rounded-[1.55rem] bg-[#FAF9F7]">
        <iframe
          src={embedData.embedUrl}
          className="block w-full border-0 bg-white"
          style={{
            minHeight: 600,
          }}
          scrolling="no"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title={t("iframeTitle", {
            shortcode: embedData.shortcode,
          })}
        />
      </div>
    </article>
  );
}

export default function DoctorInstagramReels({
  doctorProfileId,
}: DoctorInstagramReelsProps) {
  const t = useTranslations("doctor.doctor.profile.doctorInstagramReels");

  const [reels, setReels] = useState<InstagramReelRecord[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!doctorProfileId.trim()) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadDoctorReels(): Promise<void> {
      try {
        const response = await fetch(
          `/api/public-pages/doctor-instagram-reels?doctorProfileId=${encodeURIComponent(
            doctorProfileId
          )}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const payload = await parseJsonResponse(response);

        if (!response.ok) {
          console.error(
            "Doctor Instagram Reel request failed:",
            payload
          );

          throw new Error(
            "Could not load doctor Instagram Reels."
          );
        }

        if (!controller.signal.aborted) {
          setReels(parseReels(payload));
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Could not load doctor Instagram Reels:",
          error
        );

        if (!controller.signal.aborted) {
          setReels([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDoctorReels();

    return () => {
      controller.abort();
    };
  }, [doctorProfileId]);

  /*
   * Avoid layout shifting while the request is running.
   * Nothing is rendered until we know that the doctor has Reels.
   */
  if (isLoading) {
    return null;
  }

  /*
   * Doctor has no associated Reels:
   * render absolutely nothing.
   */
  if (reels.length === 0) {
    return null;
  }

  const hasSingleReel = reels.length === 1;

  return (
    <section className="relative mx-auto mt-8 w-full max-w-[1180px] overflow-hidden rounded-[2rem] border border-[#E7DDD0] bg-[#FAF9F7] px-5 py-7 shadow-[0_24px_70px_rgba(40,60,93,0.08)] md:px-8 md:py-10">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#283C5D]/[0.06] blur-3xl" />

      {hasSingleReel ? (
        <div className="relative grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] md:gap-14">
          {/* Editorial content */}
          <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D8BD8D]/50 bg-white px-4 py-2 shadow-sm md:mx-0">
              <Camera
                size={15}
                className="text-[#D8BD8D]"
              />

              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#283C5D]">
                {t("eyebrow")}
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#283C5D] md:text-4xl">
              {t("singleTitle")}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#283C5D]/60 md:text-base">
              {t("singleDescription")}
            </p>

            <div className="mt-7 flex items-center justify-center gap-3 md:justify-start">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#283C5D] text-[#D8BD8D]">
                <Play
                  size={17}
                  fill="currentColor"
                />
              </span>

              <div className="text-left">
                <p className="text-sm font-semibold text-[#283C5D]">
                  {t("watchTitle")}
                </p>

                <p className="mt-0.5 text-xs text-[#283C5D]/50">
                  {t("watchDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* Single vertical Reel */}
          <div className="flex justify-center md:justify-end">
            <ReelCard reel={reels[0]} />
          </div>
        </div>
      ) : (
        <>
          {/* Two-Reel header */}
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D8BD8D]/50 bg-white px-4 py-2 shadow-sm">
              <Sparkles
                size={15}
                className="text-[#D8BD8D]"
              />

              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#283C5D]">
                {t("eyebrow")}
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#283C5D] md:text-4xl">
              {t("multipleTitle")}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#283C5D]/60 md:text-base">
              {t("multipleDescription")}
            </p>
          </div>

          {/* Two Reel grid */}
          <div className="relative mt-10 grid justify-items-center gap-6 md:grid-cols-2 md:gap-8">
            {reels.map((reel: InstagramReelRecord) => (
              <ReelCard
                key={reel.id}
                reel={reel}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}