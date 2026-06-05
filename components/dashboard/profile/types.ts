// components/dashboard/profile/types.ts

export type DoctorProfileData = {
  id: string;
  slug: string;
  userId: string;

  avatar: string | null;
  yearsOfExperience: number | null;
  clinicName: string;
  clinicBanner: string | null;
  specialtyIds: string[];
  subcategoryIds: string[];
  procedureIds: string[];
  subzoneIds: string[];
  workAddress: string;
  city: string | null;
  country: string | null;
  zipCode: string | null;
  topThree: string[] | null;
  workLatitude: number | null;
  workLongitude: number | null;
  googlePlaceId: string | null;
  otherSpecialtyText: string | null;
  paidPlan: "free" | "standard" | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  SocialMediaLink: string | null;
  bookingLink: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  bookingLinks?: []| null;
  inClinicLink?: string| null;
  currency?: string | null;
  RPPS?: string | null;

  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
};