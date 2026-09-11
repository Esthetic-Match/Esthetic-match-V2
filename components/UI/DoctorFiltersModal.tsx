"use client";

import {
  AlertCircle,
  Award,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Monitor,
  RefreshCw,
  SlidersHorizontal,
  Star,
  Stethoscope,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import { createPortal } from "react-dom";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils/utils";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type DoctorFiltersModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CatalogueProcedure = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

type CatalogueSubcategory = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  procedures: CatalogueProcedure[];
};

type CatalogueCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  href: string | null;
  homeImage: string | null;
  dashboardImage: string | null;
  icon: string | null;
  sortOrder: number;
  specialtyIds: string[];
  subcategories: CatalogueSubcategory[];
};

type DoctorCatalogueResponse = {
  success: boolean;
  locale?: string;
  categories?: CatalogueCategory[];
  error?: string;
};

/* ═════════════════════════════════════
   PRICE
═════════════════════════════════════ */

const PRICE_MIN = 0;
const PRICE_MAX = 1000;

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function getProcedureIdsForCategory(
  category: CatalogueCategory,
): string[] {
  return Array.from(
    new Set(
      category.subcategories.flatMap(
        (subcategory) =>
          subcategory.procedures.map(
            (procedure) => procedure.id,
          ),
      ),
    ),
  );
}

function getProcedureIdsForCategories(
  categories: CatalogueCategory[],
): string[] {
  return Array.from(
    new Set(
      categories.flatMap(
        getProcedureIdsForCategory,
      ),
    ),
  );
}

