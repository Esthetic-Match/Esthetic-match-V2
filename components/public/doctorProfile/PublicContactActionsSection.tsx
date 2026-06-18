import { getTranslations } from "next-intl/server";

import ConsultationPrices from "./UI/ConsultationPrices";
import GoogleMapsCard from "./UI/GoogleMapsCard";
import GoogleReviewsCard from "./UI/GoogleReviewsCard";

type PublicContactActionsSectionProps = {
  doctorProfile: {
    id: string;
    clinicName: string;
    workAddress: string;
    city: string | null;
    country: string | null;
    zipCode: string | null;
    workLatitude: number | null;
    workLongitude: number | null;
    googleMapsUri: string | null;
    googlePlaceId: string | null;
    inClinicPrice: number | null;
    onlineConsulPrice: number | null;
    bookingLink: string | null;
    onlineActive: boolean;
    socialMediaLink: string | null;
    googleReviewCount: number | null;
    googleRating: number | null;
    currency: string | null;
    stripeConnectOnboardingComplete: boolean;
  };
};

export default async function PublicContactActionsSection({
  doctorProfile,
}: PublicContactActionsSectionProps) {
  const t = await getTranslations("doctor.doctor.profile.consultationPrices");

  return (
    <section
      aria-labelledby="doctor-contact-actions-title"
      className="relative mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl"
    >
      <h2 id="doctor-contact-actions-title" className="sr-only">
        {t("title")}
      </h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <ConsultationPrices
          doctorProfileId={doctorProfile.id}
          inClinicPrice={doctorProfile.inClinicPrice}
          onlineConsulPrice={doctorProfile.onlineConsulPrice}
          onlineActive={doctorProfile.onlineActive}
          stripeConnectOnboardingComplete={doctorProfile.stripeConnectOnboardingComplete}
          currency={doctorProfile.currency}
        />

        <GoogleMapsCard
          clinicName={doctorProfile.clinicName}
          workAddress={doctorProfile.workAddress}
          city={doctorProfile.city}
          country={doctorProfile.country}
          zipCode={doctorProfile.zipCode}
          workLatitude={doctorProfile.workLatitude}
          workLongitude={doctorProfile.workLongitude}
          googleMapsUri={doctorProfile.googleMapsUri}
          googlePlaceId={doctorProfile.googlePlaceId}
        />

        <GoogleReviewsCard
          googleRating={doctorProfile.googleRating}
          googleReviewCount={doctorProfile.googleReviewCount}
          googleMapsUri={doctorProfile.googleMapsUri}
        />
      </div>
    </section>
  );
}