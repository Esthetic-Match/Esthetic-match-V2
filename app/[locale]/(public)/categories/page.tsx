import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

import { Link } from "@/i18n/navigation";

type PublicSubcategory = {
  id: string;
  name: string;
  description: string | null;
  procedureCount: number;
};

type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  href: string;
  homeImage: string | null;
  icon: string | null;
  subcategories: PublicSubcategory[];
};

type PublicCategoriesResponse = {
  categories: PublicCategory[];
};

async function getPublicCategories(locale: string) {
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
    `${protocol}://${host}/api/public-pages/categories?locale=${encodeURIComponent(
      locale
    )}`,
    {
      method: "GET",
      next: {
        revalidate: 60,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Could not load categories: ${response.status}`);
  }

  const data = (await response.json()) as PublicCategoriesResponse;

  if (!Array.isArray(data.categories)) {
    throw new Error("The categories response is invalid.");
  }

  return data.categories;
}

export default async function CategoriesPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("categoriesPage.categoriesPage"),
  ]);

  const categories = await getPublicCategories(locale);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("seo.itemListName"),
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MedicalSpecialty",
        name: category.name,
        description: category.description ?? undefined,
        url: category.href,
        image: category.homeImage ?? undefined,
      },
    })),
  }).replace(/</g, "\\u003c");

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <section className="relative overflow-hidden bg-[#061A2D] px-6 py-24 text-white md:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(216,189,141,0.24),transparent_34%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#FAF9F7]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.45em] text-[#d8bd8d]">
            {t("hero.eyebrow")}
          </p>

          <h1 className="max-w-4xl text-4xl font-bold uppercase leading-[0.95] md:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
            {t("hero.description")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl cursor-default px-6 py-16 md:px-12 lg:px-16">
        <div className="grid gap-4">
          {categories.map((category, index) => (
            <article
              key={category.id}
              id={category.id}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-lg transition-all duration-500 hover:shadow-xl"
            >
              <div className="grid transition-all duration-500 lg:grid-cols-[260px_1fr]">
                <div className="relative min-h-[120px] overflow-hidden bg-[#061A2D] md:min-h-[150px]">
                  {category.homeImage ? (
                    <Image
                      src={category.homeImage}
                      alt={category.name}
                      fill
                      sizes="260px"
                      className="object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D]/70 via-[#061A2D]/25 to-transparent" />

                  {category.icon ? (
                    <div className="absolute right-6 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/95 shadow-md">
                      <Image
                        src={category.icon}
                        alt=""
                        width={30}
                        height={30}
                        className="h-20 w-20 object-contain"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
                        {t("categoryLabel", { count: index + 1 })}
                      </p>

                      <h2 className="text-2xl font-bold uppercase leading-none text-[#283C5D] md:text-3xl">
                        {category.name}
                      </h2>
                    </div>

                    <Link
                      href={category.href}
                      className="w-fit rounded-full border border-[#d8bd8d] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white"
                    >
                      {t("viewDetails")}
                    </Link>
                  </div>

                  <div className="grid max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:mt-6 group-hover:max-h-[900px] group-hover:opacity-100">
                    {category.description ? (
                      <p className="max-w-3xl text-lg leading-7 text-[#283C5D]/70">
                        {category.description}
                      </p>
                    ) : null}

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {category.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="rounded-2xl border border-black/10 bg-[#FAF9F7] p-5"
                        >
                          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#283C5D]">
                            {subcategory.name}
                          </h3>

                          {subcategory.description ? (
                            <p className="mt-3 text-sm leading-6 text-[#283C5D]/60">
                              {subcategory.description}
                            </p>
                          ) : null}

                          <p className="mt-4 text-xs font-medium text-[#d8bd8d]">
                            {t("proceduresCount", {
                              count: subcategory.procedureCount,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}