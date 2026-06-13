import { getTranslations } from "next-intl/server";
import {
  BarChart3,
  CalendarSearch,
  BadgeCheck,
  UsersRound,
} from "lucide-react";

export default async function WhyDoctorsShouldJoin() {
  const t = await getTranslations("home.whyDoctorsShouldJoin");

  const features = [
    {
      icon: BarChart3,
      title: t("features.analytics.title"),
      description: t("features.analytics.description"),
    },
    {
      icon: UsersRound,
      title: t("features.matching.title"),
      description: t("features.matching.description"),
    },
    {
      icon: BadgeCheck,
      title: t("features.badge.title"),
      description: t("features.badge.description"),
    },
    {
      icon: CalendarSearch,
      title: t("features.scheduling.title"),
      description: t("features.scheduling.description"),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    name: t("seo.name"),
    description: t("seo.description"),
  };

  return (
    <section
      aria-labelledby="why-doctors-join-title"
      className="mx-auto w-full max-w-7xl px-6 py-16 md:px-12 lg:px-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-5">
        <article className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#061A2D] p-8 text-white shadow-xl md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D] via-[#061A2D]/80 to-[#061A2D]/25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(216,189,141,0.25),transparent_35%)]" />

          <div className="relative z-10 max-w-4xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
              {t("eyebrow")}
            </p>

            <h2
              id="why-doctors-join-title"
              className="max-w-4xl text-3xl font-bold leading-tight md:text-5xl"
            >
              {t("title")}
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
              {t("description")}
            </p>
          </div>
        </article>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#283C5D] text-[#d8bd8d]">
                  <Icon size={23} aria-hidden="true" />
                </div>

                <h3 className="text-base font-bold text-[#283C5D]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#283C5D]/60">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}