import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import CategoryCarouselClient from "./CategoryCarouselClient";

const categories = [
  {
    key: "NON-SURGICAL FACE",
    href: "/categories/non-surgical-face",
    image: "/images/categories/non-surgical-face.png",
  },
  {
    key: "NON-SURGICAL BODY",
    href: "/categories/non-surgical-body",
    image: "/images/categories/non-surgical-body.png",
  },
  {
    key: "AESTHETIC DENTISTRY",
    href: "/categories/aesthetic-dentistry",
    image: "/images/categories/aesthetic-dentistry.png",
  },
  {
    key: "HAIR MEDICINE",
    href: "/categories/hair-medicine",
    image: "/images/categories/hair-medicine.png",
  },
  {
    key: "MUSCLE TONE & EMS",
    href: "/categories/muscle-tone-ems",
    image: "/images/categories/muscle-tone-ems.png",
  },
  {
    key: "IV THERAPY",
    href: "/categories/iv-therapy",
    image: "/images/categories/iv-therapy.png",
  },
  {
    key: "WELLNESS & DRAINAGE",
    href: "/categories/wellness-drainage",
    image: "/images/categories/wellness-drainage.png",
  },
  {
    key: "SURGICAL FACE",
    href: "/categories/surgical-face",
    image: "/images/categories/surgical-face.png",
  },
  {
    key: "SURGICAL BODY",
    href: "/categories/surgical-body",
    image: "/images/categories/surgical-body.png",
  },
  {
    key: "LONGEVITY MEDICINE",
    href: "/categories/longevity-medicine",
    image: "/images/categories/longevity-medicine.png",
  },
] as const;

export default async function CategoryCarousel() {
  const t = await getTranslations("home.Home");

    const translatedCategories = categories.map((category) => ({
    ...category,
    label: t(category.key),
  }));

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 md:px-12 lg:px-16">
      <div className="mb-5 text-center">
        <h2 className="text-md font-bold uppercase tracking-[0.18em] text-[#283C5D]">
          {t("exploreByCategory")}
        </h2>

        <div className="mx-auto mt-2 h-px w-16 bg-[#d8bd8d]" />
      </div>

      <CategoryCarouselClient categories={translatedCategories} />
    </section>
  );
}