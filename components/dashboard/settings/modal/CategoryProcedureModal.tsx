"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils/utils";

import { ProceduresSearchBar } from "@/components/UI/ProceduresSearchBar";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

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

type CatalogueResponse = {
  success: boolean;
  categories?: CatalogueCategory[];
  error?: string;
};

type CategoryProcedureModalProps = {
  open: boolean;

  specialtyIds: string[];

  /**
   * Despite the callback/save payload historically
   * being called "subcategoryIds", these are
   * CATEGORY IDs in the legacy DoctorProfile field.
   */
  selectedCategoryIds: string[];

  selectedProcedureIds: string[];

  onClose: () => void;

  onSaved?: (payload: {
    categoryIds: string[];
    procedureIds: string[];
  }) => void;

  saveEndpoint?: string;
};

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function normalizeSearchValue(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

function getProcedureIdsForCategory(
  category: CatalogueCategory,
): string[] {
  return Array.from(
    new Set(
      category.subcategories.flatMap(
        (subcategory) =>
          subcategory.procedures.map(
            (procedure) =>
              procedure.id,
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
   COMPONENT
═════════════════════════════════════ */

export default function CategoryProcedureModal({
  open,
  specialtyIds,
  selectedCategoryIds,
  selectedProcedureIds,
  onClose,
  onSaved,
  saveEndpoint = "/api/doctor-profile",
}: CategoryProcedureModalProps) {
  const t =
    useTranslations("settings");

  const locale = useLocale();
  const router = useRouter();

  const wasOpenRef =
    useRef(false);

  /* ─────────────────────────────────
     Catalogue
  ───────────────────────────────── */

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
    catalogueReloadKey,
    setCatalogueReloadKey,
  ] = useState(0);

  /* ─────────────────────────────────
     Selection
  ───────────────────────────────── */

  const [
    localCategoryIds,
    setLocalCategoryIds,
  ] = useState<string[]>(
    selectedCategoryIds,
  );

  const [
    localProcedureIds,
    setLocalProcedureIds,
  ] = useState<string[]>(
    selectedProcedureIds,
  );

  /* ─────────────────────────────────
     UI
  ───────────────────────────────── */

  const [
    procedureSearchQuery,
    setProcedureSearchQuery,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState<string | null>(
    null,
  );

  const [
    isCategoriesOpen,
    setIsCategoriesOpen,
  ] = useState(false);

  /* ═══════════════════════════════════
     RESET WHEN OPENING
  ═══════════════════════════════════ */

  useEffect(() => {
    if (
      open &&
      !wasOpenRef.current
    ) {
      setLocalCategoryIds(
        selectedCategoryIds,
      );

      setLocalProcedureIds(
        selectedProcedureIds,
      );

      setProcedureSearchQuery("");
      setSaveError(null);
      setCatalogueError(null);
    }

    if (
      !open &&
      wasOpenRef.current
    ) {
      setIsCategoriesOpen(false);
      setProcedureSearchQuery("");
      setSaveError(null);
    }

    wasOpenRef.current = open;
  }, [
    open,
    selectedCategoryIds,
    selectedProcedureIds,
  ]);

  /* ═══════════════════════════════════
     FETCH CATALOGUE
  ═══════════════════════════════════ */

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller =
      new AbortController();

    async function loadCatalogue() {
      try {
        setIsLoadingCatalogue(true);
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
            | CatalogueResponse
            | null;

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Could not load catalogue.",
          );
        }

        if (
          !data ||
          !Array.isArray(
            data.categories,
          )
        ) {
          throw new Error(
            "The catalogue response was invalid.",
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

        setCategories([]);

        setCatalogueError(
          error instanceof Error
            ? error.message
            : "Could not load catalogue.",
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
    open,
    locale,
    catalogueReloadKey,
  ]);

  /* ═══════════════════════════════════
     CATEGORY VISIBILITY
  ═══════════════════════════════════ */

  const visibleCategories =
    useMemo(() => {
      if (
        specialtyIds.length === 0
      ) {
        return [];
      }

      const specialtySet =
        new Set(specialtyIds);

      return categories.filter(
        (category) =>
          category.specialtyIds.some(
            (specialtyId) =>
              specialtySet.has(
                specialtyId,
              ),
          ),
      );
    }, [
      categories,
      specialtyIds,
    ]);

  const visibleCategoryIdSet =
    useMemo(
      () =>
        new Set(
          visibleCategories.map(
            (category) =>
              category.id,
          ),
        ),
      [visibleCategories],
    );

  const unavailableCategories =
    useMemo(() => {
      return categories.filter(
        (category) =>
          !visibleCategoryIdSet.has(
            category.id,
          ),
      );
    }, [
      categories,
      visibleCategoryIdSet,
    ]);

  /* ═══════════════════════════════════
     SELECTED / UNSELECTED
  ═══════════════════════════════════ */

  const selectedCategories =
    useMemo(() => {
      return visibleCategories.filter(
        (category) =>
          localCategoryIds.includes(
            category.id,
          ),
      );
    }, [
      visibleCategories,
      localCategoryIds,
    ]);

  const unselectedCategories =
    useMemo(() => {
      return visibleCategories.filter(
        (category) =>
          !localCategoryIds.includes(
            category.id,
          ),
      );
    }, [
      visibleCategories,
      localCategoryIds,
    ]);

  /* ═══════════════════════════════════
     SEARCH
  ═══════════════════════════════════ */

  const filteredSelectedCategories =
    useMemo(() => {
      const normalizedQuery =
        normalizeSearchValue(
          procedureSearchQuery,
        );

      if (
        normalizedQuery.length === 0
      ) {
        return selectedCategories;
      }

      return selectedCategories
        .map((category) => {
          const subcategories =
            category.subcategories
              .map(
                (subcategory) => {
                  const procedures =
                    subcategory.procedures.filter(
                      (
                        procedure,
                      ) => {
                        const searchable =
                          [
                            procedure.id,
                            procedure.name,
                            subcategory.id,
                            subcategory.name,
                            category.id,
                            category.name,
                          ]
                            .join(" ")
                            .toLowerCase();

                        return searchable.includes(
                          normalizedQuery,
                        );
                      },
                    );

                  return {
                    ...subcategory,
                    procedures,
                  };
                },
              )
              .filter(
                (subcategory) =>
                  subcategory
                    .procedures
                    .length >
                  0,
              );

          return {
            ...category,
            subcategories,
          };
        })
        .filter(
          (category) =>
            category.subcategories
              .length > 0,
        );
    }, [
      selectedCategories,
      procedureSearchQuery,
    ]);

  /* ═══════════════════════════════════
     VISIBLE PROCEDURES
  ═══════════════════════════════════ */

  const visibleProcedureIds =
    useMemo(() => {
      return Array.from(
        new Set(
          filteredSelectedCategories.flatMap(
            (
              category,
            ) =>
              category.subcategories.flatMap(
                (
                  subcategory,
                ) =>
                  subcategory.procedures.map(
                    (
                      procedure,
                    ) =>
                      procedure.id,
                  ),
              ),
          ),
        ),
      );
    }, [
      filteredSelectedCategories,
    ]);

  const allVisibleSelected =
    visibleProcedureIds.length > 0 &&
    visibleProcedureIds.every(
      (id) =>
        localProcedureIds.includes(
          id,
        ),
    );

  const anyVisibleSelected =
    visibleProcedureIds.some(
      (id) =>
        localProcedureIds.includes(
          id,
        ),
    );

  /* ═══════════════════════════════════
     TOGGLE CATEGORY
  ═══════════════════════════════════ */

  function toggleCategory(
    category: CatalogueCategory,
  ) {
    const categoryId =
      category.id;

    const isSelected =
      localCategoryIds.includes(
        categoryId,
      );

    if (!isSelected) {
      setLocalCategoryIds(
        (previous) => [
          ...previous,
          categoryId,
        ],
      );

      return;
    }

    /**
     * Remove the category first.
     */
    const nextCategoryIds =
      localCategoryIds.filter(
        (id) =>
          id !== categoryId,
      );

    setLocalCategoryIds(
      nextCategoryIds,
    );

    /**
     * This is intentionally NOT:
     *
     * remove every procedure inside the
     * removed category.
     *
     * Procedures can belong to more than
     * one category/subcategory.
     *
     * Instead, preserve every procedure
     * that is still available through one
     * of the remaining selected categories.
     */
    const remainingCategories =
      visibleCategories.filter(
        (item) =>
          nextCategoryIds.includes(
            item.id,
          ),
      );

    const allowedProcedureIds =
      new Set(
        getProcedureIdsForCategories(
          remainingCategories,
        ),
      );

    setLocalProcedureIds(
      (previous) =>
        previous.filter(
          (procedureId) =>
            allowedProcedureIds.has(
              procedureId,
            ),
        ),
    );
  }

  /* ═══════════════════════════════════
     TOGGLE PROCEDURE
  ═══════════════════════════════════ */

  function toggleProcedure(
    procedureId: string,
  ) {
    setLocalProcedureIds(
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

  /* ═══════════════════════════════════
     SELECT ALL
  ═══════════════════════════════════ */

  function selectAllProcedures() {
    setLocalProcedureIds(
      (previous) => {
        const next =
          new Set(previous);

        for (
          const procedureId of visibleProcedureIds
        ) {
          next.add(
            procedureId,
          );
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
        visibleProcedureIds,
      );

    setLocalProcedureIds(
      (previous) =>
        previous.filter(
          (id) =>
            !visibleIds.has(id),
        ),
    );
  }

  /* ═══════════════════════════════════
     SAVE
  ═══════════════════════════════════ */

  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveError(null);

      /**
       * Never save categories that are
       * unavailable for the doctor's
       * current specialties.
       */
      const validCategoryIds =
        localCategoryIds.filter(
          (categoryId) =>
            visibleCategoryIdSet.has(
              categoryId,
            ),
        );

      const validCategories =
        visibleCategories.filter(
          (category) =>
            validCategoryIds.includes(
              category.id,
            ),
        );

      /**
       * Remove stale procedures that no
       * longer belong to any selected
       * category.
       */
      const allowedProcedureIds =
        new Set(
          getProcedureIdsForCategories(
            validCategories,
          ),
        );

      const validProcedureIds =
        localProcedureIds.filter(
          (procedureId) =>
            allowedProcedureIds.has(
              procedureId,
            ),
        );

      /**
       * IMPORTANT:
       *
       * Your existing endpoints currently
       * expect CATEGORY IDs under the old
       * "subcategoryIds" property.
       *
       * Keep this until those endpoints
       * are migrated to categoryIds.
       */
      const payload = {
        categoryIds:
          validCategoryIds,
      
        procedureIds:
          validProcedureIds,
      };

      const response =
        await fetch(
          saveEndpoint,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload,
            ),
          },
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | {
              error?: string;
              message?: string;
            }
          | null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Could not update doctor profile.",
        );
      }

      setLocalCategoryIds(
        validCategoryIds,
      );

      setLocalProcedureIds(
        validProcedureIds,
      );

      onSaved?.(payload);

      router.refresh();
      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not update doctor profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ═══════════════════════════════════
     CLOSED
  ═══════════════════════════════════ */

  if (!open) {
    return null;
  }

  const hasSelectedCategories =
    selectedCategories.length >
    0;

  const hasFilteredProcedures =
    filteredSelectedCategories.length >
    0;

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* ═════════════════════════════
            HEADER
        ═════════════════════════════ */}

        <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
              {t(
                "proceduresModal.profileLabel",
              )}
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
              {t(
                "proceduresModal.title",
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSaving
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* ═════════════════════════════
            LOADING
        ═════════════════════════════ */}

        {isLoadingCatalogue ? (
          <div className="flex min-h-[420px] flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[#283C5D]/60">
              <Loader2 className="h-7 w-7 animate-spin text-[#d8bd8d]" />

              <p className="text-sm font-medium">
                Loading catalogue…
              </p>
            </div>
          </div>
        ) : catalogueError ? (
          /* ═══════════════════════════
             ERROR
          ═══════════════════════════ */

          <div className="flex min-h-[420px] flex-1 items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <XCircle className="mx-auto h-8 w-8 text-red-500" />

              <p className="mt-4 text-sm font-semibold text-red-700">
                {catalogueError}
              </p>

              <button
                type="button"
                onClick={() =>
                  setCatalogueReloadKey(
                    (previous) =>
                      previous + 1,
                  )
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f304c]"
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ═════════════════════════
                BODY
            ═════════════════════════ */}

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[0.85fr_1.4fr]">

              {/* ─────────────────────
                  CATEGORY SIDEBAR
              ───────────────────── */}

              <div className="esthetic-scrollbar border-b border-black/10 bg-[#FAF9F7] md:h-full md:overflow-y-auto md:border-b-0 md:border-r">

                {/* Mobile toggle */}

                <div className="md:hidden">
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
                    className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-[#283C5D]"
                  >
                    <span className="text-sm font-semibold uppercase tracking-[0.25em]">
                      {t(
                        "proceduresModal.categories",
                      )}
                    </span>

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

                {/* Desktop title */}

                <div className="hidden px-6 pb-4 pt-6 md:block">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                    {t(
                      "proceduresModal.categories",
                    )}
                  </h3>
                </div>

                <div
                  className={cn(
                    "space-y-5 px-6 pb-6",

                    isCategoriesOpen
                      ? "block"
                      : "hidden md:block",
                  )}
                >
                  {/* Selected categories */}

                  {selectedCategories.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(
                        (
                          category,
                        ) => (
                          <button
                            key={
                              category.id
                            }
                            type="button"
                            onClick={() =>
                              toggleCategory(
                                category,
                              )
                            }
                            className="rounded-full border border-[#283C5D] bg-[#283C5D] px-4 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:bg-[#A74848] active:scale-[0.97]"
                          >
                            {
                              category.name
                            }
                          </button>
                        ),
                      )}
                    </div>
                  ) : null}

                  {selectedCategories.length >
                    0 &&
                  unselectedCategories.length >
                    0 ? (
                    <div className="h-px w-full bg-black/10" />
                  ) : null}

                  {/* Available categories */}

                  <div className="flex flex-wrap gap-2">
                    {unselectedCategories.map(
                      (
                        category,
                      ) => (
                        <button
                          key={
                            category.id
                          }
                          type="button"
                          onClick={() =>
                            toggleCategory(
                              category,
                            )
                          }
                          className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-[#283C5D] transition hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
                        >
                          {
                            category.name
                          }
                        </button>
                      ),
                    )}
                  </div>

                  {/* Outside specialty */}

                  {unavailableCategories.length >
                  0 ? (
                    <div className="border-t border-black/10 pt-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/45">
                        {t(
                          "proceduresModal.outsideSpecialties",
                        )}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {unavailableCategories.map(
                          (
                            category,
                          ) => (
                            <button
                              key={
                                category.id
                              }
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-full border border-black/5 bg-gray-100 px-4 py-2 text-xs font-medium text-gray-400"
                            >
                              {
                                category.name
                              }
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ─────────────────────
                  PROCEDURES
              ───────────────────── */}

              <div className="esthetic-scrollbar h-full min-h-0 overflow-y-auto bg-white p-6">
                <div className="sticky top-0 z-10 mb-4 bg-white pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                        {t(
                          "proceduresModal.procedures",
                        )}
                      </h3>

                      <p className="mt-1 text-xs text-[#283C5D]/55">
                        {t(
                          "proceduresModal.description",
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-medium text-[#d8bd8d]">
                      {t(
                        "proceduresModal.selectedCount",
                        {
                          count:
                            localProcedureIds.length,
                        },
                      )}
                    </p>
                  </div>

                  {hasSelectedCategories ? (
                    <ProceduresSearchBar
                      value={
                        procedureSearchQuery
                      }
                      onChange={
                        setProcedureSearchQuery
                      }
                      placeholder="Search procedures"
                      ariaLabel="Search procedures"
                      className="mt-4"
                    />
                  ) : null}

                  {visibleProcedureIds.length >
                  0 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      <button
                        type="button"
                        onClick={
                          selectAllProcedures
                        }
                        disabled={
                          allVisibleSelected
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97]",

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
                          "proceduresModal.selectAll",
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
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97]",

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
                          "proceduresModal.deselectAll",
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* No selected categories */}

                {!hasSelectedCategories ? (
                  <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
                    {t(
                      "proceduresModal.emptyCategories",
                    )}
                  </div>
                ) : !hasFilteredProcedures ? (
                  /* No search results */

                  <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
                    No procedures found.
                  </div>
                ) : (
                  /* Procedure groups */

                  <div className="space-y-6 pb-6">
                    {filteredSelectedCategories.map(
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
                                      const isSelected =
                                        localProcedureIds.includes(
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
                                            "rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97]",

                                            isSelected
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

            {/* ═════════════════════════
                SAVE ERROR
            ═════════════════════════ */}

            {saveError ? (
              <div className="shrink-0 border-t border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
                {saveError}
              </div>
            ) : null}

            {/* ═════════════════════════
                FOOTER
            ═════════════════════════ */}

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-black/10 px-6 py-5">
              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  isSaving
                }
                className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-black/5 active:scale-[0.97] disabled:opacity-50"
              >
                {t(
                  "proceduresModal.cancel",
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  isSaving ||
                  isLoadingCatalogue
                }
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-[#d8bd8d] px-7 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    {t(
                      "proceduresModal.saving",
                    )}
                  </>
                ) : (
                  t(
                    "proceduresModal.saveChanges",
                  )
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}