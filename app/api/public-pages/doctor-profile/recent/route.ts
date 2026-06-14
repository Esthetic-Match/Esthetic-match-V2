import { prisma } from "@/lib/database/prisma";
import { apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(async () => {
  const doctors = await prisma.doctorProfile.findMany({
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      avatar: true,

      specialtyIds: true,

      city: true,
      country: true,

      yearsOfExperience: true,

      inClinicPrice: true,
      onlineConsulPrice: true,
      currency: true,

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
    slug: doctor.slug,

    name: doctor.user.name ?? "Doctor",

    specialtyIds: doctor.specialtyIds,

    city: doctor.city,
    country: doctor.country,

    googleRating: doctor.googleRating,
    googleReviewCount: doctor.googleReviewCount,

    yearsOfExperience: doctor.yearsOfExperience,

    inClinicPrice: doctor.inClinicPrice,
    onlineConsulPrice: doctor.onlineConsulPrice,

    currency: doctor.currency,

    avatar: doctor.avatar ?? doctor.user.image ?? "/images/default-doctor.png",
  }));

  return apiSuccess(formattedDoctors);
});