/* ═════════════════════════════════════
   PRICE SLIDER
═════════════════════════════════════ */

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
  value: number;
  onChange: (value: number) => void;
  currencySymbol?: string;
}) {
  const percent =
    ((value - min) / (max - min)) *
    100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-[#283C5D]">
          {icon}
          {label}
        </label>

        <span className="text-xs font-semibold text-[#d8bd8d]">
          {value >= max
            ? `${currencySymbol}${max}+`
            : `${currencySymbol}${value}`}
        </span>
      </div>

      <div className="relative mx-1 flex h-5 items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-black/10" />

        <div
          className="absolute left-0 h-1.5 rounded-full bg-[#d8bd8d]"
          style={{
            width: `${percent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(event) =>
            onChange(
              Number(
                event.target.value,
              ),
            )
          }
          className="price-range-thumb absolute inset-x-0 h-1.5 w-full appearance-none bg-transparent"
          aria-label={label}
        />
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-[#283C5D]/40">
        <span>
          {currencySymbol}
          {min}
        </span>

        <span>
          {currencySymbol}
          {max}+
        </span>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   TOP PROCEDURES TOGGLE
═════════════════════════════════════ */

function TopProceduresToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!value)
      }
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition active:scale-[0.97]",
        value
          ? "border-[#283C5D] bg-[#283C5D] text-white"
          : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D]",
      )}
    >
      <span className="flex items-center gap-2 text-left">
        <Award
          size={15}
          className="shrink-0"
        />

        {label}
      </span>

      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          value
            ? "bg-[#d8bd8d]"
            : "bg-black/15",
        )}
      >
        <span
          className={cn(
            "absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
            value
              ? "translate-x-[18px]"
              : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

/* ═════════════════════════════════════
   COMPONENT
═════════════════════════════════════ */

export default function DoctorFiltersModal({
  isOpen,
  onClose,
}: DoctorFiltersModalProps) {
  const t = useTranslations(
    "home.doctors.filters",
  );

  const locale = useLocale();
  const router = useRouter();

  /* ═══════════════════════════════════
     CATALOGUE STATE
  ═══════════════════════════════════ */

  const [
    categories,
    setCategories,
  ] = useState<
    CatalogueCategory[]
  >([]);

  const [
    isLoadingCatalogue,
    setIsLoadingCatalogue,
  ] = useState(false);

  const [
    catalogueError,
    setCatalogueError,
  ] = useState<string | null>(
    null,
  );

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  /* ═══════════════════════════════════
     FILTER STATE
  ═══════════════════════════════════ */

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    minRating,
    setMinRating,
  ] = useState("");

  const [
    selectedCategoryIds,
    setSelectedCategoryIds,
  ] = useState<string[]>([]);

  const [
    selectedProcedureIds,
    setSelectedProcedureIds,
  ] = useState<string[]>([]);

  const [
    isQuickFiltersOpen,
    setIsQuickFiltersOpen,
  ] = useState(false);

  const [
    isCategoriesOpen,
    setIsCategoriesOpen,
  ] = useState(true);

  const [
    showOnlyTopProcedures,
    setShowOnlyTopProcedures,
  ] = useState(false);

  const [
    maxInClinicPrice,
    setMaxInClinicPrice,
  ] = useState(PRICE_MAX);

  const [
    maxOnlinePrice,
    setMaxOnlinePrice,
  ] = useState(PRICE_MAX);

  /* ═══════════════════════════════════
     LOAD CATALOGUE
  ═══════════════════════════════════ */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller =
      new AbortController();

    async function loadCatalogue() {
      try {
        setIsLoadingCatalogue(
          true,
        );

        setCatalogueError(null);

        const response =
          await fetch(
            `/api/doctor-catalogue?locale=${encodeURIComponent(
              locale,
            )}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const data =
          (await response
            .json()
            .catch(() => null)) as
            | DoctorCatalogueResponse
            | null;

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Could not load doctor catalogue.",
          );
        }

        if (
          !data ||
          !Array.isArray(
            data.categories,
          )
        ) {
          throw new Error(
            "Invalid doctor catalogue response.",
          );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setCategories(
          data.categories,
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        console.error(
          "Could not load filter catalogue:",
          error,
        );

        setCategories([]);

        setCatalogueError(
          error instanceof Error
            ? error.message
            : "Could not load doctor catalogue.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoadingCatalogue(
            false,
          );
        }
      }
    }

    void loadCatalogue();

    return () => {
      controller.abort();
    };
  }, [
    isOpen,
    locale,
    reloadKey,
  ]);

  /* ═══════════════════════════════════
     DERIVED STATE
  ═══════════════════════════════════ */

  const selectedCategories =
    useMemo(() => {
      const selectedIds =
        new Set(
          selectedCategoryIds,
        );

      return categories.filter(
        (category) =>
          selectedIds.has(
            category.id,
          ),
      );
    }, [
      categories,
      selectedCategoryIds,
    ]);

  const selectedProcedures =
    useMemo(() => {
      const selectedIds =
        new Set(
          selectedProcedureIds,
        );

      const procedures =
        new Map<
          string,
          CatalogueProcedure
        >();

      for (
        const category of categories
      ) {
        for (
          const subcategory of category.subcategories
        ) {
          for (
            const procedure of subcategory.procedures
          ) {
            if (
              selectedIds.has(
                procedure.id,
              )
            ) {
              procedures.set(
                procedure.id,
                procedure,
              );
            }
          }
        }
      }

      return Array.from(
        procedures.values(),
      );
    }, [
      categories,
      selectedProcedureIds,
    ]);

  const allVisibleProcedureIds =
    useMemo(() => {
      return getProcedureIdsForCategories(
        selectedCategories,
      );
    }, [selectedCategories]);

  const allVisibleSelected =
    allVisibleProcedureIds.length >
      0 &&
    allVisibleProcedureIds.every(
      (id) =>
        selectedProcedureIds.includes(
          id,
        ),
    );

  const anyVisibleSelected =
    allVisibleProcedureIds.some(
      (id) =>
        selectedProcedureIds.includes(
          id,
        ),
    );

  /* ═══════════════════════════════════
     SCROLL LOCK
  ═══════════════════════════════════ */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen]);

  /* ═══════════════════════════════════
     HANDLERS
  ═══════════════════════════════════ */

  function toggleCategory(
    categoryId: string,
  ) {
    const isSelected =
      selectedCategoryIds.includes(
        categoryId,
      );

    if (!isSelected) {
      setSelectedCategoryIds(
        (previous) => [
          ...previous,
          categoryId,
        ],
      );

      return;
    }

    const nextCategoryIds =
      selectedCategoryIds.filter(
        (id) =>
          id !== categoryId,
      );

    setSelectedCategoryIds(
      nextCategoryIds,
    );

    /*
     * Remove procedures that are no longer
     * visible through ANY selected category.
     *
     * This is important because a procedure
     * can belong to multiple subcategories.
     */
    const remainingCategories =
      categories.filter(
        (category) =>
          nextCategoryIds.includes(
            category.id,
          ),
      );

    const allowedProcedureIds =
      new Set(
        getProcedureIdsForCategories(
          remainingCategories,
        ),
      );

    setSelectedProcedureIds(
      (previous) =>
        previous.filter(
          (procedureId) =>
            allowedProcedureIds.has(
              procedureId,
            ),
        ),
    );
  }

  function toggleProcedure(
    procedureId: string,
  ) {
    setSelectedProcedureIds(
      (previous) =>
        previous.includes(
          procedureId,
        )
          ? previous.filter(
              (item) =>
                item !==
                procedureId,
            )
          : [
              ...previous,
              procedureId,
            ],
    );
  }

  function selectAllProcedures() {
    setSelectedProcedureIds(
      (previous) => {
        const next =
          new Set(previous);

        for (
          const id of allVisibleProcedureIds
        ) {
          next.add(id);
        }

        return Array.from(
          next,
        );
      },
    );
  }

  function deselectAllProcedures() {
    const visibleIds =
      new Set(
        allVisibleProcedureIds,
      );

    setSelectedProcedureIds(
      (previous) =>
        previous.filter(
          (id) =>
            !visibleIds.has(id),
        ),
    );
  }

  function applyFilters() {
    const params =
      new URLSearchParams();

    if (location.trim()) {
      params.set(
        "location",
        location.trim(),
      );
    }

    if (minRating) {
      params.set(
        "minRating",
        minRating,
      );
    }

    if (
      selectedCategoryIds.length >
      0
    ) {
      params.set(
        "category",
        selectedCategoryIds.join(
          ",",
        ),
      );
    }

    if (
      selectedProcedureIds.length >
      0
    ) {
      params.set(
        "procedures",
        selectedProcedureIds.join(
          ",",
        ),
      );
    }

    if (
      showOnlyTopProcedures
    ) {
      params.set(
        "topThreeOnly",
        "true",
      );
    }

    if (
      maxInClinicPrice <
      PRICE_MAX
    ) {
      params.set(
        "maxInClinicPrice",
        String(
          maxInClinicPrice,
        ),
      );
    }

    if (
      maxOnlinePrice <
      PRICE_MAX
    ) {
      params.set(
        "maxOnlineConsultationPrice",
        String(
          maxOnlinePrice,
        ),
      );
    }

    const query =
      params.toString();

    router.push(
      query
        ? `/doctors?${query}`
        : "/doctors",
    );

    onClose();
  }

  function clearFilters() {
    setLocation("");
    setMinRating("");

    setSelectedCategoryIds(
      [],
    );

    setSelectedProcedureIds(
      [],
    );

    setShowOnlyTopProcedures(
      false,
    );

    setMaxInClinicPrice(
      PRICE_MAX,
    );

    setMaxOnlinePrice(
      PRICE_MAX,
    );
  }

  /* ═══════════════════════════════════
     CLOSED
  ═══════════════════════════════════ */

  if (
    !isOpen ||
    typeof document ===
      "undefined"
  ) {
    return null;
  }

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  return createPortal(
    <>
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

        .price-range-thumb {
          pointer-events: none;
        }
      `}</style>

      <div className="fixed inset-0 z-[9999] flex h-dvh w-dvw items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm md:px-4 md:py-6">
        <div className="relative flex h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:max-h-[88vh]">

          {/* ═══════════════════════════
              HEADER
          ═══════════════════════════ */}

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
                  {t(
                    "description",
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick filters */}

            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  setIsQuickFiltersOpen(
                    (previous) =>
                      !previous,
                  )
                }
                className="flex w-full cursor-pointer items-center justify-between rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-3 text-sm font-semibold text-[#283C5D] transition active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={16}
                  />

                  {t("filters")}
                </span>

                {isQuickFiltersOpen ? (
                  <ChevronUp
                    size={16}
                  />
                ) : (
                  <ChevronDown
                    size={16}
                  />
                )}
              </button>

              {isQuickFiltersOpen ? (
                <div className="mt-3 rounded-2xl border border-black/10 bg-[#FAF9F7] p-4 md:p-5">
                  <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">

                    {/* Location */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#283C5D]">
                        <MapPin
                          size={
                            16
                          }
                        />

                        {t(
                          "location",
                        )}
                      </label>

                      <input
                        value={
                          location
                        }
                        onChange={(
                          event,
                        ) =>
                          setLocation(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder={t(
                          "locationPlaceholder",
                        )}
                        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
                      />
                    </div>

                    {/* Rating */}

                    <FilterSelect
                      icon={
                        <Star
                          size={
                            16
                          }
                        />
                      }
                      label={t(
                        "minimumRating",
                      )}
                      value={
                        minRating
                      }
                      onChange={
                        setMinRating
                      }
                      placeholder={t(
                        "anyRating",
                      )}
                      options={[
                        {
                          label:
                            "4.5+",
                          value:
                            "4.5",
                        },
                        {
                          label:
                            "4.0+",
                          value:
                            "4",
                        },
                        {
                          label:
                            "3.5+",
                          value:
                            "3.5",
                        },
                      ]}
                    />

                    {/* Top procedure */}

                    <div className="md:col-span-2">
                      <TopProceduresToggle
                        label={t(
                          "topThreeOnly",
                        )}
                        value={
                          showOnlyTopProcedures
                        }
                        onChange={
                          setShowOnlyTopProcedures
                        }
                      />
                    </div>

                    {/* Clinic price */}

                    <PriceRangeSlider
                      label={t(
                        "maxInClinicPrice",
                      )}
                      icon={
                        <Stethoscope
                          size={
                            15
                          }
                        />
                      }
                      min={
                        PRICE_MIN
                      }
                      max={
                        PRICE_MAX
                      }
                      value={
                        maxInClinicPrice
                      }
                      onChange={
                        setMaxInClinicPrice
                      }
                    />

                    {/* Online price */}

                    <PriceRangeSlider
                      label={t(
                        "maxOnlineConsultationPrice",
                      )}
                      icon={
                        <Monitor
                          size={
                            15
                          }
                        />
                      }
                      min={
                        PRICE_MIN
                      }
                      max={
                        PRICE_MAX
                      }
                      value={
                        maxOnlinePrice
                      }
                      onChange={
                        setMaxOnlinePrice
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* ═══════════════════════════
              BODY
          ═══════════════════════════ */}

          {isLoadingCatalogue ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-[#283C5D]/60">
                <Loader2 className="h-7 w-7 animate-spin text-[#d8bd8d]" />

                <p className="text-sm font-medium">
                  Loading procedures…
                </p>
              </div>
            </div>
          ) : catalogueError ? (
            <div className="flex min-h-0 flex-1 items-center justify-center p-6">
              <div className="w-full max-w-md rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

                <p className="mt-4 text-sm font-semibold text-red-700">
                  {
                    catalogueError
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setReloadKey(
                      (
                        previous,
                      ) =>
                        previous +
                        1,
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f304c]"
                >
                  <RefreshCw
                    size={15}
                  />

                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto md:grid md:grid-cols-[0.85fr_1.4fr] md:overflow-hidden">

              {/* ═══════════════════════
                  CATEGORIES
              ═══════════════════════ */}

              <div className="border-b border-black/10 bg-[#FAF9F7] p-4 md:h-[52vh] md:overflow-y-auto md:border-b-0 md:border-r md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                    {t("category")}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setIsCategoriesOpen(
                        (
                          previous,
                        ) =>
                          !previous,
                      )
                    }
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
                    aria-label={
                      isCategoriesOpen
                        ? "Collapse categories"
                        : "Open categories"
                    }
                  >
                    {isCategoriesOpen ? (
                      <ChevronUp
                        size={
                          16
                        }
                      />
                    ) : (
                      <ChevronDown
                        size={
                          16
                        }
                      />
                    )}
                  </button>
                </div>

                {isCategoriesOpen ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(
                        (
                          category,
                        ) => {
                          const selected =
                            selectedCategoryIds.includes(
                              category.id,
                            );

                          return (
                            <button
                              key={
                                category.id
                              }
                              type="button"
                              onClick={() =>
                                toggleCategory(
                                  category.id,
                                )
                              }
                              className={cn(
                                "cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97]",

                                selected
                                  ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-[#A74848]"
                                  : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white",
                              )}
                            >
                              {
                                category.name
                              }
                            </button>
                          );
                        },
                      )}
                    </div>

                    {/* Selected procedures */}

                    {selectedProcedures.length >
                    0 ? (
                      <div className="mt-6 border-t border-black/10 pt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/45">
                          {t(
                            "selectedProcedures",
                          )}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {selectedProcedures.map(
                            (
                              procedure,
                            ) => (
                              <button
                                key={
                                  procedure.id
                                }
                                type="button"
                                onClick={() =>
                                  toggleProcedure(
                                    procedure.id,
                                  )
                                }
                                className="cursor-pointer rounded-full border border-[#283C5D] bg-[#283C5D] px-4 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:bg-[#A74848] active:scale-[0.97]"
                              >
                                {
                                  procedure.name
                                }
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>

              {/* ═══════════════════════
                  PROCEDURES
              ═══════════════════════ */}

              <div className="bg-white p-4 md:h-[52vh] md:overflow-y-auto md:p-6">
                <div className="sticky -top-19 z-10 mb-4 bg-white pb-4 pt-2 md:-top-6 md:pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                        {t(
                          "procedures",
                        )}
                      </h3>

                      <p className="mt-1 text-xs text-[#283C5D]/55">
                        {selectedCategories.length >
                        0
                          ? t(
                              "selectProcedures",
                            )
                          : t(
                              "chooseCategoryFirst",
                            )}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-medium text-[#d8bd8d]">
                      {
                        selectedProcedureIds.length
                      }{" "}
                      selected
                    </p>
                  </div>

                  {allVisibleProcedureIds.length >
                  0 ? (
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={
                          selectAllProcedures
                        }
                        disabled={
                          allVisibleSelected
                        }
                        className={cn(
                          "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97]",

                          allVisibleSelected
                            ? "cursor-not-allowed border-black/5 bg-[#FAF9F7] text-[#283C5D]/30"
                            : "border-[#283C5D]/20 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white",
                        )}
                      >
                        <CheckCheck
                          size={
                            13
                          }
                        />

                        {t(
                          "selectAllProcedures",
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={
                          deselectAllProcedures
                        }
                        disabled={
                          !anyVisibleSelected
                        }
                        className={cn(
                          "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97]",

                          !anyVisibleSelected
                            ? "cursor-not-allowed border-black/5 bg-[#FAF9F7] text-[#283C5D]/30"
                            : "border-red-200 bg-white text-[#A74848] hover:border-red-500 hover:bg-[#A74848] hover:text-white",
                        )}
                      >
                        <XCircle
                          size={
                            13
                          }
                        />

                        {t(
                          "deselectAllProcedures",
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                {selectedCategories.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
                    {t(
                      "chooseCategoryFirst",
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 pb-6">
                    {selectedCategories.map(
                      (
                        category,
                      ) => (
                        <div
                          key={
                            category.id
                          }
                          className="space-y-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
                            {
                              category.name
                            }
                          </p>

                          {category.subcategories.map(
                            (
                              subcategory,
                            ) => (
                              <div
                                key={
                                  subcategory.id
                                }
                                className="rounded-2xl bg-[#FAF9F7] p-4"
                              >
                                <h4 className="mb-3 text-sm font-semibold text-[#283C5D]">
                                  {
                                    subcategory.name
                                  }
                                </h4>

                                <div className="flex flex-wrap gap-2">
                                  {subcategory.procedures.map(
                                    (
                                      procedure,
                                    ) => {
                                      const selected =
                                        selectedProcedureIds.includes(
                                          procedure.id,
                                        );

                                      return (
                                        <button
                                          key={
                                            procedure.id
                                          }
                                          type="button"
                                          onClick={() =>
                                            toggleProcedure(
                                              procedure.id,
                                            )
                                          }
                                          className={cn(
                                            "cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97]",

                                            selected
                                              ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-[#94604C] hover:bg-[#A74848]"
                                              : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white",
                                          )}
                                        >
                                          {
                                            procedure.name
                                          }
                                        </button>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════
              FOOTER
          ═══════════════════════════ */}

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/10 bg-white px-4 py-4 md:px-6 md:py-5">
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="cursor-pointer rounded-full border border-black/10 px-5 py-3 text-[9px] font-semibold text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97] sm:text-sm md:px-6"
            >
              {t("clear")}
            </button>

            <button
              type="button"
              onClick={
                applyFilters
              }
              disabled={
                isLoadingCatalogue
              }
              className="cursor-pointer rounded-full bg-[#d8bd8d] px-6 py-3 text-[9px] font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm md:px-7"
            >
              {t("apply")}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

/* ═════════════════════════════════════
   SELECT
═════════════════════════════════════ */

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
  options: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#283C5D]">
        {icon}
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}