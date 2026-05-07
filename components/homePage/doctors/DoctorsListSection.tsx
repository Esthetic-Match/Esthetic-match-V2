import { Link } from "@/i18n/navigation";
import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type DoctorCardData = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  tags: string[];
  price: string;
};

type DoctorsSectionProps = {
  doctors: DoctorCardData[];
  title?: string;
};

export default function DoctorsListSection({
  doctors,
  title,
}: DoctorsSectionProps) {
  const t = useTranslations("home.doctors");

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-4">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-[#283C5D]">
            {title ?? t("list.title")}
          </p>
          <div className="h-px w-16 bg-[#d8bd8d]" />
        </div>

        <p className="hidden text-xs uppercase tracking-[0.25em] text-[#d8bd8d] md:block">
          {t("list.practitionersCount", { count: doctors.length })}
        </p>
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <article
            key={doctor.id}
            className="group overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#283C5D]/10">
                <Image
                  src={doctor.image}
                  alt={t("list.doctorImageAlt", {
                    name: doctor.name,
                    specialty: doctor.specialty,
                  })}
                  fill
                  sizes="112px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold leading-tight text-[#283C5D]">
                      {doctor.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#283C5D]/60">
                      {doctor.specialty}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={t("list.saveDoctor", { name: doctor.name })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8bd8d]/70 text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white"
                  >
                    <Heart size={15} />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs text-[#283C5D]/70">
                  <Star size={14} className="fill-[#d8bd8d] text-[#d8bd8d]" />
                  <span>{doctor.rating}</span>
                  <span>
                    {t("list.reviews", { count: doctor.reviews })}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs text-[#283C5D]/60">
                  <MapPin size={13} />
                  <span>{doctor.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#FAF9F7] px-3 py-1 text-xs text-[#283C5D]/70"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
              <p className="text-xs text-[#283C5D]/60">
                {t("list.from")}{" "}
                <span className="font-semibold text-[#283C5D]">
                  {doctor.price}
                </span>
              </p>

              <Link
                href={`/doctors/${doctor.id}`}
                className="rounded-full border border-[#d8bd8d] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white"
              >
                {t("list.viewProfile")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}