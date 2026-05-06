"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

type CategoryCarouselItem = {
  key: string;
  label: string;
  href: string;
  image: string;
};

type CategoryCarouselClientProps = {
  categories: CategoryCarouselItem[];
};

export default function CategoryCarouselClient({
  categories,
}: CategoryCarouselClientProps) {
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
        className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#283C5D] shadow-md transition hover:bg-white active:scale-[0.98]"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={() => scrollCarousel("right")}
        aria-label="Scroll categories right"
        className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#283C5D] shadow-md transition hover:bg-white active:scale-[0.98]"
      >
        <ChevronRight size={20} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-10 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <Link
              key={category.key}
              href={category.href}
              className="group relative h-[210px] min-w-[145px] overflow-hidden rounded-xl bg-[#283C5D] shadow-md sm:h-[230px] sm:min-w-[165px]"
            >
            <Image
              src={category.image}
              alt={category.label}
              fill
              sizes="180px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/5" />

            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h3 className="max-w-[120px] text-md font-normal leading-tight text-white">
                {category.label}
              </h3>

                <span className="relative mt-3 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
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