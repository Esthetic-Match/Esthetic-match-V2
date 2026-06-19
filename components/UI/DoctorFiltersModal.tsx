"use client";

import {
  X,
  Star,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCheck,
  XCircle,
  Stethoscope,
  Monitor,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DoctorFiltersModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Procedure = {
  id: string;
  name: string;
};

type Subcategory = {
  subcategory: string;
  procedures: readonly Procedure[];
};

type Category = {
  category: string;
  subcategories: readonly Subcategory[];
};

// ---------------------------------------------------------------------------
// Price range constants  (adjust to match your real data range)
// ---------------------------------------------------------------------------

const PRICE_MIN = 0;
const PRICE_MAX = 1000;

// ---------------------------------------------------------------------------
// PriceRangeSlider  – single max-price slider, fully accessible, no external lib
// ---------------------------------------------------------------------------

function PriceRangeSlider({
  label,
  icon,
  min,
  max,
  value,
  onChange,
  currencySymbol = "$",
}: {
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  /** Single upper-bound value */
  value: number;
  onChange: (value: number) => void;
  currencySymbol?: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-[#283C5D]">
          {icon}
          {label}
        </label>
        <span className="text-xs font-semibold text-[#d8bd8d]">
          {value >= max ? `${currencySymbol}${max}+` : `${currencySymbol}${value}`}
        </span>
      </div>

      <div className="relative mx-1 h-5 flex items-center">
        {/* Base track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-black/10" />

        {/* Filled range */}
        <div
          className="absolute left-0 h-1.5 rounded-full bg-[#d8bd8d]"
          style={{ width: `${percent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="price-range-thumb absolute inset-x-0 h-1.5 w-full appearance-none bg-transparent"
          aria-label={label}
        />
      </div>

      {/* Min/Max labels */}
      <div className="mt-1 flex justify-between text-[10px] text-[#283C5D]/40">
        <span>{currencySymbol}{min}</span>
        <span>{currencySymbol}{max}+</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TopProceduresToggle – pill toggle button
// ---------------------------------------------------------------------------

function TopProceduresToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition active:scale-[0.97] cursor-pointer",
        value
          ? "border-[#283C5D] bg-[#283C5D] text-white"
          : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D]"
      )}
    >
      <span className="flex items-center gap-2 text-left">
        <Award size={15} className="shrink-0" />
        {label}
      </span>

      {/* Visual toggle pill */}
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          value ? "bg-[#d8bd8d]" : "bg-black/15"
        )}
      >
        <span
          className={cn(
            "absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
            value ? "translate-x-[18px]" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DoctorFiltersModal({
  isOpen,
  onClose,
}: DoctorFiltersModalProps) {
  const t = useTranslations("home.doctors.filters");
  const categoryT = useTranslations("categoriesName");
  const subcategoryT = useTranslations("subcategoriesName");
  const procedureT = useTranslations("proceduresName");
  const router = useRouter();

  // ── Existing filter state ──────────────────────────────────────────────
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([]);
  const [isQuickFiltersOpen, setIsQuickFiltersOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // ── New filter state ───────────────────────────────────────────────────
  const [showOnlyTopProcedures, setShowOnlyTopProcedures] = useState(false);
  const [maxInClinicPrice, setMaxInClinicPrice] = useState(PRICE_MAX);
  const [maxOnlinePrice, setMaxOnlinePrice] = useState(PRICE_MAX);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────

  const selectedCategories = useMemo<Category[]>(() => {
    return DoctorCatalog.categories.filter((category) =>
      selectedCategoryIds.includes(category.category)
    ) as Category[];
  }, [selectedCategoryIds]);

  const selectedProcedures = useMemo<Procedure[]>(() => {
    const procedures: Procedure[] = [];
    DoctorCatalog.categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        subcategory.procedures.forEach((procedure) => {
          if (selectedProcedureIds.includes(procedure.id)) {
            procedures.push({ id: procedure.id, name: procedure.name });
          }
        });
      });
    });
    return procedures;
  }, [selectedProcedureIds]);

  /** All procedure ids visible in the currently selected categories */
  const allVisibleProcedureIds = useMemo<string[]>(() => {
    const ids: string[] = [];
    selectedCategories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        subcategory.procedures.forEach((procedure) => {
          ids.push(procedure.id);
        });
      });
    });
    return ids;
  }, [selectedCategories]);

  const allVisibleSelected =
    allVisibleProcedureIds.length > 0 &&
    allVisibleProcedureIds.every((id) => selectedProcedureIds.includes(id));

  const anyVisibleSelected = allVisibleProcedureIds.some((id) =>
    selectedProcedureIds.includes(id)
  );

  // ── Scroll lock ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // ── Handlers ───────────────────────────────────────────────────────────

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((item) => item !== categoryId)
        : [...prev, categoryId]
    );
  }

  function toggleProcedure(procedureId: string) {
    setSelectedProcedureIds((prev) =>
      prev.includes(procedureId)
        ? prev.filter((item) => item !== procedureId)
        : [...prev, procedureId]
    );
  }

  function selectAllProcedures() {
    setSelectedProcedureIds((prev) => {
      const next = new Set(prev);
      allVisibleProcedureIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  }

  function deselectAllProcedures() {
    setSelectedProcedureIds((prev) =>
      prev.filter((id) => !allVisibleProcedureIds.includes(id))
    );
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (location.trim()) params.set("location", location.trim());
    if (minRating) params.set("minRating", minRating);

    if (selectedCategoryIds.length > 0) {
      params.set("category", selectedCategoryIds.join(","));
    }

    if (selectedProcedureIds.length > 0) {
      params.set("procedures", selectedProcedureIds.join(","));
    }

    if (showOnlyTopProcedures) {
      params.set("topThreeOnly", "true");
    }
    if (maxInClinicPrice < PRICE_MAX) {
      params.set("maxInClinicPrice", String(maxInClinicPrice));
    }
    if (maxOnlinePrice < PRICE_MAX) {
      params.set("maxOnlineConsultationPrice", String(maxOnlinePrice));
    }

    router.push(`/doctors?${params.toString()}`);
    onClose();
  }

  function clearFilters() {
    setLocation("");
    setMinRating("");
    setSelectedCategoryIds([]);
    setSelectedProcedureIds([]);
    setShowOnlyTopProcedures(false);
    setMaxInClinicPrice(PRICE_MAX);
    setMaxOnlinePrice(PRICE_MAX);
  }

  // ── Shared quick-filter content (mobile + desktop reuse) ───────────────

  const quickFilterContent = (
    <div className="space-y-4">
      {/* Location */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#283C5D]">
          <MapPin size={16} />
          {t("location")}
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("locationPlaceholder")}
          className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
        />
      </div>

      {/* Rating */}
      <FilterSelect
        icon={<Star size={16} />}
        label={t("minimumRating")}
        value={minRating}
        onChange={setMinRating}
        placeholder={t("anyRating")}
        options={[
          { label: "4.5+", value: "4.5" },
          { label: "4.0+", value: "4" },
          { label: "3.5+", value: "3.5" },
        ]}
      />

      {/* Top procedures toggle */}
      <TopProceduresToggle
        label={t("topThreeOnly")}
        value={showOnlyTopProcedures}
        onChange={setShowOnlyTopProcedures}
      />

      {/* In-clinic price slider */}
      <PriceRangeSlider
        label={t("maxInClinicPrice")}
        icon={<Stethoscope size={15} />}
        min={PRICE_MIN}
        max={PRICE_MAX}
        value={maxInClinicPrice}
        onChange={setMaxInClinicPrice}
      />

      {/* Online price slider */}
      <PriceRangeSlider
        label={t("maxOnlineConsultationPrice")}
        icon={<Monitor size={15} />}
        min={PRICE_MIN}
        max={PRICE_MAX}
        value={maxOnlinePrice}
        onChange={setMaxOnlinePrice}
      />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return createPortal(
    <>
      {/* Slider thumb global styles */}
      <style>{`
        .price-range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #283C5D;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
          pointer-events: all;
          position: relative;
        }
        .price-range-thumb::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #283C5D;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
          pointer-events: all;
        }
        .price-range-thumb { pointer-events: none; }
      `}</style>

      <div className="fixed inset-0 z-[9999] flex h-dvh w-dvw items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm md:px-4 md:py-6">
        <div className="relative flex h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:max-h-[88vh]">

          {/* ── Header ── */}
          <div className="shrink-0 border-b border-black/10 px-4 py-4 md:px-6 md:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d] md:tracking-[0.35em]">
                  {t("eyebrow")}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#283C5D] md:text-2xl">
                  {t("title")}
                </h2>
                <p className="mt-1 hidden text-sm text-[#283C5D]/60 md:block">
                  {t("description")}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Collapsible quick filters — shared across mobile and desktop ── */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsQuickFiltersOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-3 cursor-pointer text-sm font-semibold text-[#283C5D] transition active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  {t("filters")}
                </span>
                {isQuickFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isQuickFiltersOpen ? (
                <div className="mt-3 rounded-2xl border border-black/10 bg-[#FAF9F7] p-4 md:p-5">
                  <div className="md:grid md:grid-cols-2 md:gap-5 space-y-4 md:space-y-0">
                    {/* Location */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#283C5D]">
                        <MapPin size={16} />
                        {t("location")}
                      </label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("locationPlaceholder")}
                        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
                      />
                    </div>

                    {/* Rating */}
                    <FilterSelect
                      icon={<Star size={16} />}
                      label={t("minimumRating")}
                      value={minRating}
                      onChange={setMinRating}
                      placeholder={t("anyRating")}
                      options={[
                        { label: "4.5+", value: "4.5" },
                        { label: "4.0+", value: "4" },
                        { label: "3.5+", value: "3.5" },
                      ]}
                    />

                    {/* Top procedures toggle – full width */}
                    <div className="md:col-span-2">
                      <TopProceduresToggle
                        label={t("topThreeOnly")}
                        value={showOnlyTopProcedures}
                        onChange={setShowOnlyTopProcedures}
                      />
                    </div>

                    {/* Price sliders – one per column */}
                    <PriceRangeSlider
                      label={t("maxInClinicPrice")}
                      icon={<Stethoscope size={15} />}
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      value={maxInClinicPrice}
                      onChange={setMaxInClinicPrice}
                    />

                    <PriceRangeSlider
                      label={t("maxOnlineConsultationPrice")}
                      icon={<Monitor size={15} />}
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      value={maxOnlinePrice}
                      onChange={setMaxOnlinePrice}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* ── Category + Procedure grid ── */}
          <div className="min-h-0 flex-1 overflow-y-auto md:grid md:overflow-hidden md:grid-cols-[0.85fr_1.4fr]">

            {/* Left: Category selector */}
            <div className="border-b border-black/10 bg-[#FAF9F7] p-4 md:h-[52vh] md:overflow-y-auto md:border-b-0 md:border-r md:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                  {t("category")}
                </h3>

                <button
                  type="button"
                  onClick={() => setIsCategoriesOpen((prev) => !prev)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97] cursor-pointer"
                  aria-label={isCategoriesOpen ? "Collapse categories" : "Open categories"}
                >
                  {isCategoriesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {isCategoriesOpen ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {DoctorCatalog.categories.map((category) => {
                      const selected = selectedCategoryIds.includes(category.category);
                      return (
                        <button
                          key={category.category}
                          type="button"
                          onClick={() => toggleCategory(category.category)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97] cursor-pointer",
                            selected
                              ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-[#A74848]"
                              : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                          )}
                        >
                          {categoryT(category.category)}
                        </button>
                      );
                    })}
                  </div>

                  {selectedProcedures.length > 0 ? (
                    <div className="mt-6 border-t border-black/10 pt-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/45">
                        {t("selectedProcedures")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProcedures.map((procedure) => (
                          <button
                            key={procedure.id}
                            type="button"
                            onClick={() => toggleProcedure(procedure.id)}
                            className="rounded-full border border-[#283C5D] bg-[#283C5D] px-4 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:bg-[#A74848] active:scale-[0.97] cursor-pointer"
                          >
                            {procedureT(procedure.id)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            {/* Right: Procedure selector */}
            <div className="bg-white p-4 md:h-[52vh] md:overflow-y-auto md:p-6">
              <div className="sticky -top-19 z-10 mb-4 bg-white pb-4 pt-2 md:-top-6 md:pt-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                      {t("procedures")}
                    </h3>
                    <p className="mt-1 text-xs text-[#283C5D]/55">
                      {selectedCategories.length > 0
                        ? t("selectProcedures")
                        : t("chooseCategoryFirst")}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-medium text-[#d8bd8d]">
                    {selectedProcedureIds.length} selected
                  </p>
                </div>

                {/* Select All / Deselect All */}
                {allVisibleProcedureIds.length > 0 ? (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllProcedures}
                      disabled={allVisibleSelected}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] cursor-pointer",
                        allVisibleSelected
                          ? "cursor-not-allowed border-black/5 bg-[#FAF9F7] text-[#283C5D]/30"
                          : "border-[#283C5D]/20 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                      )}
                    >
                      <CheckCheck size={13} />
                      {t("selectAllProcedures")}
                    </button>

                    <button
                      type="button"
                      onClick={deselectAllProcedures}
                      disabled={!anyVisibleSelected}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] cursor-pointer",
                        !anyVisibleSelected
                          ? "cursor-not-allowed border-black/5 bg-[#FAF9F7] text-[#283C5D]/30"
                          : "border-red-200 bg-white text-[#A74848] hover:border-red-500 hover:bg-[#A74848] hover:text-white"
                      )}
                    >
                      <XCircle size={13} />
                      {t("deselectAllProcedures")}
                    </button>
                  </div>
                ) : null}
              </div>

              {selectedCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
                  {t("chooseCategoryFirst")}
                </div>
              ) : (
                <div className="space-y-6 pb-6">
                  {selectedCategories.map((category) => (
                    <div key={category.category} className="space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
                        {categoryT(category.category)}
                      </p>

                      {category.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.subcategory}
                          className="rounded-2xl bg-[#FAF9F7] p-4"
                        >
                          <h4 className="mb-3 text-sm font-semibold text-[#283C5D]">
                            {subcategoryT(subcategory.subcategory)}
                          </h4>

                          <div className="flex flex-wrap gap-2">
                            {subcategory.procedures.map((procedure) => {
                              const selected = selectedProcedureIds.includes(procedure.id);
                              return (
                                <button
                                  key={procedure.id}
                                  type="button"
                                  onClick={() => toggleProcedure(procedure.id)}
                                  className={cn(
                                    "rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97] cursor-pointer",
                                    selected
                                      ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-[#94604C] hover:bg-[#A74848]"
                                      : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                                  )}
                                >
                                  {procedureT(procedure.id)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 flex items-center justify-between gap-3 border-t border-black/10 bg-white px-4 py-4 md:px-6 md:py-5">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-black/10 px-5 py-3 text-[9px] sm:text-sm font-semibold 
              text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97] md:px-6 cursor-pointer"
            >
              {t("clear")}
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="rounded-full bg-[#d8bd8d] px-6 py-3 text-[9px] sm:text-sm font-semibold 
              text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97] md:px-7 cursor-pointer"
            >
              {t("apply")}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// FilterSelect (unchanged)
// ---------------------------------------------------------------------------

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#283C5D]">
        {icon}
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
