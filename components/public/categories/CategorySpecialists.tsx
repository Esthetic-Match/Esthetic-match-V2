"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";

type CategorySpecialistsProps = {
  title: string;
  specialists: {
    id: string;
    label: string;
  }[];
  viewDoctorsLabel: string;
};

export default function CategorySpecialists({
  title,
  specialists,
  viewDoctorsLabel,
}: CategorySpecialistsProps) {
  if (specialists.length === 0) return null;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-lg md:p-8">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]">
        {title}
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {specialists.map((specialty) => (
          <Link
            key={specialty.id}
            href={`/doctors?specialty=${specialty.id}`}
            className="group relative flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white px-4 py-5 text-center shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d8bd8d]/70 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F7] transition group-hover:bg-[#283C5D]">
              <Image
                src={`/images/dashboard/specialties/${specialty.id}.svg`}
                alt={specialty.label}
                width={32}
                height={32}
                className="h-8 w-8 object-contain transition group-hover:brightness-0 group-hover:invert"
              />
            </div>

            <span className="text-sm font-semibold text-[#283C5D]">
              {specialty.label}
            </span>

            <span className="mt-1 text-xs leading-snug text-[#283C5D]/50">
              {viewDoctorsLabel}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}