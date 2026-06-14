"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import CategoryHero from "@/components/public/categories/CategoryHero";
import CategorySubcategories from "@/components/public/categories/CategorySubcategories";

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = use(params);

  const t = useTranslations("categoriesPage.categoriesPage");
  const procedureT = useTranslations("proceduresName");
  const categoryT = useTranslations("categoriesName");

  const category = DoctorCatalog.categories.find((item) => item.slug === categoryId);

  if (!category) {
    return null;
  }

  const catalogCategory = DoctorCatalog.categories.find(
    (item) => item.category === category.id
  );

  if (!catalogCategory) {
    return null;
  }

  const safeT = (
    translator: ReturnType<typeof useTranslations>,
    key: string,
    fallback: string
  ) => {
    return translator.has(key) ? translator(key) : fallback;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalSpecialty",
    name: safeT(t, `categories.${category.id}.title`, category.id),
    description: safeT(t, `categories.${category.id}.description`, ""),
    image: category.homeImage,
    hasPart: catalogCategory.subcategories.map((subcategory) => ({
      "@type": "MedicalProcedure",
      name: safeT(
        t,
        `subcategories.${subcategory.subcategory}.title`,
        subcategory.subcategory
      ),
      description: safeT(
        t,
        `subcategories.${subcategory.subcategory}.description`,
        ""
      ),
    })),
  };

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CategoryHero
        title={
          categoryT.has(category.id)
            ? categoryT(category.id)
            : category.id
        }
        description={safeT(t, `categories.${category.id}.description`, "")}
        image={category.homeImage}
        icon={category.icon}
        categoryId={category.id}
        findDoctorsLabel={safeT(t, "findDoctors", "Find doctors")}
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:px-12 lg:px-16">
        <CategorySubcategories
          title={safeT(t, "subcategoriesTitle", "Procedures")}
          subcategories={catalogCategory.subcategories.map((subcategory) => ({
            subcategory: subcategory.subcategory,
            title: safeT(
              t,
              `subcategories.${subcategory.subcategory}.title`,
              subcategory.subcategory
            ),
            description: safeT(
              t,
              `subcategories.${subcategory.subcategory}.description`,
              ""
            ),
            procedures: subcategory.procedures.map((procedure) => ({
              id: procedure.id,
              name: procedure.name,
              label: procedureT.has(procedure.id)
                ? procedureT(procedure.id)
                : procedure.name,
            })),
          }))}
          selectedProceduresTitle={safeT(
            t,
            "selectedProceduresTitle",
            "Selected procedures"
          )}
          selectedProceduresDescription={
            t.has("selectedProceduresDescription")
              ? t.raw("selectedProceduresDescription")
              : "{count} procedures selected"
          }
          chooseProceduresTitle={safeT(
            t,
            "chooseProceduresTitle",
            "Choose procedures"
          )}
          chooseProceduresDescription={safeT(
            t,
            "chooseProceduresDescription",
            "Select up to 3 procedures."
          )}
          findBestDoctors={safeT(t, "findBestDoctors", "Find best doctors")}
          chooseProceduresButton={safeT(
            t,
            "chooseProceduresButton",
            "Choose procedures"
          )}
        />
      </section>
    </main>
  );
}