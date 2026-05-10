import ConsultationPrices from "./UI/ConsultationPrices";
import BookingLinks from "./UI/BookingLinks";

type PublicContactActionsSectionProps = {
  doctorProfile: {
    paidPlan: string | null;
    inClinicPrice: number | null;
    onlineConsulPrice: number | null;
    bookingLink: string | null;
    socialMediaLink: string | null;
    googlePlaceId: string | null;
    workLatitude: number | null;
    workLongitude: number | null;
    googleReviewCount: number | null;
    googleRating: number | null;
  };
};

export default function PublicContactActionsSection({
  doctorProfile,
}: PublicContactActionsSectionProps) {
  const isFreePlan =
    doctorProfile.paidPlan === "free" || !doctorProfile.paidPlan;

  return (
    <section
      aria-labelledby="doctor-contact-actions-title"
      className="relative mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl"
    >
      <h2 id="doctor-contact-actions-title" className="sr-only">
        Doctor consultation prices, booking links and contact options
      </h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <ConsultationPrices
          inClinicPrice={doctorProfile.inClinicPrice}
          onlineConsulPrice={doctorProfile.onlineConsulPrice}
        />

        {!isFreePlan ? (
            <BookingLinks bookingLink={doctorProfile.bookingLink} />
        ) : null}
      </div>
    </section>
  );
}