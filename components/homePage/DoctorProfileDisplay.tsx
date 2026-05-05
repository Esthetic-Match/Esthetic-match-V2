import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

const doctors = [
  {
    id: "alexandre-martin",
    name: "Dr. Alexandre Martin",
    specialty: "Médecine esthétique",
    rating: "4.9",
    reviews: "128",
    location: "Paris, France",
    image: "/images/doctors/doctor-1.jpg",
  },
  {
    id: "sophie-leroy",
    name: "Dr. Sophie Leroy",
    specialty: "Chirurgie du visage",
    rating: "4.8",
    reviews: "96",
    location: "Lyon, France",
    image: "/images/doctors/doctor-2.jpg",
  },
  {
    id: "julien-belin",
    name: "Dr. Julien Belin",
    specialty: "Chirurgie du corps",
    rating: "4.9",
    reviews: "147",
    location: "Marseille, France",
    image: "/images/doctors/doctor-3.jpg",
  },
  {
    id: "camille-roche",
    name: "Dr. Camille Roche",
    specialty: "Médecine esthétique",
    rating: "4.7",
    reviews: "83",
    location: "Bordeaux, France",
    image: "/images/doctors/doctor-4.jpg",
  },
];

export default async function ProfileDisplay() {
  const t = await getTranslations("home.Home");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("nearbyDoctors"),
    itemListElement: doctors.map((doctor, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Physician",
        name: doctor.name,
        medicalSpecialty: doctor.specialty,
        image: doctor.image,
        address: {
          "@type": "PostalAddress",
          addressLocality: doctor.location,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: doctor.rating,
          reviewCount: doctor.reviews,
        },
      },
    })),
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
          <article
            key={doctor.id}
            itemScope
            itemType="https://schema.org/Physician"
            className="relative flex overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Link
              href={`/doctors/${doctor.id}`}
              className="absolute inset-0 z-10"
              aria-label={`${t("viewProfile")} ${doctor.name}`}
            />

            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#FAF9F7]">
              <Image
                src={doctor.image}
                alt={`${doctor.name}, ${doctor.specialty}`}
                fill
                sizes="96px"
                className="object-cover"
                itemProp="image"
              />
            </div>

            <div className="relative z-20 flex flex-1 flex-col px-3">
              <div className="flex justify-between gap-2">
                <div>
                  <h3
                    itemProp="name"
                    className="text-xs font-bold text-[#283C5D]"
                  >
                    {doctor.name}
                  </h3>

                  <p
                    itemProp="medicalSpecialty"
                    className="mt-1 text-[10px] font-medium text-[#283C5D]/55"
                  >
                    {doctor.specialty}
                  </p>
                </div>

                <button
                  type="button"
                  className="relative z-30 flex h-6 w-6 items-center justify-center rounded-full border border-[#d8bd8d]/50 text-[#d8bd8d]"
                  aria-label={t("saveDoctor")}
                >
                  <Heart size={13} />
                </button>
              </div>

              <div
                itemProp="aggregateRating"
                itemScope
                itemType="https://schema.org/AggregateRating"
                className="mt-2 flex items-center gap-1 text-[10px] text-[#283C5D]/60"
              >
                <Star size={11} className="fill-[#d8bd8d] text-[#d8bd8d]" />
                <span itemProp="ratingValue">{doctor.rating}</span>
                <span>
                  ({doctor.reviews} {t("reviews")})
                </span>
                <meta itemProp="reviewCount" content={doctor.reviews} />
              </div>

              <p
                itemProp="address"
                className="mt-1 text-[10px] text-[#283C5D]/45"
              >
                {doctor.location}
              </p>

              <div className="mt-auto pt-3">
                <span className="inline-flex rounded-full border border-[#d8bd8d]/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#d8bd8d]">
                  {t("viewProfile")}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}