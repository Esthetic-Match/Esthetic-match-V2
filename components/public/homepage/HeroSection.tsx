import { getTranslations } from "next-intl/server";
import HomeDoctorSearchBar from "@/components/public/UI/HomeSearchBar";

export default async function HomeSection() {
  const t = await getTranslations("home.Home");

  return (
  <section className="relative h-svh overflow-hidden bg-[#07182A] text-white">
    <div className="pointer-events-none absolute inset-0">
      <video
        className="
          pointer-events-none h-full w-full object-cover object-start
          [&::-webkit-media-controls]:hidden
          [&::-webkit-media-controls-enclosure]:hidden
          [&::-webkit-media-controls-panel]:hidden
          [&::-webkit-media-controls-play-button]:hidden
          [&::-webkit-media-controls-start-playback-button]:hidden
        "
        src="/videos/hero-video.mp4"
        poster="/images/hero-bg.png"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>

    <div className="absolute inset-0 bg-[#07182A]/55" />

    <div className="relative z-10 flex h-svh w-full items-center justify-center px-6 md:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <p className="mb-4 text-sm font-light uppercase tracking-[0.25em] text-[#d8bd8d]">
          {t("heroEyebrow")}
        </p>
      
        <h1 className="w-full max-w-5xl text-4xl font-light uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
          {t("heroTitleLine1")}
          <span>{t("heroTitleLine2")}</span>
          <br />
          <span className="text-[#d8bd8d]">{t("heroTitleLine3")}</span>
        </h1>
      
        <div className="mt-8 w-full max-w-4xl">
          <HomeDoctorSearchBar />
        </div>
      </div>
    </div>
  </section>
  );
}