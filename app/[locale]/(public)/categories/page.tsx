import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {NavBarMain} from "@/components/NavbarMain";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { getTranslations } from "next-intl/server";

const categories = [
    {
    key: "SURGICAL FACE",
    id: "surgical_face",
    href: "/categories/surgical-face",
    image: "/images/home/categories/surgical-face.png",
    icon: "/images/home/categories/icons/surgical-face.svg",
    description:
      "Surgical facial procedures for lifting, contouring, reshaping, and structural facial refinement.",
  },
  {
    key: "SURGICAL BODY",
    id: "surgical_body",
    href: "/categories/surgical-body",
    image: "/images/home/categories/surgical-body.png",
    icon: "/images/home/categories/icons/surgical-body.svg",
    description:
      "Surgical body contouring, breast surgery, intimate procedures, liposuction, and body reshaping.",
  },
  {
    key: "AESTHETIC MEDICINE FACE",
    id: "aesthetic_medicine_face",
    href: "/categories/non-surgical-face",
    image: "/images/home/categories/aesthetic_medicine_face.png",
    icon: "/images/home/categories/icons/aesthetic-medicine-face.svg",
    description:
      "Minimally invasive facial treatments focused on volume, skin quality, lifting, resurfacing, and rejuvenation.",
  },
  {
    key: "AESTHETIC MEDICINE BODY",
    id: "aesthetic_medicine_body",
    href: "/categories/non-surgical-body",
    image: "/images/home/categories/aesthetic_medicine_body.png",
    icon: "/images/home/categories/icons/aesthetic-medicine-body.svg",
    description:
      "Body contouring, fat reduction, weight management, and wellness-led treatments without surgery.",
  },
  {
    key: "AESTHETIC DENTISTRY",
    id: "aesthetic_dentistry",
    href: "/categories/aesthetic-dentistry",
    image: "/images/home/categories/aesthetic-dentistry.png",
    icon: "/images/home/categories/icons/aesthetic-dentistry.svg",
    description:
      "Cosmetic dental treatments designed to improve smile shape, brightness, balance, and restoration.",
  },
  {
    key: "HAIR MEDICINE",
    id: "hair_medicine",
    href: "/categories/hair-medicine",
    image: "/images/home/categories/hair-medicine.png",
    icon: "/images/home/categories/icons/hair-medicine.svg",
    description:
      "Hair restoration, scalp treatments, and surgical or non-surgical solutions for hair health.",
  },
  {
    key: "MUSCLE TONE & EMS",
    id: "muscle_tone_and_ems",
    href: "/categories/muscle-tone-ems",
    image: "/images/home/categories/muscle-tone-ems.png",
    icon: "/images/home/categories/icons/muscle-tone-ems.svg",
    description:
      "Electrical muscle stimulation treatments for body sculpting, facial toning, and performance support.",
  },
  {
    key: "IV THERAPY",
    id: "iv_therapy",
    href: "/categories/iv-therapy",
    image: "/images/home/categories/iv-therapy.png",
    icon: "/images/home/categories/icons/iv-therapy.svg",
    description:
      "Intravenous hydration, vitamins, recovery, immunity, energy, and beauty-focused wellness drips.",
  },
  {
    key: "WELLNESS & POSTOPERATIVE",
    id: "wellness_and_postoperative",
    href: "/categories/wellness-and-postoperative",
    image: "/images/home/categories/wellness-and-postoperative.png",
    icon: "/images/home/categories/icons/wellness-and-postoperative.svg",
    description:
      "Treatments supporting circulation, lymphatic drainage, relaxation, recovery, and general wellbeing.",
  },
  {
    key: "LONGEVITY MEDICINE",
    id: "longevity_medicine",
    href: "/categories/longevity-medicine",
    image: "/images/home/categories/longevity-medicine.png",
    icon: "/images/home/categories/icons/longevity-medicine.svg",
    description:
      "Diagnostics, regenerative medicine, performance optimization, and medical longevity programs.",
  },
];

export default async function CategoriesPage() {
  const t = await getTranslations("categoriesPage.categoriesPage");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("seo.itemListName"),
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MedicalSpecialty",
        name: t(`categories.${category.id}.title`),
        description: t(`categories.${category.id}.description`),
        url: category.href,
        image: category.image,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <NavBarMain />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

        <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:px-16 cursor-default">
          <div className="grid gap-4">
            {categories.map((category, index) => {
              const catalogCategory = DoctorCatalog.categories.find(
                (item) => item.category === category.id
              );
          
              return (
                <article
                  key={category.id}
                  id={category.id}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-lg transition-all duration-500 hover:shadow-xl"
                >
                  <div className="grid transition-all duration-500 lg:grid-cols-[260px_1fr]">
                    <div className="relative min-h-[120px] overflow-hidden bg-[#061A2D] md:min-h-[150px]">
                      <Image
                        src={category.image}
                        alt={t(`categories.${category.id}.title`)}
                        fill
                        sizes="260px"
                        className="object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D]/70 via-[#061A2D]/25 to-transparent" />
            
                      <div className="absolute right-6 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/95 shadow-md">
                        <Image
                          src={category.icon}
                          alt=""
                          width={30}
                          height={30}
                          className="h-20 w-20 object-contain"
                        />
                      </div>
                    </div>
            
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
                            {t("categoryLabel", { count: index + 1 })}
                          </p>
            
                          <h2 className="text-2xl font-bold uppercase leading-none text-[#283C5D] md:text-3xl">
                            {t(`categories.${category.id}.title`)}
                          </h2>
                        </div>
            
                        <Link
                          href={`/${category.href}`}
                          className="w-fit rounded-full border border-[#d8bd8d] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white"
                        >
                          {t("viewDetails")}
                        </Link>
                      </div>
            
                      <div className="grid max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:mt-6 group-hover:max-h-[900px] group-hover:opacity-100">
                        <p className="max-w-3xl text-lg leading-7 text-[#283C5D]/70">
                          {t(`categories.${category.id}.description`)}
                        </p>
            
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          {catalogCategory?.subcategories.map((subcategory) => (
                            <div
                              key={subcategory.subcategory}
                              className="rounded-2xl border border-black/10 bg-[#FAF9F7] p-5"
                            >
                              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#283C5D]">
                                {t(`subcategories.${subcategory.subcategory}.title`)}
                              </h3>
                        
                              <p className="mt-3 text-sm leading-6 text-[#283C5D]/60">
                                {t(
                                  `subcategories.${subcategory.subcategory}.description`
                                )}
                              </p>
                            
                              <p className="mt-4 text-xs font-medium text-[#d8bd8d]">
                                {t("proceduresCount", {
                                  count: subcategory.procedures.length,
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
    </main>
  );
}