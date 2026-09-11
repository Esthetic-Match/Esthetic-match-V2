"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Loader2,
  Pencil,
  Sparkle,
} from "lucide-react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  ExpertiseTabs,
  type ExpertiseCategoryGroup,
  type ExpertiseProcedure,
  type ExpertiseSubcategoryGroup,
} from "./UI/ExpertiseTabs";

import CategoryProcedureModal from "../settings/modal/CategoryProcedureModal";

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

type ExpertiseSectionProps = {
  userId: string;
  specialtyIds: string[];
  procedureIds: string[];

  /**
   * IMPORTANT:
   *
   * This legacy DoctorProfile property is named
   * "subcategoryIds", but in the current profile
   * flow it contains selected CATEGORY IDs.
   *
   * We keep the prop name for compatibility with
   * the existing backend/profile shape.
   */
  subcategoryIds?: string[];
};

/* ═════════════════════════════════════
   COMPONENT
═════════════════════════════════════ */

export default function ExpertiseSection({
  userId,
  specialtyIds,
  procedureIds,
  subcategoryIds = [],
}: ExpertiseSectionProps) {
  const t =
    useTranslations(
      "dashboard.expertise",
    );

  const locale = useLocale();

  /* ═══════════════════════════════════
     MODAL
  ═══════════════════════════════════ */

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  /* ═══════════════════════════════════
     CATALOGUE
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
  ] = useState(true);

  const [
    catalogueError,
    setCatalogueError,
  ] = useState<string | null>(
    null,
  );

  /* ═══════════════════════════════════
     LOCAL SELECTIONS
  ═══════════════════════════════════ */

  const [
    selectedCategoryIds,
    setSelectedCategoryIds,
  ] = useState<string[]>(
    subcategoryIds,
  );

  const [
    selectedProcedureIds,
    setSelectedProcedureIds,
  ] = useState<string[]>(
    procedureIds,
  );

  /* ═══════════════════════════════════
     SYNC PROPS
  ═══════════════════════════════════ */

  useEffect(() => {
    setSelectedCategoryIds(
      subcategoryIds,
    );
  }, [subcategoryIds]);

  useEffect(() => {
    setSelectedProcedureIds(
      procedureIds,
    );
  }, [procedureIds]);

  /* ═══════════════════════════════════
     LOAD CATALOGUE FROM DATABASE
  ═══════════════════════════════════ */

  useEffect(() => {
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
            | CatalogueResponse
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
          "Could not load expertise catalogue:",
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
  }, [locale]);

  /* ═══════════════════════════════════
     GROUP SELECTED PROCEDURES
  ═══════════════════════════════════ */

  const groupedProceduresByCategory =
    useMemo<
      ExpertiseCategoryGroup[]
    >(() => {
      const selectedProcedureSet =
        new Set(
          selectedProcedureIds,
        );

      const selectedCategorySet =
        new Set(
          selectedCategoryIds,
        );

      return categories
        .map(
          (
            category,
          ): ExpertiseCategoryGroup => {
            const subcategories: ExpertiseSubcategoryGroup[] =
              category.subcategories
                .map(
                  (
                    subcategory,
                  ): ExpertiseSubcategoryGroup => {
                    const procedures: ExpertiseProcedure[] =
                      subcategory.procedures
                        .filter(
                          (
                            procedure,
                          ) =>
                            selectedProcedureSet.has(
                              procedure.id,
                            ),
                        )
                        .map(
                          (
                            procedure,
                          ): ExpertiseProcedure => ({
                            id:
                              procedure.id,

                            label:
                              procedure.name,
                          }),
                        );

                    return {
                      subcategoryId:
                        subcategory.id,

                      label:
                        subcategory.name,

                      procedures,
                    };
                  },
                )

                /**
                 * Only show subcategories that
                 * actually contain one of the
                 * doctor's selected procedures.
                 */
                .filter(
                  (
                    subcategory,
                  ) =>
                    subcategory
                      .procedures
                      .length > 0,
                );

            return {
              categoryId:
                category.id,

              label:
                category.name,

              subcategories,
            };
          },
        )

        /**
         * A category is shown when:
         *
         * 1. It contains selected procedures, or
         * 2. It is explicitly selected in the
         *    legacy category selection array.
         *
         * The second condition allows ExpertiseTabs
         * to display its no-procedures state for
         * selected categories with zero procedures.
         */
        .filter(
          (category) =>
            category.subcategories
              .length > 0 ||
            selectedCategorySet.has(
              category.categoryId,
            ),
        );
    }, [
      categories,
      selectedCategoryIds,
      selectedProcedureIds,
    ]);

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  return (
    <>
      <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
        <section className="relative mt-6 rounded-3xl border border-gray-100 bg-[#283C5D] p-6 shadow-lg md:p-8">

          {/* ═══════════════════════════
              EDIT BUTTON
          ═══════════════════════════ */}

          <button
            type="button"
            onClick={() =>
              setIsModalOpen(true)
            }
            aria-label={t("title")}
            className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-black shadow-sm transition hover:border-[#D8BD8D] hover:bg-[#D8BD8D] hover:text-[#283C5D] active:scale-[0.97] md:right-5 md:top-5"
          >
            <Pencil size={14} />
          </button>

          {/* ═══════════════════════════
              HEADER
          ═══════════════════════════ */}

          <div className="mb-6 flex items-center gap-3 pl-2">
            <Sparkle
              size={20}
              className="shrink-0 text-[#d8bd8d]"
            />

            <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-white">
              {t("title")}
            </h2>
          </div>

          {/* ═══════════════════════════
              LOADING
          ═══════════════════════════ */}

          {isLoadingCatalogue ? (
            <div className="flex min-h-[140px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Loader2 className="h-4 w-4 animate-spin text-[#d8bd8d]" />

                <span>
                  Loading expertise…
                </span>
              </div>
            </div>
          ) : catalogueError ? (
            /* ═════════════════════════
               ERROR
            ═════════════════════════ */

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/65">
              {catalogueError}
            </div>
          ) : (
            /* ═════════════════════════
               EXPERTISE
            ═════════════════════════ */

            <ExpertiseTabs
              categories={
                groupedProceduresByCategory
              }
              ariaLabel={t("title")}
              noProceduresLabel={t(
                "noProcedures",
              )}
            />
          )}
        </section>
      </div>

      {/* ═════════════════════════════
          EDIT MODAL
      ═════════════════════════════ */}

      {isModalOpen ? (
        <CategoryProcedureModal
          open
          specialtyIds={
            specialtyIds
          }
          selectedCategoryIds={
            selectedCategoryIds
          }
          selectedProcedureIds={
            selectedProcedureIds
          }
          onClose={() =>
            setIsModalOpen(false)
          }
          onSaved={({
            subcategoryIds: updatedCategoryIds,
            procedureIds: updatedProcedureIds,
          }) => {
            setSelectedCategoryIds(
              updatedCategoryIds,
            );
          
            setSelectedProcedureIds(
              updatedProcedureIds,
            );
          
            setIsModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}