import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import DoctorCards from "@/components/public/UI/DoctorCards";

type PublicDoctor = {
  id: string;
  slug: string;
  name: string;
  specialtyIds: string[];
  avatar: string;
  city: string | null;
  country: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  yearsOfExperience: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  currency: string;
  clinicBanner?: string | null;
};

async function getMostRecentDoctors(): Promise<PublicDoctor[]> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/public-pages/doctor-profile/recent`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function ProfileDisplay() {
  const t          = await getTranslations("home.Home");
  const specialtyT = await getTranslations("specialitiesName");
  const doctors    = await getMostRecentDoctors();

  if (doctors.length === 0) return null;

  // Collect only the specialty IDs actually used by these doctors
  const allSpecialtyIds = [...new Set(doctors.flatMap((d) => d.specialtyIds))];

  const cardTranslations = {
    reviews:     t("reviews"),
    free:        t("free"),
    viewProfile: t("viewProfile"),
    verifiedProfile: t("veriiedDoctors"),
    inClinic:    t("inClinic"),
    online:      t("online"),
  };

  const specialtyTranslations = Object.fromEntries(
    allSpecialtyIds.map((id) => {
      try   { return [id, specialtyT(id)]; }
      catch { return [id, id]; }           
    })
  );

  const jsonLd = {
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
          medicalSpecialty: doctor.specialtyIds.map((id) => specialtyTranslations[id] ?? id),
          image: doctor.avatar,
          address: {
            "@type": "PostalAddress",
            addressLocality: doctor.country,
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
  };

  return (
    <section
      aria-labelledby="nearby-doctors-title"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 md:px-12 lg:px-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

        <Link
          href="/doctors"
          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8bd8d] transition hover:text-[#283C5D]"
        >
          {t("viewAllPractitioners")} →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {doctors.map((doctor) => (
          <DoctorCards
            key={doctor.id}
            doctor={doctor}
            t={cardTranslations}
            specialtyT={specialtyTranslations}
            showDetails={true}
          />
        ))}
      </div>
    </section>
  );
}
