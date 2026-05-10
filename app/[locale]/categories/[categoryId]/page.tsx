import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { NavBarMain } from "@/components/NavbarMain";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import CategoryHero from "@/components/homePage/categories/CategoryHero";
import CategorySpecialists from "@/components/homePage/categories/CategorySpecialists";
import CategorySubcategories from "@/components/homePage/categories/CategorySubcategories";
import CategoryDoctorRecommendations from "@/components/homePage/categories/CategoryDoctorRecommendations";
import {
  categoryPages,
  normalizeCategoryId,
} from "@/components/homePage/categories/categoryData";

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export function generateStaticParams() {
  return categoryPages.map((category) => ({
    categoryId: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  const t = await getTranslations("categoriesPage.categoriesPage");
  const specialtyT = await getTranslations("specialitiesName");
  const procedureT = await getTranslations("proceduresName");

  const category = categoryPages.find((item) => item.slug === categoryId);

  if (!category) {
    notFound();
  }

  const catalogCategory = DoctorCatalog.categories.find(
    (item) => item.category === category.id
  );

  if (!catalogCategory) {
    notFound();
  }

  const specialtyMapCategoryId = normalizeCategoryId(category.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalSpecialty",
    name: t(`categories.${category.id}.title`),
    description: t(`categories.${category.id}.description`),
    image: category.image,
    hasPart: catalogCategory.subcategories.map((subcategory) => ({
      "@type": "MedicalProcedure",
      name: t(`subcategories.${subcategory.subcategory}.title`),
      description: t(`subcategories.${subcategory.subcategory}.description`),
    })),
  };

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <NavBarMain />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CategoryHero
        title={t(`categories.${category.id}.title`)}
        description={t(`categories.${category.id}.description`)}
        image={category.image}
        icon={category.icon}
        categoryId={category.id}
        findDoctorsLabel={t("findDoctors")}
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:px-12 lg:px-16">
        <CategorySpecialists
          categoryId={specialtyMapCategoryId}
          title={t("specialistsTitle")}
          specialtyLabel={(id) => specialtyT(id)}
        />

        <CategorySubcategories
          title={t("subcategoriesTitle")}
          subcategories={catalogCategory.subcategories.map((subcategory) => ({
            subcategory: subcategory.subcategory,
            title: t(`subcategories.${subcategory.subcategory}.title`),
            description: t(`subcategories.${subcategory.subcategory}.description`),
            procedures: subcategory.procedures.map((procedure) => ({
              id: procedure.id,
              name: procedure.name,
              label: procedureT(procedure.id),
            })),
          }))}
          selectedProceduresTitle={t("selectedProceduresTitle")}
          selectedProceduresDescription={t.raw("selectedProceduresDescription")}
          chooseProceduresTitle={t("chooseProceduresTitle")}
          chooseProceduresDescription={t("chooseProceduresDescription")}
          findBestDoctors={t("findBestDoctors")}
          chooseProceduresButton={t("chooseProceduresButton")}
        />
        <CategoryDoctorRecommendations categoryId={category.id} />
      </section>
    </main>
  );
}