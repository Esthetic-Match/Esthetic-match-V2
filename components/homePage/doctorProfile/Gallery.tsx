"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Lock } from "lucide-react";

type GalleryProps = {
  doctorId: string;
  paidPlan: "free" | "standard" | string | null;
};

type GalleryItem = {
  beforeImageUrl: string;
  afterImageUrl: string;
};

export default function Gallery({ doctorId, paidPlan }: GalleryProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const isFreePlan = paidPlan === "free" || !paidPlan;

  useEffect(() => {
    async function fetchGallery() {
      const res = await fetch(
        `/api/public-pages/single-profile/gallery?doctorId=${doctorId}`
      );

      if (!res.ok) return;

      const data = await res.json();
      setGallery(data);
    }

    fetchGallery();
  }, [doctorId]);

  const visibleGallery = isFreePlan ? gallery.slice(0, 3) : gallery;
  const hiddenCount = Math.max(gallery.length - visibleGallery.length, 0);

if (visibleGallery.length === 0) {
  return (
    <section
      aria-labelledby="doctor-gallery-title"
      className="relative z-20 mx-auto my-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <ImageIcon size={21} className="text-[#d8bd8d]" />

        <h2
          id="doctor-gallery-title"
          className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]"
        >
          Photo Gallery
        </h2>
      </div>

      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#d8bd8d]/40 bg-[#FAF9F7] px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#283C5D]">
          <ImageIcon size={28} className="text-[#d8bd8d]" />
        </div>

        <h3 className="mt-6 text-lg font-semibold text-[#283C5D]">
          No Before & After Images
        </h3>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#283C5D]/60">
          This doctor has not added any treatment transformation images yet.
        </p>
      </div>
    </section>
  );
}

  return (
    <section
      aria-labelledby="doctor-gallery-title"
      className="relative z-20 mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <ImageIcon size={21} className="text-[#d8bd8d]" />

        <h2
          id="doctor-gallery-title"
          className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]"
        >
          Photo Gallery
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {visibleGallery.map((item, index) => (
          <BeforeAfterCard
            key={`${doctorId}-${index}`}
            beforeImageUrl={item.beforeImageUrl}
            afterImageUrl={item.afterImageUrl}
          />
        ))}

        {isFreePlan && hiddenCount > 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl bg-[#07182A]/80 p-5 text-center text-white backdrop-blur-md">
            <Lock size={26} className="mb-4 text-[#d8bd8d]" />
            <p className="text-lg font-semibold">+{hiddenCount} more</p>
            <p className="mt-4 text-sm leading-relaxed text-white/85">
              More results are available on this doctor profile.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BeforeAfterCard({
  beforeImageUrl,
  afterImageUrl,
}: {
  beforeImageUrl: string;
  afterImageUrl: string;
}) {
  return (
    <article className="grid grid-cols-2 gap-2">
      <GalleryImage src={beforeImageUrl} label="Before" />
      <GalleryImage src={afterImageUrl} label="After" />
    </article>
  );
}

function GalleryImage({ src, label }: { src: string; label: string }) {
  return (
    <figure>
      <div className="relative h-40 overflow-hidden rounded-xl bg-[#FAF9F7]">
        <img
          src={src}
          alt={`${label} treatment result`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <figcaption className="mt-2 text-center text-xs font-medium text-[#283C5D]/65">
        {label}
      </figcaption>
    </figure>
  );
}