"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type GalleryProps = {
  doctorId: string;
  paidPlan: "free" | "standard" | string | null;
};

type GalleryItem = {
  beforeImageUrl: string;
  afterImageUrl: string;
  isPublic: boolean;
};

export default function Gallery({ doctorId, paidPlan }: GalleryProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  const t = useTranslations("doctor.doctor.profile.gallery");

  useEffect(() => {
    async function fetchGallery() {
      const res = await fetch(
        `/api/public-pages/single-profile/gallery?doctorId=${doctorId}`
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Gallery API error:", data);
        return;
      }


      setGallery(data);
    }

    fetchGallery();
  }, [doctorId]);

  const shouldCollapse = gallery.length > 3;

  const visibleGallery =
    shouldCollapse && !showAll
      ? gallery.slice(0, 3)
      : gallery;

  const hiddenCount = Math.max(gallery.length - 3, 0);

  if (visibleGallery.length === 0) {
    return (
      <section
        aria-labelledby="doctor-gallery-title"
        className="relative z-20 mx-auto my-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8 my-4"
      >
        <div className="mb-6 flex items-center gap-3">
          <ImageIcon size={21} className="text-[#d8bd8d]" />

          <h2
            id="doctor-gallery-title"
            className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]"
          >
            {t("title")}
          </h2>
        </div>

        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#d8bd8d]/40 bg-[#FAF9F7] px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#283C5D]">
            <ImageIcon size={28} className="text-[#d8bd8d]" />
          </div>

          <h3 className="mt-6 text-lg font-semibold text-[#283C5D]">
            {t("noImagesTitle")}
          </h3>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#283C5D]/60">
            {t("noImagesDescription")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="doctor-gallery-title"
      className="relative z-20 mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8 my-4"
    >
      <div className="mb-6 flex items-center gap-3">
        <ImageIcon size={21} className="text-[#d8bd8d]" />

        <h2
          id="doctor-gallery-title"
          className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]"
        >
          {t("title")}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {visibleGallery.map((item, index) => (
          <BeforeAfterCard
            key={`${doctorId}-${index}`}
            beforeImageUrl={item.beforeImageUrl}
            afterImageUrl={item.afterImageUrl}
            isPublic={item.isPublic}
            beforeLabel={t("before")}
            afterLabel={t("after")}
          />
        ))}
      </div>

      {shouldCollapse ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="rounded-full border border-[#283C5D]/15 bg-[#FAF9F7] px-5 py-2 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.98]"
          >
            {showAll
              ? t("showLess")
              : t("viewMore", { count: hiddenCount })}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function BeforeAfterCard({
  beforeImageUrl,
  afterImageUrl,
  isPublic,
  beforeLabel,
  afterLabel,
}: {
  beforeImageUrl: string;
  afterImageUrl: string;
  isPublic: boolean;
  beforeLabel: string;
  afterLabel: string;
}) {
  const t = useTranslations("doctor.doctor.profile.gallery");
  return (
    <article className="relative grid grid-cols-2 gap-2">
      <GalleryImage
        src={beforeImageUrl}
        label={beforeLabel}
        isPublic={isPublic}
      />

      <GalleryImage
        src={afterImageUrl}
        label={afterLabel}
        isPublic={isPublic}
      />

      {!isPublic ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-[#d8bd8d] bg-[#52627c] px-5 py-2 backdrop-blur-md shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {t("Message Doctor")}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function GalleryImage({
  src,
  label,
  isPublic,
}: {
  src: string;
  label: string;
  isPublic: boolean;
}) {
  return (
    <figure>
      <div className="relative h-40 overflow-hidden rounded-xl bg-[#FAF9F7]">
        <img
          src={src}
          alt={`${label} treatment result`}
          className={`h-full w-full object-cover ${
            isPublic ? "" : "scale-110 blur-xl"
          }`}
          loading="lazy"
        />

        {!isPublic ? (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        ) : null}
      </div>

      <figcaption className="mt-2 text-center text-xs font-medium text-[#283C5D]/65">
        {label}
      </figcaption>
    </figure>
  );
}