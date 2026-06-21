import { prisma } from "@/lib/database/prisma";
import { apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type LatestDoctorRow = {
  id: string;
  slug: string | null;
  avatar: string | null;
  specialtyIds: string[];
  city: string | null;
  country: string | null;
  yearsOfExperience: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  currency: string;
  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;
  clinicBanner: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  user: {
    name: string | null;
    image: string | null;
  };
};

export const GET = withApiHandler(async () => {
  const doctors: LatestDoctorRow[] = await prisma.doctorProfile.findMany({
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
      stripeConnectOnboardingComplete: true,
      onlineActive: true,
      clinicBanner: true,
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

  const formattedDoctors = doctors.map((doctor: LatestDoctorRow) => ({
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
    stripeConnectOnboardingComplete: doctor.stripeConnectOnboardingComplete,
    onlineActive: doctor.onlineActive,
    avatar: doctor.avatar ?? doctor.user.image ?? "/images/default-doctor.png",
    clinicBanner: doctor.clinicBanner,
  }));

  return apiSuccess(formattedDoctors);
});