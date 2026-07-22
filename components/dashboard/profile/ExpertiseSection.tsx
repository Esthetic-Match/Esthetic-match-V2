"use client";

import { useState } from "react";
import { Pencil, Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";

import { DoctorCatalog } from "@/lib/doctorCatalogue";


import {
  ExpertiseTabs,
  type ExpertiseCategoryGroup,
  type ExpertiseProcedure,
  type ExpertiseSubcategoryGroup,
} from "./UI/ExpertiseTabs";
import CategoryProcedureModal from "../settings/modal/CategoryProcedureModal";

type ExpertiseSectionProps = {
  userId: string;
  specialtyIds: string[];
  procedureIds: string[];
  subcategoryIds?: string[];
};


export default function ExpertiseSection({
  userId,
  specialtyIds,
  procedureIds,
  subcategoryIds = [],
}: ExpertiseSectionProps) {
  const t = useTranslations("dashboard.expertise");

  const categoriesT = useTranslations("categoriesName");
  const proceduresT = useTranslations("proceduresName");
  const subcategoryT = useTranslations("subcategoriesName");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedSubcategoryIds, setSelectedSubcategoryIds] =
    useState<string[]>(subcategoryIds);

  const [selectedProcedureIds, setSelectedProcedureIds] =
    useState<string[]>(procedureIds);


  const groupedProceduresByCategory: ExpertiseCategoryGroup[] =
    DoctorCatalog.categories
      .map((category): ExpertiseCategoryGroup => {
        const subcategories: ExpertiseSubcategoryGroup[] =
          category.subcategories
            .map((subcategory): ExpertiseSubcategoryGroup => {
              const procedures: ExpertiseProcedure[] =
                subcategory.procedures
                  .filter((procedure): boolean =>
                    selectedProcedureIds.includes(procedure.id)
                  )
                  .map(
                    (procedure): ExpertiseProcedure => ({
                      id: procedure.id,
                      label: proceduresT(procedure.id),
                    })
                  );

              return {
                subcategoryId: subcategory.subcategory,
                label: subcategoryT(subcategory.subcategory),
                procedures,
              };
            })
            .filter(
              (subcategory): boolean =>
                selectedSubcategoryIds.includes(
                  subcategory.subcategoryId
                ) || subcategory.procedures.length > 0
            );

        return {
          categoryId: category.category,
          label: categoriesT(category.category),
          subcategories,
        };
      })
      .filter(
        (category): boolean =>
          category.subcategories.length > 0
      );

  return (
    <>
      <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
        <section className="relative mt-6 rounded-3xl border border-gray-100 bg-[#283C5D] p-6 shadow-lg md:p-8">
          {/* Edit button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label={t("title")}
            className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center 
            rounded-full cursor-pointer border border-[#283C5D]/10 bg-white text-black shadow-sm transition 
            hover:border-[#D8BD8D] hover:bg-[#D8BD8D] hover:text-[#283C5D] active:scale-[0.97] md:right-5 md:top-5"
          >
            <Pencil size={14} />
          </button>

          {/* Header */}
          <div className="mb-6 flex items-center gap-3 pl-2">
            <Sparkle
              size={20}
              className="shrink-0 text-[#d8bd8d]"
            />

            <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-white">
              {t("title")}
            </h2>
          </div>

          <ExpertiseTabs
            categories={groupedProceduresByCategory}
            ariaLabel={t("title")}
            noProceduresLabel={t("noProcedures")}
          />
        </section>
      </div>

      {isModalOpen ? (
        <CategoryProcedureModal
          open
          specialtyIds={specialtyIds}
          selectedCategoryIds={selectedSubcategoryIds}
          selectedProcedureIds={selectedProcedureIds}
          onClose={() => setIsModalOpen(false)}
          onSaved={({ subcategoryIds, procedureIds }) => {
            setSelectedSubcategoryIds(subcategoryIds);
            setSelectedProcedureIds(procedureIds);

            void fetch("/api/doctor-profile", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId,
                subcategoryIds,
                procedureIds,
              }),
            });

            setIsModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}