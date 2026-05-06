"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";

type ClinicBannerProps = {
  clinicBanner?: string | null;
  isLoading?: boolean;
  onEdit?: () => void;
};

const fallbackBanner = "/images/fallback/blue-bg.png";

export default function ClinicBanner({
  clinicBanner,
  onEdit,
  isLoading,
}: ClinicBannerProps) {
  return (
    <section className="relative h-56 w-full overflow-hidden rounded-tl-2xl bg-[#283C5D] md:h-72">
      {isLoading ? (
        <div className="h-full w-full animate-pulse bg-[#283C5D]/30" />
      ) : (
        <Image
          src={clinicBanner || fallbackBanner}
          alt="Clinic banner"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <button
        type="button"
        onClick={onEdit}
        className="absolute top-4 right-4 z-10 flex items-center cursor-pointer gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-[#283C5D] shadow-md transition hover:bg-white active:scale-[0.98]"
      >
        <Pencil size={14} />
      </button>
    </section>
  );
}