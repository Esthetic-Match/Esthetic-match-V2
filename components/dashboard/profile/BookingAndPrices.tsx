import ConsultationPrices from "@/components/dashboard/profile/bookingConsultion/ConsultationPrices"
import BookingLinks from "@/components/dashboard/profile/bookingConsultion/BookingLinks"
import SocialLinks from "@/components/dashboard/profile/bookingConsultion/SocialLinks"
import { DoctorProfileData } from "./types";

type BookingAndPricesProps = {
  inClinicPrice?: number | null;
  onlineConsulPrice?: number | null;
  bookingLink?: string | null;
  socialMediaLink?: string | null;
  workLatitude?: number | null;
  workLongitude?: number | null;
  googlePlaceId?: string | null;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void | Promise<void>;
};

export default function BookingAndPrices({
  inClinicPrice,
  onlineConsulPrice,
  bookingLink,
  socialMediaLink,
  onUpdateProfile,
  workLatitude,
  workLongitude,
  googlePlaceId
}: BookingAndPricesProps) {
  return (
    <section className="relative z-20 mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl">
      <div className="grid gap-5 lg:grid-cols-3">
        <ConsultationPrices
          inClinicPrice={inClinicPrice}
          onlineConsulPrice={onlineConsulPrice}
          onUpdateProfile={onUpdateProfile}
        />

        <BookingLinks bookingLink={bookingLink} />

        <SocialLinks googlePlaceId={googlePlaceId} workLatitude={workLatitude} workLongitude={workLongitude} socialMediaLink={socialMediaLink} />
      </div>
    </section>
  );
}
