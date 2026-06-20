import { getTranslations } from "next-intl/server";
import Link from "next/link";

import CategoryCarouselClient, {
  type HomeCategoryCarouselItem,
} from "./CategoryCarouselClient";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

export default async function CategoryCarousel() {
  const t = await getTranslations("home.Home");

  const categories: HomeCategoryCarouselItem[] = DoctorCatalog.categories.map(
    (category) => ({
      id: category.id,
      key: category.key,
      href: category.href,
      homeImage: category.homeImage,
      icon: category.icon,
    })
  );

  return (
    <section
      id="explore-by-category"
      aria-labelledby="explore-by-category-heading"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 md:px-12 lg:px-16"
    >
      <div className="mb-5 text-start">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8bd8d]">
          {t("exploreByCategoryEyebrow", { default: "Explore treatments" })}
        </p>

        <h2
          id="explore-by-category-heading"
          className="mt-2 text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl"
        >
          {t("exploreByCategory")}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
          {t("exploreByCategoryDescription", {
            default:
              "Browse aesthetic treatments by category and find trusted doctors for your needs.",
          })}
        </p>

        <div className="mt-4 h-px w-16 bg-[#d8bd8d]" />
      </div>

      <CategoryCarouselClient categories={categories} />

      <nav
        aria-label={t("exploreByCategory", { default: "Explore by category" })}
        className="sr-only"
      >
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={category.href}>{category.key}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t("exploreByCategory"),
            itemListElement: categories.map((category, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: category.key,
              url: category.href,
            })),
          }),
        }}
      />
    </section>
  );
}