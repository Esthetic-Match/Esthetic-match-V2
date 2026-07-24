import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import CategoryHero from "@/components/public/categories/CategoryHero";
import CategorySubcategories from "@/components/public/categories/CategorySubcategories";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

type PublicProcedure = {
  id: string;
  name: string;
  description: string | null;
};

type PublicSubcategory = {
  id: string;
  name: string;
  description: string | null;
  procedures: PublicProcedure[];
};

type PublicCategory = {
  id: string;
  slug: string;
  href: string;
  name: string;
  description: string | null;
  homeImage: string | null;
  icon: string | null;
  subcategories: PublicSubcategory[];
};

type PublicCategoryResponse = {
  category: PublicCategory;
};

async function getPublicCategory(categoryId: string, locale: string) {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("Could not determine the application host.");
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  const response = await fetch(
    `${protocol}://${host}/api/public-pages/categories/${encodeURIComponent(
      categoryId
    )}?locale=${encodeURIComponent(locale)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Could not load category: ${response.status}`);
  }

  const data = (await response.json()) as PublicCategoryResponse;

  if (!data.category || !Array.isArray(data.category.subcategories)) {
    throw new Error("The category response is invalid.");
  }

  return data.category;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [{ categoryId }, locale, t] = await Promise.all([
    params,
    getLocale(),
    getTranslations("categoriesPage.categoriesPage"),
  ]);

  const category = await getPublicCategory(categoryId, locale);

  if (!category) {
    notFound();
  }

  const safeT = (key: string, fallback: string) => {
    return t.has(key) ? t(key) : fallback;
  };

  const subcategories = category.subcategories.map((subcategory) => ({
    id: subcategory.id,
    title: subcategory.name,
    description: subcategory.description ?? "",
    procedures: subcategory.procedures.map((procedure) => ({
      id: procedure.id,
      name: procedure.name,
    })),
    procedureCountLabel: t.has("proceduresCount")
      ? t("proceduresCount", {
          count: subcategory.procedures.length,
        })
      : `${subcategory.procedures.length} procedures`,
  }));

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MedicalSpecialty",
    name: category.name,
    description: category.description ?? undefined,
    image: category.homeImage ?? undefined,
    hasPart: category.subcategories.map((subcategory) => ({
      "@type": "MedicalProcedure",
      name: subcategory.name,
      description: subcategory.description ?? undefined,
      hasPart: subcategory.procedures.map((procedure) => ({
        "@type": "MedicalProcedure",
        name: procedure.name,
        description: procedure.description ?? undefined,
      })),
    })),
  }).replace(/</g, "\\u003c");

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <CategoryHero
        title={category.name}
        description={category.description ?? ""}
        image={category.homeImage}
        icon={category.icon}
        categoryId={category.id}
        findDoctorsLabel={safeT("findDoctors", "Find doctors")}
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:px-12 lg:px-16">
        <CategorySubcategories
          title={safeT("subcategoriesTitle", "Procedures")}
          subcategories={subcategories}
          selectedProceduresTitle={safeT(
            "selectedProceduresTitle",
            "Selected procedures"
          )}
          selectedProceduresDescription={
            t.has("selectedProceduresDescription")
              ? String(t.raw("selectedProceduresDescription"))
              : "{count} procedures selected"
          }
          chooseProceduresTitle={safeT(
            "chooseProceduresTitle",
            "Choose procedures"
          )}
          chooseProceduresDescription={safeT(
            "chooseProceduresDescription",
            "Select up to 3 procedures."
          )}
          findBestDoctors={safeT(
            "findBestDoctors",
            "Find best doctors"
          )}
          chooseProceduresButton={safeT(
            "chooseProceduresButton",
            "Choose procedures"
          )}
        />
      </section>
    </main>
  );
}