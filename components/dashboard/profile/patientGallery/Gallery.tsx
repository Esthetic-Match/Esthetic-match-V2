"use client";

import { useEffect, useState } from "react";
import { FilePenLine, ImageIcon, Plus } from "lucide-react";
import BeforeAfterUploadModal from "../modal/BeforeAfterUploadModal";
import PrivateGcsImage from "@/components/UI/PrivateGcsImage";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type PhotoGalleryProps = {
  userId: string;
  procedureIds?: string[] | null;
};

type GalleryItem = {
  beforeImage: string;
  afterImage: string;
};

export default function PhotoGallery({
  userId,
  procedureIds,
}: PhotoGalleryProps) {
  const t = useTranslations("dashboard");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const isEmpty = gallery.length === 0;

  useEffect(() => {
    async function fetchGallery() {
      const res = await fetch(`/api/doctor-cases?doctorId=${userId}`);

      if (!res.ok) return;

      const data = (await res.json()) as GalleryItem[];

      setGallery(
        data.map((item) => ({
          beforeImage: item.beforeImage,
          afterImage: item.afterImage,
        }))
      );
    }

    fetchGallery();
  }, [userId]);

  return (
    <>
      <section className="relative z-20 mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ImageIcon size={21} className="text-[#d8bd8d]" />

            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]">
              {t("gallery.title")}
            </h2>
          </div>

          {!isEmpty && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-[#283C5D] shadow-sm transition hover:scale-[1.03] hover:border-[#d8bd8d] hover:bg-[#07182A]/75 hover:text-white active:scale-[0.97]"
              aria-label="Add gallery images"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#283C5D]/25 bg-[#FAF9F7] p-5 text-center transition hover:scale-[1.02] hover:border-[#d8bd8d] hover:bg-[#FAF9F7]/70 active:scale-[0.99]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#283C5D] shadow-sm">
                <Plus size={26} />
              </div>

              <p className="max-w-[180px] text-sm font-medium leading-relaxed text-[#283C5D]/65">
                {t("gallery.addFirstPremium")}
              </p>
            </button>

            <GalleryEditLink userId={userId} />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {gallery.map((item, index) => (
              <div
                key={`${userId}-${item.beforeImage}-${item.afterImage}-${index}`}
                className="w-[280px] shrink-0"
              >
                <BeforeAfterCard
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  beforeLabel={t("gallery.before")}
                  afterLabel={t("gallery.after")}
                />
              </div>
            ))}

            <GalleryEditLink userId={userId} compact />
          </div>
        )}
      </section>

      <BeforeAfterUploadModal
        isOpen={isUploadModalOpen}
        doctorId={userId}
        procedureIds={procedureIds}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={({ beforeImage, afterImage }) => {
          setGallery((prev) => [
            {
              beforeImage,
              afterImage,
            },
            ...prev,
          ]);
        }}
      />
    </>
  );
}

function GalleryEditLink({
  userId,
  compact = false,
}: {
  userId: string;
  compact?: boolean;
}) {
  const t = useTranslations("dashboard");

  return (
    <Link
      href={`/dashboard/${userId}/gallery`}
      className={
        compact
          ? "flex min-h-[140px] w-[140px] shrink-0 flex-col items-center justify-center rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5 text-center text-[#283C5D] transition hover:scale-[1.01] hover:border-[#d8bd8d] active:scale-[0.99]"
          : "flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5 text-center text-[#283C5D] transition hover:scale-[1.01] hover:border-[#d8bd8d] active:scale-[0.99]"
      }
    >
      <FilePenLine size={26} className="mb-4 text-[#d8bd8d]" />

      <p className="text-lg font-semibold">
        {t("gallery.editGallery")}
      </p>
    </Link>
  );
}

function BeforeAfterCard({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
}: {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <GalleryImage src={beforeImage} label={beforeLabel} />
      <GalleryImage src={afterImage} label={afterLabel} />
    </div>
  );
}

function GalleryImage({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  return (
    <div>
      <div className="relative h-40 overflow-hidden rounded-xl bg-[#FAF9F7]">
        <PrivateGcsImage
          objectPath={src}
          alt={label}
          className="h-full w-full object-cover"
        />
      </div>

      <p className="mt-2 text-center text-xs font-medium text-[#283C5D]/65">
        {label}
      </p>
    </div>
  );
}