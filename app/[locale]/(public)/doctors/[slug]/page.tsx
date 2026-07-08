import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ClinicBanner from "@/components/public/doctorProfile/UI/ClinicBanner";
import PublicProfileHeader from "@/components/public/doctorProfile/UI/PublicProfileHeader";
import PublicExpertiseSection from "@/components/public/doctorProfile/UI/PublicExpertiseSection";
import PublicContactActionsSection from "@/components/public/doctorProfile/PublicContactActionsSection";
import Gallery from "@/components/public/doctorProfile/Gallery";
import BookingLinksSection from "@/components/public/doctorProfile/UI/BookingLinksSection";
import DoctorQuestionStickyBanner from "@/components/public/doctorProfile/UI/DoctorQuestionStickyBanner";
import GoogleReviewsList from "@/components/UI/GoogleReviewsList";
import DoctorInstagramReels from "@/components/public/doctorProfile/DoctorInstagramReels";

type ProfilePageProps = {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
};

async function getDoctorProfile(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/public-pages/single-profile?slug=${slug}`,
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

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  const doctor = await getDoctorProfile(slug);

  if (!doctor) {
    return {
      title: "Doctor Not Found | Esthetic Match",
    };
  }

  const doctorName =
    doctor.user?.name || doctor.clinicName || "Doctor";

  const location = [
    doctor.city,
    doctor.country,
  ]
    .filter(Boolean)
    .join(", ");

  const title = `${doctorName} | Esthetic Match`;

  const description = `${doctorName}${
    location ? ` is an aesthetic doctor located in ${location}.` : "."
  } Explore specialties, procedures, pricing, reviews, and booking options on Esthetic Match.`;

  const canonicalUrl = `https://www.estheticmatch.com/${locale}/doctors/${doctor.slug}`;

  return {
    title,
    description,

    keywords: [
      doctorName,
      "aesthetic doctor",
      "cosmetic doctor",
      "plastic surgeon",
      "esthetic match",
      doctor.city,
      doctor.country,
    ].filter(Boolean) as string[],

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile",

      images: doctor.avatar
        ? [
            {
              url: doctor.avatar,
              width: 1200,
              height: 630,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: doctor.avatar ? [doctor.avatar] : [],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Profilepage({
  params,
}: ProfilePageProps) {
  const { slug, locale } = await params;

  const doctorProfile = await getDoctorProfile(slug);

  if (!doctorProfile) {
    notFound();
  }

  const canonicalUrl = `https://www.estheticmatch.com/${locale}/doctors/${doctorProfile.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",

    name:
      doctorProfile.user?.name ||
      doctorProfile.clinicName,

    image: doctorProfile.avatar,

    url: canonicalUrl,

    medicalSpecialty:
      doctorProfile.specialtyIds,

    address: {
      "@type": "PostalAddress",
      streetAddress:
        doctorProfile.workAddress,

      addressLocality:
        doctorProfile.city,

      addressCountry:
        doctorProfile.country,
    },

    aggregateRating:
      doctorProfile.googleRating &&
      doctorProfile.googleReviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue:
              doctorProfile.googleRating,

            reviewCount:
              doctorProfile.googleReviewCount,
          }
        : undefined,

    priceRange:
      doctorProfile.inClinicPrice
        ? `${doctorProfile.inClinicPrice} ${doctorProfile.currency}`
        : undefined,
  };

  return (
    <main className="min-h-screen bg-[#FAF9F7] pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <ClinicBanner
        clinicBanner={doctorProfile.clinicBanner}
        clinicName={doctorProfile.clinicName}
      />

      <PublicProfileHeader
        doctorProfile={doctorProfile}
      />

      <PublicContactActionsSection
        doctorProfile={doctorProfile}
      />
      
      <GoogleReviewsList googlePlaceId={doctorProfile.googlePlaceId} />

      <DoctorInstagramReels
        doctorProfileId={doctorProfile.id}
      />

      <BookingLinksSection
        bookingLinks={doctorProfile.bookingLinks}
      />

      <PublicExpertiseSection
        doctorProfile={doctorProfile}
      />

      <Gallery
        doctorId={doctorProfile.userId}
        paidPlan={doctorProfile.paidPlan}
      />

      <DoctorQuestionStickyBanner
        doctorProfileId={doctorProfile.id}
        doctorName={doctorProfile.user.name}
        onlineConsulPrice={
          doctorProfile.onlineConsulPrice
        }
        currency={doctorProfile.currency}
        onlineActive={doctorProfile.onlineActive}
        stripeConnectOnboardingComplete={
          doctorProfile.stripeConnectOnboardingComplete
        }
      />
    </main>
  );
}