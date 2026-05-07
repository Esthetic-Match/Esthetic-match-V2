import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomeSection() {
  const t = await getTranslations("home.Home");

  return (
    <section className="relative min-h-[720px] overflow-hidden bg-[#07182A] text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[#07182A] via-[#07182A]/75 to-[#07182A]/10" />
      <Image
        src="/images/hero-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-start"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07182A] via-[#07182A]/30 to-[#07182A]/50" />

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-6 pt-28 md:px-12 lg:px-16">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#d8bd8d]">
            {t("heroEyebrow")}
          </p>

          <h1 className="max-w-2xl text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            {t("heroTitleLine1")}
            <br />
            <span className="text-[#d8bd8d]">{t("heroTitleLine2")}</span>
            <br />
            <span className="text-[#d8bd8d]">{t("heroTitleLine3")}</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            {t("heroDescription")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up"
              className="rounded-full bg-[#d8bd8d] px-7 py-3 text-center text-sm font-semibold text-[#07182A] transition hover:bg-[#f4e4c6] active:scale-[0.98]"
            >
              {t("heroPrimaryCta")}
            </Link>

            <Link href="/sign-up"
              className="rounded-full border border-white/25 px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              {t("heroSecondaryCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}