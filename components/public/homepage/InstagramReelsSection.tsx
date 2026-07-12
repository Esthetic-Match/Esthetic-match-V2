"use client";

import { useEffect, useRef, useState } from "react";
import { RadioTower, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

type InstagramReelRecord = {
  id: string;
  url: string;
  sortOrder: number;
};

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseReels(payload: unknown): InstagramReelRecord[] {
  if (!isRecord(payload)) return [];

  const possibleReels = Array.isArray(payload.reels)
    ? payload.reels
    : isRecord(payload.data) && Array.isArray(payload.data.reels)
      ? payload.data.reels
      : [];

  return possibleReels.reduce<InstagramReelRecord[]>(
    (records, item: unknown) => {
      if (!isRecord(item)) return records;

      if (
        typeof item.id !== "string" ||
        typeof item.url !== "string" ||
        typeof item.sortOrder !== "number"
      ) {
        return records;
      }

      records.push({
        id: item.id,
        url: item.url,
        sortOrder: item.sortOrder,
      });

      return records;
    },
    []
  );
}

function splitIntoColumns(
  reels: InstagramReelRecord[]
): InstagramReelRecord[][] {
  const columns: InstagramReelRecord[][] = [[], [], []];

  reels.forEach((reel: InstagramReelRecord, index: number) => {
    columns[index % 3].push(reel);
  });

  return columns;
}

function extractShortcode(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/
  );

  return match ? match[1] : null;
}

function buildEmbedUrl(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}/embed/`;
}

export default function InstagramReelsSection() {
  const t = useTranslations("home.instagramReels");

  const [reels, setReels] = useState<InstagramReelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const columnOneRef = useRef<HTMLDivElement>(null);
  const columnTwoRef = useRef<HTMLDivElement>(null);
  const columnThreeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReels(): Promise<void> {
      try {
        const response = await fetch("/api/instagram-reels", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load Instagram Reels.");
        }

        const payload: unknown = await response.json();

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

        console.error("Could not load Instagram Reels:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadReels();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const columnRefs = [
      columnOneRef,
      columnTwoRef,
      columnThreeRef,
    ];

    const directions = [-140, 140, -140];

    let frameId: number | null = null;

    function updateParallax(): void {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const section = sectionRef.current;

        if (!section) return;

        const isDesktop = window.matchMedia(
          "(min-width: 1024px)"
        ).matches;

        if (!isDesktop) {
          columnRefs.forEach(
            (ref: React.RefObject<HTMLDivElement | null>) => {
              if (ref.current) {
                ref.current.style.transform = "";
              }
            }
          );

          return;
        }

        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const sectionHeight = section.offsetHeight;

        const progress = Math.min(
          1,
          Math.max(
            0,
            (viewportHeight - rect.top) /
              (viewportHeight + sectionHeight)
          )
        );

        columnRefs.forEach(
          (
            ref: React.RefObject<HTMLDivElement | null>,
            index: number
          ) => {
            if (!ref.current) return;

            ref.current.style.transform = `translate3d(
              0,
              ${directions[index] * progress}px,
              0
            )`;
          }
        );
      });
    }

    window.addEventListener("scroll", updateParallax, {
      passive: true,
    });

    window.addEventListener("resize", updateParallax);

    updateParallax();

    return () => {
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [reels]);

  if (!isLoading && reels.length === 0) {
    return null;
  }

  const columns = splitIntoColumns(reels);

  return (
    <section
      ref={sectionRef}
      className="relative mt-10 pb-20 overflow-hidden"
    >
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-[#283C5D]/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1180px] px-5 pb-8 pt-12 text-center md:px-8 md:pt-16">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D8BD8D]/50 bg-white px-4 py-2 shadow-sm">
          <RadioTower size={15} className="text-[#D8BD8D]" />

          <span className="text-md font-bold uppercase tracking-[0.25em] text-[#283C5D]">
            {t("title")}
          </span>
        </div>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#283C5D]/60 md:text-base">
          {t("description")}
        </p>
      </div>

      <div className="relative px-4 md:px-6">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#D8BD8D] shadow-[0_14px_40px_rgba(40,60,93,0.12)]">
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
              </span>

              <p className="text-sm font-medium text-[#283C5D]/55">
                {t("loading")}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 sm:grid-cols-2 gap-6 py-16 lg:grid-cols-3 lg:gap-7 lg:py-24">
            {columns.map(
              (
                column: InstagramReelRecord[],
                columnIndex: number
              ) => {
                const columnRef =
                  columnIndex === 0
                    ? columnOneRef
                    : columnIndex === 1
                      ? columnTwoRef
                      : columnThreeRef;

                return (
                  <div
                    key={columnIndex}
                    ref={columnRef}
                    className="grid content-start gap-6 transition-transform duration-75 lg:gap-7"
                  >
                    {column.map((reel: InstagramReelRecord) => {
                      const shortcode = extractShortcode(reel.url);

                      if (!shortcode) return null;

                      const embedUrl = buildEmbedUrl(shortcode);

                      return (
                        <article className="overflow-hidden rounded-[1rem] border border-[#E7DDD0] bg-white shadow-[0_22px_60px_rgba(40,60,93,0.10)]">
                          <div className="h-[460px] overflow-hidden">
                            <iframe
                              src={embedUrl}
                              className="-ml-[80px] -mt-[150px] block h-[610px] w-[calc(100%+160px)] max-w-none border-0"
                              scrolling="no"
                              allowFullScreen
                              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                              loading="lazy"
                              title={t("iframeTitle", {
                                shortcode,
                              })}
                            />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}