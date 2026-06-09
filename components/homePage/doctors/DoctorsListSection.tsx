import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import DoctorsInfiniteList from "./DoctorsInfiniteList";
import type { DoctorCardData } from "../UI/DoctorCards";



type DoctorFilters = {
  q?: string;
  specialty?: string;
  category?: string;
  procedures?: string;
  location?: string;
  minRating?: string;
  page?: string;
  limit?: string;
};

type DoctorsResponse = {
  doctors: DoctorCardData[];
  hasMore: boolean;
};

async function getDoctors(
  filters?: DoctorFilters,
  page = 1,
  limit = 10
): Promise<DoctorsResponse> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const params = new URLSearchParams();
  if (filters?.q)          params.set("q", filters.q);
  if (filters?.specialty)  params.set("specialty", filters.specialty);
  if (filters?.category)   params.set("category", filters.category);
  if (filters?.procedures) params.set("procedures", filters.procedures);
  if (filters?.location)   params.set("location", filters.location);
  if (filters?.minRating)  params.set("minRating", filters.minRating);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(
    `${protocol}://${host}/api/public-pages/doctor-profile?${params.toString()}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return { doctors: [], hasMore: false };

  const data = await res.json();

  if (Array.isArray(data)) {
    return { doctors: data, hasMore: data.length === limit };
  }

  return {
    doctors: Array.isArray(data.doctors) ? data.doctors : [],
    hasMore: Boolean(data.hasMore),
  };
}

export default async function DoctorsListSection({
  filters,
}: {
  filters?: DoctorFilters;
}) {
  const t        = await getTranslations("home.Home");
  const listT    = await getTranslations("home.doctors");
  const specialtyT = await getTranslations("specialitiesName");

  const limit = 12;
  const { doctors, hasMore } = await getDoctors(filters, 1, limit);

  // Serialize card translations into a plain object (safe to cross the server→client boundary)
  const cardTranslations = {
    reviews:     t("reviews"),
    free:        t("free"),
    viewProfile: t("viewProfile"),
  };

const allSpecialtyIds = [...new Set(doctors.flatMap((d) => d.specialtyIds))];

const specialtyTranslations = Object.fromEntries(
  allSpecialtyIds.map((id) => {
    try   { return [id, specialtyT(id)]; }
    catch { return [id, id]; }
  })
);


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listT("list.title"),
    numberOfItems: doctors.length,
    itemListElement: doctors.map((doctor, index) => {
      const hasRating = doctor.googleRating && doctor.googleReviewCount;
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Physician",
          name: doctor.name,
          medicalSpecialty: doctor.specialtyIds,
          image: doctor.avatar,
          url: `/doctors/${doctor.slug}`,
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
      aria-labelledby="doctors-list-title"
      className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-4"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p
            id="doctors-list-title"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-[#283C5D]"
          >
            {listT("list.title")}
          </p>
          <div className="h-px w-16 bg-[#d8bd8d]" />
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8bd8d]/40 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-[#283C5D]">
            {listT("list.noDoctorsTitle")}
          </h3>
          <p className="mt-3 text-sm text-[#283C5D]/60">
            {listT("list.noDoctorsDescription")}
          </p>
        </div>
      ) : (
        <DoctorsInfiniteList
          initialDoctors={doctors}
          initialHasMore={hasMore}
          filters={filters}
          limit={limit}
          t={cardTranslations}
          specialtyT={specialtyTranslations}
        />
      )}
    </section>
  );
}
