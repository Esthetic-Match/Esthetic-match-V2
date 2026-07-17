import ConsultationPrices from "@/components/dashboard/profile/bookingConsultion/ConsultationPrices"
import BookingLinks from "@/components/dashboard/profile/bookingConsultion/BookingLinks"
import { DoctorProfileData } from "./types";
import GoogleReviewsButton from "./UI/GoogleReviewsButton";

type BookingAndPricesProps = {
  inClinicPrice?: number | null;
  onlineConsulPrice?: number | null;
  clinicName?: string | null;
  workLatitude?: number | null;
  workLongitude?: number | null;
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  stripeConnectOnboardingComplete?: boolean | null;
  bookingLinks?: []|null;
  currency?: string | null;
  onlineActive?: boolean | null;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void | Promise<void>;
};

export default function BookingAndPrices({
  inClinicPrice,
  onlineConsulPrice,
  clinicName,
  onUpdateProfile,
  workLatitude,
  workLongitude,
  googlePlaceId,
  googleReviewCount,
  googleRating,
  bookingLinks,
  stripeConnectOnboardingComplete,
  onlineActive,
  currency,
}: BookingAndPricesProps) {
  return (
    <section className="relative mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-3">
        <ConsultationPrices
          inClinicPrice={inClinicPrice}
          onlineConsulPrice={onlineConsulPrice}
          onUpdateProfile={onUpdateProfile}
          onlineActive={onlineActive}
          stripeConnectOnboardingComplete={stripeConnectOnboardingComplete}
          currency={currency}
        />
        
        <BookingLinks bookingLinks={bookingLinks} />
        
        <GoogleReviewsButton
          clinicName={clinicName}
          workLatitude={workLatitude}
          workLongitude={workLongitude}
          googlePlaceId={googlePlaceId}
          googleReviewCount={googleReviewCount}
          googleRating={googleRating}
        />
      </div>
    </section>
  );
}
