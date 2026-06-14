import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Brain, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export default async function WhyPatientsUseEstheticMatch() {
  const t = await getTranslations("home.whyPatientsUseEstheticMatch");

  const features = [
    { icon: Brain, title: t("features.clarity.title"), description: t("features.clarity.description") },
    { icon: Sparkles, title: t("features.match.title"), description: t("features.match.description") },
    { icon: ShieldCheck, title: t("features.trust.title"), description: t("features.trust.description") },
    { icon: MapPin, title: t("features.local.title"), description: t("features.local.description") },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    name: t("seo.name"),
    description: t("seo.description"),
  };

  return (
    <section
      aria-labelledby="why-patients-use-title"
      className="mx-auto w-full max-w-7xl px-6 py-8 md:px-12 lg:px-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="relative overflow-hidden rounded-[2rem] bg-[#061A2D] p-8 text-white shadow-xl md:p-10">
            <Image
              src="/images/home/patients/why-patient-looking.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(53,68,93,1.9),transparent_34%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(53,68,93,1.9),transparent_82%)]" />
          <div className="relative z-10">
            
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
              {t("eyebrow")}
            </p>

            <h2
              id="why-patients-use-title"
              className="text-3xl font-bold leading-tight md:text-5xl"
            >
              {t("title")}
            </h2>

            <p className="mt-6 text-sm leading-7 text-white/78 md:text-base">
              {t("description")}
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm font-semibold text-[#d8bd8d]">
                {t("callout.title")}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {t("callout.description")}
              </p>
            </div>
          </div>
        </article>

        <div className="grid gap-5">
          <article className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-white shadow-xl">
            <Image
              src="/images/home/patients/why-patients-use.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D]/85 via-[#061A2D]/35 to-transparent" />

            <div className="absolute bottom-6 left-6 max-w-sm rounded-3xl border border-white/15 bg-white/15 p-6 text-white backdrop-blur-md">
              <p className="text-xl font-bold leading-tight">
                {t("imageCard.title")}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/78">
                {t("imageCard.description")}
              </p>
            </div>
          </article>

          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F7] text-[#283C5D]">
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
      </div>
    </section>
  );
}