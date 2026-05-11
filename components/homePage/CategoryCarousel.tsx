import { getTranslations } from "next-intl/server";
import CategoryCarouselClient from "./CategoryCarouselClient";

const categories = [
  {
    key: "NON-SURGICAL FACE",
    href: "/categories/non-surgical-face",
    image: "/images/home/categories/non-surgical-face.png",
    icon: "/images/home/categories/icons/non-surgical-face.svg",
  },
  {
    key: "NON-SURGICAL BODY",
    href: "/categories/non-surgical-body",
    image: "/images/home/categories/non-surgical-body.png",
    icon: "/images/home/categories/icons/non-surgical-body.svg",
  },
  {
    key: "AESTHETIC DENTISTRY",
    href: "/categories/aesthetic-dentistry",
    image: "/images/home/categories/aesthetic-dentistry.png",
    icon: "/images/home/categories/icons/aesthetic-dentistry.svg",
  },
  {
    key: "HAIR MEDICINE",
    href: "/categories/hair-medicine",
    image: "/images/home/categories/hair-medicine.png",
    icon: "/images/home/categories/icons/hair-medicine.svg",
  },
  {
    key: "MUSCLE TONE & EMS",
    href: "/categories/muscle-tone-ems",
    image: "/images/home/categories/muscle-tone-ems.png",
    icon: "/images/home/categories/icons/muscle-tone-ems.svg",
  },
  {
    key: "IV THERAPY",
    href: "/categories/iv-therapy",
    image: "/images/home/categories/iv-therapy.png",
    icon: "/images/home/categories/icons/iv-therapy.svg",
  },
  {
    key: "WELLNESS & DRAINAGE",
    href: "/categories/wellness-drainage",
    image: "/images/home/categories/wellness-drainage.png",
    icon: "/images/home/categories/icons/wellness-drainage.svg",
  },
  {
    key: "SURGICAL FACE",
    href: "/categories/surgical-face",
    image: "/images/home/categories/surgical-face.png",
    icon: "/images/home/categories/icons/surgical-face.svg",
  },
  {
    key: "SURGICAL BODY",
    href: "/categories/surgical-body",
    image: "/images/home/categories/surgical-body.jpg",
    icon: "/images/home/categories/icons/surgical-body.svg",
  },
  {
    key: "LONGEVITY MEDICINE",
    href: "/categories/longevity-medicine",
    image: "/images/home/categories/longevity-medicine.png",
    icon: "/images/home/categories/icons/longevity-medicine.svg",
  },
];
export default async function CategoryCarousel() {
  const t = await getTranslations("home.Home");
  const categoryT = await getTranslations("categoriesName");

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