import { getTranslations } from "next-intl/server";

import AISearchBar from "../UI/AISearchBar";
import HeroIntro from "../UI/HeroIntro";

export default async function HomeSection() {
  const t =
    await getTranslations(
      "home.Home",
    );

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
          <HeroIntro
            eyebrow={t(
              "heroEyebrow",
            )}
            line1={t(
              "heroTitleLine1",
            )}
            line2={t(
              "heroTitleLine2",
            )}
            line3={t(
              "heroTitleLine3",
            )}
          />

          <div className="mt-8 w-full max-w-4xl">
            <AISearchBar />
          </div>
        </div>
      </div>
    </section>
  );
}