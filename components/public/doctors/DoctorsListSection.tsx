import {
  getLocale,
  getTranslations,
} from "next-intl/server";

import { headers } from "next/headers";

import DoctorsInfiniteList from "./DoctorsInfiniteList";

import type {
  DoctorCardData,
} from "../UI/DoctorCards";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type DoctorFilters = {
  q?: string;
  specialty?: string;
  category?: string;
  procedures?: string;
  location?: string;
  minRating?: string;
  topThreeOnly?: string;
  maxInClinicPrice?: string;
  maxOnlineConsultationPrice?: string;
};

type DoctorsResponse = {
  doctors: DoctorCardData[];
  hasMore: boolean;
};

/* ═════════════════════════════════════
   FETCH DOCTORS
═════════════════════════════════════ */

async function getDoctors(
  filters: DoctorFilters | undefined,
  locale: string,
  page = 1,
  limit = 10,
): Promise<DoctorsResponse> {
  const headersList =
    await headers();

  const host =
    headersList.get("host");

  const protocol =
    process.env.NODE_ENV ===
    "development"
      ? "http"
      : "https";

  if (!host) {
    return {
      doctors: [],
      hasMore: false,
    };
  }

  const params =
    new URLSearchParams();

  /* ─────────────────────────────────
     FILTERS
  ───────────────────────────────── */

  if (filters?.q) {
    params.set(
      "q",
      filters.q,
    );
  }

  if (filters?.specialty) {
    params.set(
      "specialty",
      filters.specialty,
    );
  }

  if (filters?.category) {
    params.set(
      "category",
      filters.category,
    );
  }

  if (filters?.procedures) {
    params.set(
      "procedures",
      filters.procedures,
    );
  }

  if (filters?.location) {
    params.set(
      "location",
      filters.location,
    );
  }

  if (filters?.minRating) {
    params.set(
      "minRating",
      filters.minRating,
    );
  }

  if (
    filters?.topThreeOnly
  ) {
    params.set(
      "topThreeOnly",
      filters.topThreeOnly,
    );
  }

  if (
    filters?.maxInClinicPrice
  ) {
    params.set(
      "maxInClinicPrice",
      filters.maxInClinicPrice,
    );
  }

  if (
    filters?.maxOnlineConsultationPrice
  ) {
    params.set(
      "maxOnlineConsultationPrice",
      filters.maxOnlineConsultationPrice,
    );
  }

  /* ─────────────────────────────────
     LOCALIZATION

     The API now resolves catalogue names
     directly from the DB.
  ───────────────────────────────── */

  params.set(
    "locale",
    locale,
  );

  params.set(
    "page",
    String(page),
  );

  params.set(
    "limit",
    String(limit),
  );

  /* ─────────────────────────────────
     REQUEST
  ───────────────────────────────── */

  const res = await fetch(
    `${protocol}://${host}/api/public-pages/doctor-profile?${params.toString()}`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!res.ok) {
    return {
      doctors: [],
      hasMore: false,
    };
  }

  const data =
    (await res.json()) as unknown;

  /*
   * Keep backwards compatibility in case an
   * older deployment returned a raw array.
   */
  if (Array.isArray(data)) {
    return {
      doctors:
        data as DoctorCardData[],

      hasMore:
        data.length ===
        limit,
    };
  }

  if (
    typeof data !== "object" ||
    data === null
  ) {
    return {
      doctors: [],
      hasMore: false,
    };
  }

  const response =
    data as {
      doctors?: unknown;
      hasMore?: unknown;
    };

  return {
    doctors:
      Array.isArray(
        response.doctors,
      )
        ? (response.doctors as DoctorCardData[])
        : [],

    hasMore:
      response.hasMore ===
      true,
  };
}

/* ═════════════════════════════════════
   COMPONENT
═════════════════════════════════════ */

export default async function DoctorsListSection({
  filters,
}: {
  filters?: DoctorFilters;
}) {
  const locale =
    await getLocale();

  const listT =
    await getTranslations(
      "home.doctors",
    );

  const limit = 12;

  const {
    doctors,
    hasMore,
  } = await getDoctors(
    filters,
    locale,
    1,
    limit,
  );

  /* ═══════════════════════════════════
     STRUCTURED DATA

     Specialty names now come from the DB,
     not specialty IDs / JSON translations.
  ═══════════════════════════════════ */

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "ItemList",

    name:
      listT(
        "list.title",
      ),

    numberOfItems:
      doctors.length,

    itemListElement:
      doctors.map(
        (
          doctor,
          index,
        ) => {
          const hasRating =
            doctor.googleRating !==
              null &&
            doctor.googleReviewCount !==
              null &&
            doctor.googleReviewCount >
              0;

          return {
            "@type":
              "ListItem",

            position:
              index + 1,

            item: {
              "@type":
                "Physician",

              name:
                doctor.name,

              /*
               * Proper localized specialty
               * names from the database.
               */
              medicalSpecialty:
                doctor.specialties.map(
                  (
                    specialty,
                  ) =>
                    specialty.name,
                ),

              image:
                doctor.avatar,

              url:
                `/${locale}/doctors/${doctor.slug}`,

              address: {
                "@type":
                  "PostalAddress",

                ...(doctor.city
                  ? {
                      addressLocality:
                        doctor.city,
                    }
                  : {}),

                ...(doctor.country
                  ? {
                      addressCountry:
                        doctor.country,
                    }
                  : {}),
              },

              ...(hasRating
                ? {
                    aggregateRating:
                      {
                        "@type":
                          "AggregateRating",

                        ratingValue:
                          doctor.googleRating,

                        reviewCount:
                          doctor.googleReviewCount,
                      },
                  }
                : {}),
            },
          };
        },
      ),
  };

  /* ═══════════════════════════════════
     INFINITE LIST KEY
  ═══════════════════════════════════ */

  const doctorsListKey =
    JSON.stringify({
      locale,

      q:
        filters?.q ??
        "",

      specialty:
        filters
          ?.specialty ??
        "",

      category:
        filters
          ?.category ??
        "",

      procedures:
        filters
          ?.procedures ??
        "",

      location:
        filters
          ?.location ??
        "",

      minRating:
        filters
          ?.minRating ??
        "",

      topThreeOnly:
        filters
          ?.topThreeOnly ??
        "",

      maxInClinicPrice:
        filters
          ?.maxInClinicPrice ??
        "",

      maxOnlineConsultationPrice:
        filters
          ?.maxOnlineConsultationPrice ??
        "",

      limit,
    });

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  return (
    <section
      aria-labelledby="doctors-list-title"
      className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-4"
    >
      {/* Structured data */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd,
            ),
        }}
      />

      {/* Header */}

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p
            id="doctors-list-title"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-[#283C5D]"
          >
            {listT(
              "list.title",
            )}
          </p>

          <div className="h-px w-16 bg-[#d8bd8d]" />
        </div>
      </div>

      {/* Empty */}

      {doctors.length ===
      0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8bd8d]/40 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-[#283C5D]">
            {listT(
              "list.noDoctorsTitle",
            )}
          </h3>

          <p className="mt-3 text-sm text-[#283C5D]/60">
            {listT(
              "list.noDoctorsDescription",
            )}
          </p>
        </div>
      ) : (
        <DoctorsInfiniteList
          key={
            doctorsListKey
          }
          initialDoctors={
            doctors
          }
          initialHasMore={
            hasMore
          }
          filters={
            filters
          }
          limit={
            limit
          }
          locale={
            locale
          }
        />
      )}
    </section>
  );
}