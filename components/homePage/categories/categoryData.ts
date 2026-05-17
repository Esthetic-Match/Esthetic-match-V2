export const categoryPages = [
  {
    key: "AESTHETIC MEDICINE FACE",
    id: "aesthetic_medicine_face",
    slug: "non-surgical-face",
    image: "/images/home/categories/aesthetic_medicine_face.png",
    icon: "/images/home/categories/icons/aesthetic-medicine-face.svg",
  },
  {
    key: "AESTHETIC MEDICINE BODY",
    id: "aesthetic_medicine_body",
    slug: "non-surgical-body",
    image: "/images/home/categories/aesthetic_medicine_body.png",
    icon: "/images/home/categories/icons/aesthetic-medicine-body.svg",
  },
  {
    key: "AESTHETIC DENTISTRY",
    id: "aesthetic_dentistry",
    slug: "aesthetic-dentistry",
    image: "/images/home/categories/aesthetic-dentistry.png",
    icon: "/images/home/categories/icons/aesthetic-dentistry.svg",
  },
  {
    key: "HAIR MEDICINE",
    id: "hair_medicine",
    slug: "hair-medicine",
    image: "/images/home/categories/hair-medicine.png",
    icon: "/images/home/categories/icons/hair-medicine.svg",
  },
  {
    key: "MUSCLE TONE & EMS",
    id: "muscle_tone_and_ems",
    slug: "muscle-tone-ems",
    image: "/images/home/categories/muscle-tone-ems.png",
    icon: "/images/home/categories/icons/muscle-tone-ems.svg",
  },
  {
    key: "IV THERAPY",
    id: "iv_therapy",
    slug: "iv-therapy",
    image: "/images/home/categories/iv-therapy.png",
    icon: "/images/home/categories/icons/iv-therapy.svg",
  },
  {
    key: "WELLNESS & DRAINAGE",
    id: "wellness_and_drainage",
    slug: "wellness-drainage",
    image: "/images/home/categories/wellness-drainage.png",
    icon: "/images/home/categories/icons/wellness-drainage.svg",
  },
  {
    key: "SURGICAL FACE",
    id: "surgical_face",
    slug: "surgical-face",
    image: "/images/home/categories/surgical-face.png",
    icon: "/images/home/categories/icons/surgical-face.svg",
  },
  {
    key: "SURGICAL BODY",
    id: "surgical_body",
    slug: "surgical-body",
    image: "/images/home/categories/surgical-body.png",
    icon: "/images/home/categories/icons/surgical-body.svg",
  },
  {
    key: "LONGEVITY MEDICINE",
    id: "longevity_medicine",
    slug: "longevity-medicine",
    image: "/images/home/categories/longevity-medicine.png",
    icon: "/images/home/categories/icons/longevity-medicine.svg",
  },
] as const;

export function normalizeCategoryId(categoryId: string) {
  return categoryId === "longevity_medicine" ? "longevity" : categoryId;
}