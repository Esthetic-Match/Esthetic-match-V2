"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import DoctorFiltersModal from "../../UI/DoctorFiltersModal";

export default function MainHeader({ initialQuery = "" }: { initialQuery?: string }) {
  const t = useTranslations("home.doctors");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  function handleSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/doctors");
      return;
    }

    router.push(`/doctors?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <section className="relative overflow-hidden bg-[#061A2D] px-6 py-24 text-white md:px-12 lg:px-24">
      <div className="absolute inset-y-0 right-0 w-full md:w-[52%]">
        <Image
          src="/images/home/doctors/hero-bg.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-center opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D] via-[#061A2D]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061A2D] via-transparent to-transparent" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(216,189,141,0.22),transparent_35%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#FAF9F7]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.45em] text-[#d8bd8d]">
          {t("hero.eyebrow")}
        </p>

        <h1 className="max-w-3xl text-4xl font-bold uppercase leading-[0.95] md:text-6xl">
          {t("hero.title")}
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-7 text-white/80 md:text-base">
          {t("hero.description")}
        </p>

        <div className="mt-10 flex max-w-3xl flex-col gap-3 rounded-full p-3 shadow-xl md:flex-row md:bg-white">
          <div className="flex flex-1 items-center gap-3 rounded-full bg-[#FAF9F7] px-4 py-3 text-[#283C5D]">
            <Search size={18} />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder={t("hero.searchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#283C5D]/50"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center gap-2 rounded-full border border-black/40 text-black px-5 py-3 text-sm font-semibold hover:bg-[#283C5D] hover:text-white cursor-pointer"
          >
            <SlidersHorizontal size={17} />
            {t("hero.filters")}
          </button>

          <DoctorFiltersModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-full bg-[#d8bd8d] px-6 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] cursor-pointer"
          >
            {t("hero.search")}
          </button>
        </div>
      </div>
    </section>
  );
}