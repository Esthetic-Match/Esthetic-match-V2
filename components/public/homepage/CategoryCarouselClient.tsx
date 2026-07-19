"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export type HomeCategoryCarouselItem = {
  id: string;
  key: string;
  href: string;
  homeImage: string;
  icon: string;
};

type CategoryCarouselProps = {
  categories: readonly HomeCategoryCarouselItem[];
};

export default function CategoryCarouselClient({
  categories,
}: CategoryCarouselProps) {
  const t = useTranslations("categoriesName");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

const hasInitialized = useRef(false);

useEffect(() => {
  const observers: IntersectionObserver[] = [];

  cardRefs.current.forEach((el, id) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Ignore any intersections that fire after the user has started scrolling
        if (hasInitialized.current && !entry.isIntersecting) return;

        if (entry.isIntersecting) {
          setVisibleCards((prev) => new Set(prev).add(id));
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    observers.push(observer);
  });

  // After ~600ms (longest stagger + animation duration), stop all remaining observers
  // so cards scrolled in via the button appear instantly
  const timer = setTimeout(() => {
    hasInitialized.current = true;
    observers.forEach((o) => o.disconnect());

    // Mark all remaining cards as visible so they never animate in
    setVisibleCards(new Set(categories.map((c) => c.id)));
  }, 600 + categories.length * 60);

  return () => {
    clearTimeout(timer);
    observers.forEach((o) => o.disconnect());
  };
}, [categories]);

  function scrollCarousel(direction: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -440 : 440,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      {/* Edge fade overlays */}
      <div className="pointer-events-none absolute -left-1 top-0 z-10 h-full w-12 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/70 to-transparent" />
      <div className="pointer-events-none absolute -right-1 top-0 z-10 h-full w-12 bg-gradient-to-l from-[#FAF9F7] via-[#FAF9F7]/70 to-transparent" />

      {/* Nav buttons */}
      <button
        type="button"
        onClick={() => scrollCarousel("left")}
        aria-label="Scroll categories left"
        className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e8e2d9] bg-white text-[#283C5D] shadow-md transition-all duration-200 hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white active:scale-95"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={() => scrollCarousel("right")}
        aria-label="Scroll categories right"
        className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e8e2d9] bg-white text-[#283C5D] shadow-md transition-all duration-200 hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white active:scale-95"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {/* Scroll track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-10 pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category, index) => {
          const isVisible = visibleCards.has(category.id);

          return (
            <Link
              key={category.id}
              href={category.href}
              ref={(el) => {
                if (el) cardRefs.current.set(category.id, el);
                else cardRefs.current.delete(category.id);
              }}
              style={{
                transitionDelay: `${index * 60}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? "translateY(0px) scale(1)"
                  : "translateY(28px) scale(0.96)",
              }}
              className="group relative h-[300px] min-w-[160px] overflow-hidden rounded-2xl bg-[#283C5D] shadow-lg transition-all duration-700 ease-out sm:h-[420px] sm:min-w-[220px] hover:-translate-y-1.5 hover:shadow-[0_20px_48px_-8px_rgba(40,60,93,0.35)]"
            >
              {/* Background image */}
              <Image
                src={category.homeImage}
                alt={category.key}
                fill
                sizes="(max-width: 640px) 160px, 220px"
                className="object-cover transition duration-700 group-hover:scale-[1.07]"
              />

              {/* Base darkening gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition duration-500 group-hover:from-black/85 group-hover:via-black/30" />

              {/* Strong bottom gradient for text legibility */}
              <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Subtle gloss sheen on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 transition duration-500 group-hover:via-white/[0.04] group-hover:opacity-100" />

              {/* Top-right icon — restored original scaled SVG style */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full">
                  <Image
                    src={category.icon}
                    alt={`${category.key} icon`}
                    fill
                    sizes="40px"
                    className="scale-[2.2] object-contain transition duration-300 group-hover:scale-[2.6]"
                  />
                </div>
              </div>

              {/* Bottom-left: gold line + title + arrow */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                {/* Gold accent line */}
                <div className="mb-2.5 h-px w-6 bg-[#d8bd8d] transition-all duration-300 group-hover:w-10" />

                <h3 className="max-w-[120px] text-sm font-bold leading-snug tracking-wide text-white sm:text-base">
                  {t(category.id)}
                </h3>

                {/* Restored original arrow SVG */}
                <span className="relative mt-3 flex h-8 w-8 items-center justify-center overflow-hidden">
                  <Image
                    src="/icons/arrow.svg"
                    alt=""
                    fill
                    sizes="32px"
                    className="scale-[2.8] object-contain transition duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}