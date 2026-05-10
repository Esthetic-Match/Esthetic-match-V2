import { Link } from "@/i18n/navigation";
import { Heart, MapPin, Star, Search } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

type PublicDoctor = {
  id: string;
  name: string;
  specialtyIds: string;
  googleRating: string;
  googleReviewCount: string;
  country: string;
  avatar: string;
};

async function getDoctors(filters?: {
  q?: string;
  specialty?: string;
  procedure?: string;
  location?: string;
  minRating?: string;
}): Promise<PublicDoctor[]> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const params = new URLSearchParams();

  if (filters?.q) params.set("q", filters.q);
  if (filters?.specialty) params.set("specialty", filters.specialty);
  if (filters?.procedure) params.set("procedure", filters.procedure);
  if (filters?.location) params.set("location", filters.location);
  if (filters?.minRating) params.set("minRating", filters.minRating);

  const queryString = params.toString();

  const res = await fetch(
    `${protocol}://${host}/api/public-pages/doctor-profile${
      queryString ? `?${queryString}` : ""
    }`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function DoctorsListSection({
  filters,
}: {
  filters?: {
    q?: string;
    specialty?: string;
    procedure?: string;
    location?: string;
    minRating?: string;
  };
}) {
  const t = await getTranslations("home.doctors");
  const doctors = await getDoctors(filters);



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
          url: `/doctors/${doctor.id}`,
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
        <div className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {

        const rating = Number(doctor.googleRating || 0);
        const reviews = Number(doctor.googleReviewCount || 0);
        const specialty = formatLabel(doctor.specialtyIds);
        const tags = doctor.specialtyIds
          ? doctor.specialtyIds.split(",").slice(0, 3).map(formatLabel)
          : [];

        return (
          <article
            key={doctor.id}
            itemScope
            itemType="https://schema.org/Physician"
            className="group overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#283C5D]/10">
                <Image
                  src={doctor.avatar}
                  alt={t("list.doctorImageAlt", {
                    name: doctor.name,
                    specialty,
                  })}
                  fill
                  sizes="112px"
                  itemProp="image"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2
                      itemProp="name"
                      className="text-sm font-semibold leading-tight text-[#283C5D]"
                    >
                      {doctor.name}
                    </h2>

                    <p
                      itemProp="medicalSpecialty"
                      className="mt-1 text-xs text-[#283C5D]/60"
                    >
                      {specialty}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={t("list.saveDoctor", {
                      name: doctor.name,
                    })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8bd8d]/70 text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white"
                  >
                    <Heart size={15} />
                  </button>
                </div>

                {rating > 0 && reviews > 0 ? (
                  <div
                    itemProp="aggregateRating"
                    itemScope
                    itemType="https://schema.org/AggregateRating"
                    className="mt-3 flex items-center gap-1 text-xs text-[#283C5D]/70"
                  >
                    <Star
                      size={14}
                      className="fill-[#d8bd8d] text-[#d8bd8d]"
                    />

                    <span itemProp="ratingValue">{rating}</span>
                    <meta itemProp="reviewCount" content={String(reviews)} />

                    <span>{t("list.reviews", { count: reviews })}</span>
                  </div>
                ) : null}

                <div className="mt-2 flex items-center gap-1 text-xs text-[#283C5D]/60">
                  <MapPin size={13} />
                  <span itemProp="address">{doctor.country}</span>
                </div>
              </div>
            </div>

            {tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#FAF9F7] px-3 py-1 text-xs text-[#283C5D]/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
              <p className="text-xs text-[#283C5D]/60">
                {t("list.from")}{" "}
                <span className="font-semibold text-[#283C5D]">
                  {t("list.priceOnRequest")}
                </span>
              </p>

              <Link
                href={`/doctors/${doctor.id}`}
                itemProp="url"
                className="rounded-full border border-[#d8bd8d] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white"
              >
                {t("list.viewProfile")}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  )}
</section>
  );
}