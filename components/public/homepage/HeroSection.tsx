import { getTranslations } from "next-intl/server";
import HomeDoctorSearchBar from "@/components/public/UI/HomeSearchBar";

export default async function HomeSection() {
  const t = await getTranslations("home.Home");

  return (
  <section className="relative min-h-[720px] overflow-hidden bg-[#07182A] text-white">
    <div className="pointer-events-none absolute inset-0">
      <video
        className="h-full w-full object-cover object-start"
        src="/videos/hero-video.mp4"
        poster="/images/hero-bg.png"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>

    <div className="absolute inset-0 bg-[#07182A]/45" />

    <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center justify-center px-6 pt-28 md:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <p className="mb-4 text-sm font-light uppercase tracking-[0.25em] text-[#d8bd8d]">
          {t("heroEyebrow")}
        </p>

        <h1 className="max-w-3xl text-4xl font-light uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
          {t("heroTitleLine1")}
          <br />
          <span>{t("heroTitleLine2")}</span>
          <br />
          <span className="text-[#d8bd8d]">{t("heroTitleLine3")}</span>
        </h1>

        <div className="mt-8 w-full max-w-3xl">
          <HomeDoctorSearchBar />
        </div>
      </div>
    </div>
  </section>
  );
}