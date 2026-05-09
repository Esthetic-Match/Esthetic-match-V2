"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Lock, Plus } from "lucide-react";
import BeforeAfterUploadModal from "../UI/BeforeAfterUploadModal";
import PrivateGcsImage from "@/components/UI/PrivateGcsImage";

type PhotoGalleryProps = {
  userId: string;
  paidPlan?: "free" | "standard" | null;
};

type GalleryItem = {
  beforeImage: string;
  afterImage: string;
};


export default function PhotoGallery({ userId, paidPlan }: PhotoGalleryProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const plan = paidPlan ?? "free";
  const isPremium = plan === "standard";
  const galleryLimit = isPremium ? gallery.length : 3;
  const visibleGallery = isPremium ? gallery : gallery.slice(0, 3);
  const isEmpty = visibleGallery.length === 0;
  const canAddMore = isPremium || gallery.length < 3;

  useEffect(() => {
    async function fetchGallery() {
      const res = await fetch(`/api/doctor-cases?doctorId=${userId}`);

      if (!res.ok) return;

      const data = await res.json();

      setGallery(
        data.map((item: any) => ({
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
            My Photo Gallery{" "}
            {isPremium? 
            <></>
            :
              <span className="font-medium text-[#283C5D]/40">
                ({visibleGallery.length}/{isPremium ? gallery.length : 3})
              </span>
            }
          </h2>
        </div>

        {!isEmpty && canAddMore && (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-[#283C5D] shadow-sm transition hover:scale-[1.03] hover:border-[#d8bd8d] hover:bg-[#07182A]/75 hover:text-white active:scale-[0.97]"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

        <div className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_160px]">
          {isEmpty ? (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl cursor-pointer border-2 hover:scale-[1.02] active:scale[0.99] border-dashed border-[#283C5D]/25 bg-[#FAF9F7] p-5 text-center transition hover:border-[#d8bd8d] hover:bg-[#FAF9F7]/70 active:scale-[0.99]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#283C5D] shadow-sm">
                <Plus size={26} />
              </div>

              <p className="max-w-[180px] text-sm font-medium leading-relaxed text-[#283C5D]/65">
                {isPremium
                ? "Add your first Before & After pictures"
                : "Add your first of 3 Before & After pictures"}
              </p>
            </button>
          ) : (
            visibleGallery.map((item, index) => (
              <BeforeAfterCard
                key={`${userId}-${index}`}
                beforeImage={item.beforeImage}
                afterImage={item.afterImage}
              />
            ))
          )}

          {isPremium ? (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5 text-center text-[#283C5D] transition hover:scale-[1.02] hover:border-[#d8bd8d] active:scale-[0.99] md:col-start-4"
            >
              <Plus size={26} className="mb-4 text-[#d8bd8d]" />
              <p className="text-lg font-semibold">Edit gallery</p>
              <p className="mt-4 text-sm leading-relaxed text-[#283C5D]/60">
                Add more Before & After pictures
              </p>
            </button>
          ) : (
            <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl bg-[#07182A]/80 p-5 text-center text-white backdrop-blur-md md:col-start-4">
              <Lock size={26} className="mb-4 text-[#d8bd8d]" />
              <p className="text-lg font-semibold">+5 more</p>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Upgrade to Premium to see all your results
              </p>
            </div>
          )}
        </div>
      </section>

      {canAddMore && (
        <BeforeAfterUploadModal
          isOpen={isUploadModalOpen}
          doctorId={userId}
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
      )}
    </>
  );
}

function BeforeAfterCard({
  beforeImage,
  afterImage,
}: {
  beforeImage: string;
  afterImage: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <GalleryImage src={beforeImage} label="Before" />
      <GalleryImage src={afterImage} label="After" />
    </div>
  );
}

function GalleryImage({ src, label }: { src: string; label: string }) {
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