import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

type DoctorCardProps = {
  doctor: {
    id: string;
    name: string;
    specialtyIds: string;
    googleRating: string;
    googleReviewCount: string;
    country: string;
    avatar: string;
  };
};

export default async function DoctorCards( doctor: DoctorCardProps ){
    const t = await getTranslations("home.Home");

    return(
          <article
            key={doctor.doctor.id}
            itemScope
            itemType="https://schema.org/Physician"
            className="relative flex overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
          >
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#FAF9F7]">
              <Image
                src={
                  doctor.doctor.avatar?.trim()
                    ? doctor.doctor.avatar
                    : "/images/default-doctor.png"
                }
                alt={`${doctor.doctor.name}, ${doctor.doctor.specialtyIds}`}
                fill
                sizes="96px"
                className="object-cover"
                itemProp="image"
              />
            </div>
        
            <div className="flex flex-1 flex-col px-3">
              <div className="flex justify-between gap-2">
                <div>
                  <h3
                    itemProp="name"
                    className="text-xs font-bold text-[#283C5D]"
                  >
                    {doctor.doctor.name}
                  </h3>
        
                  <p
                    itemProp="medicalSpecialty"
                    className="mt-1 text-[10px] font-medium text-[#283C5D]/55"
                  >
                    {doctor.doctor.specialtyIds}
                  </p>
                </div>
      
              </div>
            
            {doctor.doctor.googleReviewCount &&
                doctor.doctor.googleRating ? (
                  <div
                    itemProp="aggregateRating"
                    itemScope
                    itemType="https://schema.org/AggregateRating"
                    className="mt-2 flex items-center gap-1 text-[10px] text-[#283C5D]/60"
                  >
                    <Star
                      size={11}
                      className="fill-[#d8bd8d] text-[#d8bd8d]"
                    />

                    <span itemProp="ratingValue">
                      {doctor.doctor.googleRating}
                    </span>
                
                    <span>
                      ({doctor.doctor.googleReviewCount} {t("reviews")})
                    </span>
                
                    <meta
                      itemProp="reviewCount"
                      content={doctor.doctor.googleReviewCount}
                    />
                  </div>
            ) : null}
        
              <p
                itemProp="address"
                className="mt-1 text-[10px] text-[#283C5D]/45"
              >
                {doctor.doctor.country}
              </p>
        
              <div className="mt-auto pt-3">
                <Link
                  href={`/doctors/${doctor.doctor.id}`}
                  className="inline-flex rounded-full border border-[#d8bd8d]/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#d8bd8d] transition hover:bg-[#d8bd8d] hover:text-white active:scale-[0.98]"
                >
                  {t("viewProfile")}
                </Link>
              </div>
            </div>
          </article>
    )
}