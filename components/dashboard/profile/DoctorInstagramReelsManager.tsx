"use client";

import {
  Camera,
  LoaderCircle,
  Mail,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type InstagramReelRecord = {
  id: string;
  url: string;
  sortOrder: number;
};

type DoctorInstagramReelsManagerProps = {
  doctorProfileId: string;
};

type InstagramEmbedData = {
  shortcode: string;
  embedUrl: string;
};

type ReelCardProps = {
  reel: InstagramReelRecord;
  isRemoving: boolean;
  onRemove: (reelId: string) => Promise<void>;
};

const CONTACT_EMAIL = "deborah.leah.levy@gmail.com";

function isRecord(
  value: unknown
): value is Record<string, unknown> {
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

function parseReels(
  payload: unknown
): InstagramReelRecord[] {
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
  isRemoving,
  onRemove,
}: ReelCardProps) {
  const t = useTranslations(
    "doctor.doctor.profile.doctorInstagramReelsManagement"
  );

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

      <div className="p-2 pt-4">
        <button
          type="button"
          disabled={isRemoving}
          onClick={() => {
            void onRemove(reel.id);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRemoving ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={17} />
          )}

          {isRemoving
            ? t("removing")
            : t("removeVideo")}
        </button>
      </div>
    </article>
  );
}

export default function DoctorInstagramReelsManager({
  doctorProfileId,
}: DoctorInstagramReelsManagerProps) {
  const t = useTranslations(
    "doctor.doctor.profile.doctorInstagramReelsManagement"
  );

  const [reels, setReels] = useState<
    InstagramReelRecord[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    removingReelId,
    setRemovingReelId,
  ] = useState<string | null>(null);

  const [hasRemoveError, setHasRemoveError] =
    useState(false);

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

        const payload =
          await parseJsonResponse(response);

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

  async function handleRemoveReel(
    reelId: string
  ): Promise<void> {
    if (removingReelId) {
      return;
    }

    setRemovingReelId(reelId);
    setHasRemoveError(false);

    try {
      const response = await fetch(
        "/api/instagram-reels/unlink",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reelId,
          }),
        }
      );

      const payload =
        await parseJsonResponse(response);

      if (!response.ok) {
        console.error(
          "Remove Instagram Reel request failed:",
          payload
        );

        throw new Error(
          "Could not remove Instagram Reel."
        );
      }

      setReels(
        (
          currentReels: InstagramReelRecord[]
        ) =>
          currentReels.filter(
            (
              reel: InstagramReelRecord
            ) => reel.id !== reelId
          )
      );
    } catch (error) {
      console.error(
        "Could not remove Instagram Reel:",
        error
      );

      setHasRemoveError(true);
    } finally {
      setRemovingReelId(null);
    }
  }

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    t("emailSubject")
  )}`;

  const hasSingleReel = reels.length === 1;

  return (
    <section className="relative mx-auto mt-8 w-full max-w-[1180px] overflow-hidden rounded-[2rem] border border-[#E7DDD0] bg-[#FAF9F7] px-5 py-7 shadow-[0_24px_70px_rgba(40,60,93,0.08)] md:px-8 md:py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#283C5D]/[0.06] blur-3xl" />

      {isLoading ? (
        <div className="relative flex min-h-[260px] flex-col items-center justify-center text-center">
          <LoaderCircle
            size={28}
            className="animate-spin text-[#D8BD8D]"
          />

          <p className="mt-4 text-sm font-medium text-[#283C5D]/60">
            {t("loading")}
          </p>
        </div>
      ) : reels.length === 0 ? (
        <div className="relative mx-auto flex max-w-2xl flex-col items-center py-8 text-center md:py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D8BD8D]/40 bg-white shadow-sm">
            <Camera
              size={28}
              className="text-[#D8BD8D]"
            />
          </div>

          <div className="mt-6 flex w-fit items-center gap-2 rounded-full border border-[#D8BD8D]/50 bg-white px-4 py-2 shadow-sm">
            <Sparkles
              size={15}
              className="text-[#D8BD8D]"
            />

            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#283C5D]">
              {t("eyebrow")}
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#283C5D] md:text-4xl">
            {t("emptyTitle")}
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#283C5D]/60 md:text-base">
            {t("emptyDescription")}
          </p>

          <a
            href={mailtoHref}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#283C5D] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(40,60,93,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1F304D]"
          >
            <Mail
              size={17}
              className="text-[#D8BD8D]"
            />

            {CONTACT_EMAIL}
          </a>
        </div>
      ) : hasSingleReel ? (
        <div className="relative grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] md:gap-14">
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

            {hasRemoveError ? (
              <p
                className="mt-6 text-sm font-medium text-red-600"
                role="alert"
              >
                {t("removeError")}
              </p>
            ) : null}
          </div>

          <div className="flex justify-center md:justify-end">
            <ReelCard
              reel={reels[0]}
              isRemoving={
                removingReelId === reels[0].id
              }
              onRemove={handleRemoveReel}
            />
          </div>
        </div>
      ) : (
        <>
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

            {hasRemoveError ? (
              <p
                className="mt-5 text-sm font-medium text-red-600"
                role="alert"
              >
                {t("removeError")}
              </p>
            ) : null}
          </div>

          <div className="relative mt-10 grid justify-items-center gap-6 md:grid-cols-2 md:gap-8">
            {reels.map(
              (
                reel: InstagramReelRecord
              ) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  isRemoving={
                    removingReelId === reel.id
                  }
                  onRemove={handleRemoveReel}
                />
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}