import Image from "next/image";
import { Link } from "@/i18n/navigation";

type CategoryHeroProps = {
  title: string;
  description: string;
  image: string;
  icon: string;
  categoryId: string;
  findDoctorsLabel: string;
};

export default function CategoryHero({
  title,
  description,
  image,
  icon,
  categoryId,
  findDoctorsLabel,
}: CategoryHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#061A2D] px-6 py-24 text-white md:px-12 lg:px-24">
      <Image
        src={image}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-45"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D] via-[#061A2D]/80 to-[#061A2D]/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(216,189,141,0.24),transparent_35%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
          <Image src={icon} alt="" width={36} height={36} />
        </div>

        <h1 className="max-w-4xl text-4xl font-bold text-[#d8bd8d] uppercase leading-[0.95] md:text-6xl">
          {title}
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
          {description}
        </p>

        <Link
          href={`/doctors?category=${categoryId}`}
          className="mt-9 inline-flex rounded-full bg-[#d8bd8d] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#061A2D] transition hover:bg-[#f4e4c6]"
        >
          {findDoctorsLabel}
        </Link>
      </div>
    </section>
  );
}