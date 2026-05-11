import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import DoctorCards from "@/components/homePage/UI/DoctorCards";

type PublicDoctor = {
  id: string;
  name: string;
  specialtyIds: string;
  googleRating: string;
  googleReviewCount: string;
  country: string;
  avatar: string;
};

type CategoryDoctorRecommendationsProps = {
  categoryId: string;
};

async function getRecommendedDoctors(categoryId: string): Promise<PublicDoctor[]> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/public-pages/category-doctor-recommendations?category=${categoryId}`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function CategoryDoctorRecommendations({
  categoryId,
}: CategoryDoctorRecommendationsProps) {
  const t = await getTranslations("categoriesPage.categoriesPage");
  const doctors = await getRecommendedDoctors(categoryId);

  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-lg md:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
            {t("recommendations.eyebrow")}
          </p>

          <h2 className="text-xl font-bold text-[#283C5D] md:text-2xl">
            {t("recommendations.title")}
          </h2>
        </div>

        <p className="hidden text-xs uppercase tracking-[0.2em] text-[#283C5D]/45 md:block">
          {t("recommendations.ratingLabel")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {doctors.map((doctor) => (
          <DoctorCards key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </section>
  );
}