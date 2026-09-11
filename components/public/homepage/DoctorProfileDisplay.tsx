import Script from "next/script";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import DoctorCards from "@/components/public/UI/DoctorCards";

type LocalizedCatalogueItem = {
  id: string;
  name: string;
};

type PublicDoctor = {
  id: string;
  slug: string;
  name: string;
  specialtyIds: string[];
  specialties: LocalizedCatalogueItem[];
  topThree: string[];
  topThreeProcedures: LocalizedCatalogueItem[];
  avatar: string;
  city: string | null;
  country: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  yearsOfExperience: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  stripeConnectOnboardingComplete?: boolean;
  onlineActive?: boolean;
  currency: string;
  clinicBanner?: string | null;
};

async function getMostRecentDoctors(
  locale: string
): Promise<PublicDoctor[]> {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host");

  if (!host) {
    return [];
  }

  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  const response = await fetch(
    `${protocol}://${host}/api/public-pages/doctor-profile/recent?locale=${encodeURIComponent(
      locale
    )}`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
}

export default async function ProfileDisplay() {
  const [t, locale] = await Promise.all([
    getTranslations("home.Home"),
    getLocale(),
  ]);

  const doctors = await getMostRecentDoctors(locale);

  if (doctors.length === 0) {
    return null;
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("nearbyDoctors"),
    itemListElement: doctors.map((doctor, index) => {
      const hasRating =
        doctor.googleRating !== null &&
        doctor.googleReviewCount !== null &&
        doctor.googleReviewCount > 0;

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Physician",
          name: doctor.name,
          medicalSpecialty: doctor.specialties.map(
            (specialty) => specialty.name
          ),
          image: doctor.avatar,
          url: `/doctors/${doctor.slug}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: doctor.city ?? undefined,
            addressCountry: doctor.country ?? undefined,
          },
          ...(hasRating
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: doctor.googleRating,
                  reviewCount: doctor.googleReviewCount,
                },
              }
            : {}),
        },
      };
    }),
  }).replace(/</g, "\\u003c");

  return (
    <section
      aria-labelledby="nearby-doctors-title"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 md:px-12 lg:px-16"
    >
      <Script
        id="recent-doctors-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            id="nearby-doctors-title"
            className="text-md font-bold uppercase tracking-[0.18em] text-[#283C5D]"
          >
            {t("nearbyDoctors")}
          </h2>

          <div className="mt-2 h-px w-16 bg-[#d8bd8d]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {doctors.map((doctor) => (
          <DoctorCards
            key={doctor.id}
            doctor={doctor}
            showDetails
          />
        ))}
      </div>
    </section>
  );
}