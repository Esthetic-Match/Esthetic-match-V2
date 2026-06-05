import { Sparkle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { DoctorCatalog } from "@/lib/doctorCatalogue";

type PublicExpertiseSectionProps = {
  doctorProfile: {
    procedureIds: string[];
    subcategoryIds?: string[];
  };
};

export default async function PublicExpertiseSection({
  doctorProfile,
}: PublicExpertiseSectionProps) {
  const t = await getTranslations("doctor.doctor.profile");

  const categoriesT = await getTranslations("categoriesName");
  const proceduresT = await getTranslations("proceduresName");
  const subcategoryT = await getTranslations("subcategoriesName");

  const selectedProcedureIds =
    doctorProfile.procedureIds ?? [];

  const selectedSubcategoryIds =
    doctorProfile.subcategoryIds ?? [];

  const groupedProceduresByCategory =
    DoctorCatalog.categories
      .map((category) => ({
        categoryId: category.category,

        subcategories: category.subcategories
          .map((subcategory) => ({
            subcategoryId:
              subcategory.subcategory,

            procedures:
              subcategory.procedures.filter(
                (procedure) =>
                  selectedProcedureIds.includes(
                    procedure.id
                  )
              ),
          }))
          .filter(
            (subcategory) =>
              selectedSubcategoryIds.includes(
                subcategory.subcategoryId
              ) ||
              subcategory.procedures.length > 0
          ),
      }))
      .filter(
        (category) =>
          category.subcategories.length > 0
      );

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section
        aria-labelledby="doctor-expertise-title"
        className="mt-6 rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
      >
        <div className="mb-7 flex items-center gap-3">
          <Sparkle
            size={20}
            className="text-[#d8bd8d]"
          />

          <h2
            id="doctor-expertise-title"
            className="text-sm font-bold uppercase tracking-[0.22em] text-[#283C5D]"
          >
            {t("expertise.title")}
          </h2>
        </div>

        {groupedProceduresByCategory.length >
        0 ? (
          <div className="space-y-8">
            {groupedProceduresByCategory.map(
              (category) => (
                <div key={category.categoryId}>
                  <div className="mb-4 flex items-center justify-center gap-3">
                    <div className="h-px w-8 bg-[#d8bd8d]" />

                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]">
                      {categoriesT(
                        category.categoryId
                      )}
                    </h3>
                    <div className="h-px w-8 bg-[#d8bd8d]" />
                  </div>

                  <div className="space-y-5 text-center">
                    {category.subcategories.map(
                      (subcategory) => (
                        <div
                          key={
                            subcategory.subcategoryId
                          }
                        >
                          <h4 className="mb-3 text-sm font-semibold text-[#283C5D]/80">
                            {subcategoryT(
                              subcategory.subcategoryId
                            )}
                          </h4>

                          {subcategory.procedures
                            .length > 0 ? (
                            <ul
                              itemProp="knowsAbout"
                              className="flex flex-wrap gap-3 justify-center"
                              aria-label={t(
                                "expertise.aria"
                              )}
                            >
                              {subcategory.procedures.map(
                                (procedure) => (
                                  <li
                                    key={
                                      procedure.id
                                    }
                                    className="mb-2"
                                  >
                                    <span className="inline-flex max-w-full whitespace-normal break-words rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm">
                                      {proceduresT(
                                        procedure.id
                                      )}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-[#283C5D]/45">
                              {t(
                                "expertise.noProcedures"
                              )}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-[#283C5D]/45">
            {t("expertise.noProcedures")}
          </p>
        )}
      </section>
    </div>
  );
}