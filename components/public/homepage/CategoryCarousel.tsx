import { getTranslations } from "next-intl/server";

import CategoryCarouselClient from "./CategoryCarouselClient";

export default async function CategoryCarousel() {
  const t = await getTranslations("home.Home");
  const listName = t("exploreByCategory");

  return (
    <section
      id="explore-by-category"
      aria-labelledby="explore-by-category-heading"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 md:px-12 md:py-28 lg:px-16"
    >
      <div className="mb-8 text-start">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8bd8d]">
          {t("exploreByCategoryEyebrow", {
            default: "Explore treatments",
          })}
        </p>

        <h2
          id="explore-by-category-heading"
          className="mt-2 text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl"
        >
          {listName}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
          {t("exploreByCategoryDescription", {
            default:
              "Browse aesthetic treatments by category and find trusted doctors for your needs.",
          })}
        </p>

        <div className="mt-5 h-px w-16 bg-[#d8bd8d]" />
      </div>

      <CategoryCarouselClient listName={listName} />
    </section>
  );
}