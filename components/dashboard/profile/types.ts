// components/dashboard/profile/types.ts

export type DoctorProfileData = {
  id: string;
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
  workLatitude: number | null;
  workLongitude: number | null;
  googlePlaceId: string | null;
  otherSpecialtyText: string | null;

  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
};