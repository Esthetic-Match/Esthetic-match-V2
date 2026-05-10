import Image from "next/image";

type ClinicBannerProps = {
  clinicBanner: string | null;
  clinicName: string;
};

const fallbackBanner = "/images/fallback/blue-bg.png";

export default function ClinicBanner({
  clinicBanner,
  clinicName,
}: ClinicBannerProps) {
  const bannerSrc =
    clinicBanner && clinicBanner.trim().length > 0
      ? clinicBanner
      : fallbackBanner;

  return (
    <section
      aria-label={`${clinicName} clinic banner`}
      className="relative h-56 w-full overflow-hidden  bg-[#283C5D] md:h-72"
    >
      <Image
        src={bannerSrc}
        alt={`${clinicName} clinic banner`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </section>
  );
}