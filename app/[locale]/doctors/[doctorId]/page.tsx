import { notFound } from "next/navigation";
import ClinicBanner from "@/components/homePage/doctorProfile/UI/ClinicBanner";
import PublicProfileHeader from "@/components/homePage/doctorProfile/UI/PublicProfileHeader";
import PublicExpertiseSection from "@/components/homePage/doctorProfile/UI/PublicExpertiseSection";
import PublicContactActionsSection from "@/components/homePage/doctorProfile/PublicContactActionsSection";
import Gallery from "@/components/homePage/doctorProfile/Gallery";
import { NavBarMain } from "@/components/NavbarMain";
import BookingLinksSection from "@/components/homePage/doctorProfile/UI/BookingLinksSection";
import DoctorQuestionStickyBanner from "@/components/homePage/doctorProfile/UI/DoctorQuestionStickyBanner";

type ProfilePageProps = {
  params: Promise<{
    doctorId: string;
    locale: string;
  }>;
};

async function getDoctorProfile(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/public-pages/single-profile?id=${id}`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function Profilepage({ params }: ProfilePageProps) {
  const { doctorId } = await params;

  const doctorProfile = await getDoctorProfile(doctorId);

  if (!doctorProfile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] pb-32">
      <NavBarMain />
      <ClinicBanner
        clinicBanner={doctorProfile.clinicBanner}
        clinicName={doctorProfile.clinicName}
      />
      <PublicProfileHeader doctorProfile={doctorProfile} />
      <PublicExpertiseSection doctorProfile={doctorProfile} />
      <PublicContactActionsSection doctorProfile={doctorProfile} />
      <BookingLinksSection bookingLinks={doctorProfile.bookingLinks} />
      <Gallery
         doctorId={doctorProfile.userId}
         paidPlan={doctorProfile.paidPlan}
       />
      <DoctorQuestionStickyBanner
        doctorProfileId={doctorProfile.id}
        doctorName={doctorProfile.clinicName}
        onlineConsulPrice={doctorProfile.onlineConsulPrice}
        currency={doctorProfile.currency}
      />
    </main>
  );
}