import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import DoctorCards from "../UI/DoctorCards";

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
};

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
  doctors: PublicDoctor[];
  hasMore: boolean;
};


function buildPageQuery(filters: DoctorFilters | undefined, page: number, limit: number) {
  const params = new URLSearchParams();

  if (filters?.q) params.set("q", filters.q);
  if (filters?.specialty) params.set("specialty", filters.specialty);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.procedures) params.set("procedures", filters.procedures);
  if (filters?.location) params.set("location", filters.location);
  if (filters?.minRating) params.set("minRating", filters.minRating);

  params.set("page", String(page));
  params.set("limit", String(limit));

  return params.toString();
}

async function getDoctors(
  filters?: DoctorFilters,
  page = 1,
  limit = 10
): Promise<DoctorsResponse> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const params = new URLSearchParams();

  if (filters?.q) params.set("q", filters.q);
  if (filters?.specialty) params.set("specialty", filters.specialty);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.procedures) params.set("procedures", filters.procedures);
  if (filters?.location) params.set("location", filters.location);
  if (filters?.minRating) params.set("minRating", filters.minRating);

  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(
    `${protocol}://${host}/api/public-pages/doctor-profile?${params.toString()}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    return { doctors: [], hasMore: false };
  }

  const data = await res.json();

  if (Array.isArray(data)) {
    return {
      doctors: data,
      hasMore: data.length === limit,
    };
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
  const t = await getTranslations("home.doctors");

  const page = Math.max(Number(filters?.page || "1"), 1);
  const limit = Math.max(Number(filters?.limit || "10"), 1);

  const { doctors, hasMore } = await getDoctors(filters, page, limit);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("list.title"),
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
          {t("list.title")}
        </p>
        <div className="h-px w-16 bg-[#d8bd8d]" />
      </div>

      <p className="hidden text-xs uppercase tracking-[0.25em] text-[#d8bd8d] md:block">
        {t("list.practitionersCount", { count: doctors.length })}
      </p>
    </div>

    {doctors.length === 0 ? (
      <div className="rounded-3xl border border-dashed border-[#d8bd8d]/40 bg-white px-6 py-16 text-center shadow-sm">
        <h3 className="text-xl font-semibold text-[#283C5D]">
          {t("list.noDoctorsTitle")}
        </h3>

        <p className="mt-3 text-sm text-[#283C5D]/60">
          {t("list.noDoctorsDescription")}
        </p>
      </div>
    ) : (
      <>
        <div className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCards key={doctor.id} doctor={doctor} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={`/doctors?${buildPageQuery(filters, page - 1, limit)}`}
              className="rounded-full border border-[#283C5D]/15 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
            >
              {t("list.previous")}
            </Link>
          ) : null}

          <span className="rounded-full bg-[#FAF9F7] px-5 py-2 text-xs font-semibold text-[#283C5D]/70">
            {t("list.page")} {page}
          </span>

          {hasMore ? (
            <Link
              href={`/doctors?${buildPageQuery(filters, page + 1, limit)}`}
              className="rounded-full border border-[#d8bd8d] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white"
            >
              {t("list.next")}
            </Link>
          ) : null}
        </div>
      </>
    )}
  </section>
);
}