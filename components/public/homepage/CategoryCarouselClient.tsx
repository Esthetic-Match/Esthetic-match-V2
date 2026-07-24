"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";

export type HomeCategoryCarouselItem = {
  id: string;
  name: string;
  href: string;
  homeImage: string | null;
  icon: string | null;
};

type CategoriesResponse = {
  categories: HomeCategoryCarouselItem[];
};

type CategoryCarouselProps = {
  listName: string;
};

export default function CategoryCarouselClient({
  listName,
}: CategoryCarouselProps) {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const hasInitialized = useRef(false);

  const [categories, setCategories] = useState<
    HomeCategoryCarouselItem[] | null
  >(null);
  const [hasError, setHasError] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(
          `/api/public-pages/categories?locale=${encodeURIComponent(locale)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Could not load categories: ${response.status}`);
        }

        const data = (await response.json()) as CategoriesResponse;

        if (!Array.isArray(data.categories)) {
          throw new Error("The categories response is invalid.");
        }

        setCategories(data.categories);
        setHasError(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Could not load categories:", error);
        setHasError(true);
      }
    }

    void loadCategories();

    return () => {
      controller.abort();
    };
  }, [locale]);

  useEffect(() => {
    if (!categories?.length) return;

    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((element, id) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (hasInitialized.current && !entry.isIntersecting) return;

          if (entry.isIntersecting) {
            setVisibleCards((previous) => new Set(previous).add(id));
            observer.disconnect();
          }
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    const timer = window.setTimeout(() => {
      hasInitialized.current = true;
      observers.forEach((observer) => observer.disconnect());

      setVisibleCards(new Set(categories.map((category) => category.id)));
    }, 600 + categories.length * 60);

    return () => {
      window.clearTimeout(timer);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [categories]);

  function scrollCarousel(direction: "left" | "right") {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -440 : 440,
      behavior: "smooth",
    });
  }

  if (categories === null && !hasError) {
    return (
      <div className="flex gap-5 overflow-hidden px-10 pb-6 pt-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[300px] min-w-[160px] animate-pulse rounded-2xl bg-[#283C5D]/10 sm:h-[420px] sm:min-w-[220px]"
          />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
        Categories could not be loaded.
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className="rounded-2xl border border-[#283C5D]/10 bg-white px-6 py-8 text-center text-sm text-[#283C5D]/60">
        No categories are currently available.
      </div>
    );
  }

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.name,
      url: category.href,
    })),
  }).replace(/</g, "\\u003c");

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute -left-1 top-0 z-10 h-full w-12 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/70 to-transparent" />

        <div className="pointer-events-none absolute -right-1 top-0 z-10 h-full w-12 bg-gradient-to-l from-[#FAF9F7] via-[#FAF9F7]/70 to-transparent" />

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
                ref={(element) => {
                  if (element) {
                    cardRefs.current.set(category.id, element);
                  } else {
                    cardRefs.current.delete(category.id);
                  }
                }}
                style={{
                  transitionDelay: `${index * 60}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? "translateY(0px) scale(1)"
                    : "translateY(28px) scale(0.96)",
                }}
                className="group relative h-[300px] min-w-[160px] overflow-hidden rounded-2xl bg-[#283C5D] shadow-lg transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_48px_-8px_rgba(40,60,93,0.35)] sm:h-[420px] sm:min-w-[220px]"
              >
                {category.homeImage ? (
                  <Image
                    src={category.homeImage}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 160px, 220px"
                    className="object-cover transition duration-700 group-hover:scale-[1.07]"
                  />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition duration-500 group-hover:from-black/85 group-hover:via-black/30" />

                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 transition duration-500 group-hover:via-white/[0.04] group-hover:opacity-100" />

                {category.icon ? (
                  <div className="absolute bottom-4 right-4 z-10">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full">
                      <Image
                        src={category.icon}
                        alt={`${category.name} icon`}
                        fill
                        sizes="40px"
                        className="scale-[2.2] object-contain transition duration-300 group-hover:scale-[2.6]"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="mb-2.5 h-px w-6 bg-[#d8bd8d] transition-all duration-300 group-hover:w-10" />

                  <h3 className="max-w-[120px] text-sm font-bold leading-snug tracking-wide text-white sm:text-base">
                    {category.name}
                  </h3>

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

      <nav aria-label={listName} className="sr-only">
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={category.href}>{category.name}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
    </>
  );
}