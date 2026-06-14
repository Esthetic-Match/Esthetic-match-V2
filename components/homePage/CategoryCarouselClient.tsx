"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { DoctorCatalog } from "@/lib/doctorCatalogue";
import { useTranslations } from "next-intl";

type CategoryCarouselItem = (typeof DoctorCatalog.categories)[number];

type CategoryCarouselProps = {
  categories: readonly CategoryCarouselItem[];
};

export default function CategoryCarouselClient({
  categories,
}: CategoryCarouselProps) {
  const t = useTranslations("categoriesName");
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: "left" | "right") {
    if (!scrollRef.current) return;

    const scrollAmount = 360;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-1 top-0 z-10 h-full w-10 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/80 to-transparent backdrop-blur-[1px]" />

      <div className="pointer-events-none absolute -right-1 top-0 z-10 h-full w-10 bg-gradient-to-l from-[#FAF9F7] via-[#FAF9F7]/80 to-transparent backdrop-blur-[1px]" />

      <button
        type="button"
        onClick={() => scrollCarousel("left")}
        aria-label="Scroll categories left"
        className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#283C5D] shadow-md transition hover:bg-[#283C5D] hover:text-white active:scale-[0.95]"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={() => scrollCarousel("right")}
        aria-label="Scroll categories right"
        className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#283C5D] shadow-md transition hover:bg-[#283C5D] hover:text-white active:scale-[0.95]"
      >
        <ChevronRight size={20} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-10 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative h-[210px] min-w-[145px] overflow-hidden rounded-xl bg-[#283C5D] shadow-md sm:h-[230px] sm:min-w-[165px]"
          >
            <Image
              src={category.homeImage}
              alt={category.key}
              fill
              sizes="180px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/5" />

            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/85 via-black/45 to-transparent backdrop-blur-[1.5px]" />

            <div className="absolute right-4 bottom-4 z-10">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full">
                <Image
                  src={category.icon}
                  alt={`${category.key} icon`}
                  fill
                  className="scale-[2.2] object-contain transition duration-200 group-hover:scale-[2.6]"
                />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h3 className="max-w-[120px] text-md font-bold leading-tight text-white">
                {t(category.id)}
              </h3>

              <span className="relative mt-3 flex h-8 w-8 items-center justify-center overflow-hidden">
                <Image
                  src="/icons/arrow.svg"
                  alt=""
                  fill
                  className="scale-[2.8] object-contain transition duration-200 group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}