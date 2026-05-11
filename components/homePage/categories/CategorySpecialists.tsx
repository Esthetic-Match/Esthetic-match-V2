import { SPECIALTY_CATEGORY_MAP } from "@/components/signup/helper/specialtyCategoryMap";
import { Link } from "@/i18n/navigation";

type CategorySpecialistsProps = {
  categoryId: string;
  title: string;
  specialtyLabel: (id: string) => string;
};

export default function CategorySpecialists({
  categoryId,
  title,
  specialtyLabel,
}: CategorySpecialistsProps) {
  const specialists = Object.entries(SPECIALTY_CATEGORY_MAP)
    .filter(([, categories]) => categories.includes(categoryId))
    .map(([specialty]) => specialty);

  if (specialists.length === 0) return null;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-lg md:p-8">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]">
        {title}
      </h2>

      <div className="mt-5 flex flex-wrap gap-3 justify-center">
        {specialists.map((specialty) => (
          <Link
            key={specialty}
            href={`/doctors?specialty=${specialty}`}
            className="group relative flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white 
            px-4 py-5 text-center shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d8bd8d]/70 hover:shadow-lg active:scale-[0.98] hover:bg-[#283C5D] hover:text-white"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition ">
              <img
                src={`/images/dashboard/specialties/${specialty}.svg`}
                alt={specialtyLabel(specialty)}
                className="h-8 w-8 object-contain transition group-hover:brightness-0 group-hover:invert"
              />
            </div>

            <span className="text-sm font-semibold ">
              {specialtyLabel(specialty)}
            </span>

            <span className="mt-1 text-xs leading-snug text-gold">
              View doctors
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}