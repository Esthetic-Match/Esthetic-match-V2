import { getTranslations } from "next-intl/server";
import DoctorCards from "@/components/homePage/UI/DoctorCards";
import { prisma } from "@/lib/prisma";

type CategoryDoctorRecommendationsProps = {
  categoryId: string;
};

export default async function CategoryDoctorRecommendations({
  categoryId,
}: CategoryDoctorRecommendationsProps) {
  const t = await getTranslations("categoriesPage.categoriesPage");

  const doctors = await prisma.doctorProfile.findMany({
    take: 4,
    where: {
      subcategoryIds: {
        has: categoryId,
      },
      googleRating: {
        gte: 4,
      },
    },
    orderBy: [
      {
        googleRating: "desc",
      },
      {
        googleReviewCount: "desc",
      },
    ],
    select: {
      id: true,
      avatar: true,
      specialtyIds: true,
      city: true,
      country: true,
      googleRating: true,
      googleReviewCount: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  const formattedDoctors = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.user.name ?? "Doctor",
    specialtyIds: doctor.specialtyIds.join(", "),
    googleRating: doctor.googleRating?.toString() ?? "",
    googleReviewCount: doctor.googleReviewCount?.toString() ?? "",
    country: [doctor.city, doctor.country].filter(Boolean).join(", "),
    avatar: doctor.avatar ?? doctor.user.image ?? "/images/default-doctor.png",
  }));

  if (formattedDoctors.length === 0) {
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
        {formattedDoctors.map((doctor) => (
          <DoctorCards key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </section>
  );
}