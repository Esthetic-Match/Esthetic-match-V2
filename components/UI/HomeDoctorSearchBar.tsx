// components/homePage/UI/HomeDoctorSearchBar.tsx
"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import DoctorFiltersModal from "@/components/homePage/UI/DoctorFiltersModal";

export default function HomeDoctorSearchBar() {
  const t = useTranslations("home.doctors");
  const router = useRouter();

  const [query, setQuery] = useState("");
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
  <div className="flex w-full max-w-5xl flex-col gap-3 rounded-[2rem] bg-white p-3 shadow-2xl shadow-[#283C5D]/10 md:flex-row md:items-center md:rounded-full">
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-[#FAF9F7] px-4 py-3 text-[#283C5D]">
      <Search size={18} className="shrink-0" />

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSearch();
        }}
        placeholder={t("hero.searchPlaceholder")}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#283C5D]/50"
      />
    </div>

    <button
      type="button"
      onClick={() => setIsFilterOpen(true)}
      className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#d8bd8d] bg-white px-5 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-[#f4e4c6]"
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
      className="shrink-0 rounded-full bg-[#d8bd8d] px-6 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6]"
    >
      {t("hero.search")}
    </button>
  </div>
);
}