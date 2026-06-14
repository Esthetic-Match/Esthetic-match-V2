import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { NavBarMain } from "@/components/NavbarMain";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isFrench = locale === "fr";

  return {
    title: isFrench
      ? "FAQ Médecine Esthétique | Esthetic Match"
      : "Aesthetic Medicine FAQ | Esthetic Match",

    description: isFrench
      ? "Découvrez les réponses aux questions fréquentes sur la médecine esthétique, les injections, les lasers, les peelings et les traitements esthétiques."
      : "Find answers to the most common questions about aesthetic medicine, injections, lasers, peels, and cosmetic treatments.",

    alternates: {
      canonical: `/${locale}/faq`,
    },

    openGraph: {
      title: isFrench
        ? "FAQ Médecine Esthétique | Esthetic Match"
        : "Aesthetic Medicine FAQ | Esthetic Match",

      description: isFrench
        ? "Toutes les réponses aux questions fréquentes sur les traitements esthétiques."
        : "Everything you need to know about aesthetic treatments and procedures.",

      type: "website",
    },
  };
}

export default async function FAQPage() {

  const t = await getTranslations("faq.faq");

  const faqCategories = [
    {
      key: "general",
      items: [
        "01",
        "02",
        "03",
        "04",
        "05",
      ],
    },
    {
      key: "injections",
      items: ["06", "07", "08", "09", "10"],
    },
    {
      key: "lasers",
      items: ["11", "12", "13", "14"],
    },
    {
      key: "comfort",
      items: ["15", "16", "17"],
    },
    {
      key: "contraindications",
      items: ["18", "19", "20"],
    },
    {
      key: "specialCases",
      items: ["21", "22", "23", "24"],
    },
  ];

  const structuredData = faqCategories.flatMap((category) =>
    category.items.map((id) => ({
      "@type": "Question",
      name: t(`${id}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`${id}.answer`),
      },
    }))
  );

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <NavBarMain />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: structuredData,
          }),
        }}
      />

      <section className="relative overflow-hidden border-b border-[#283C5D]/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(216,189,141,0.18),transparent_60%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-32 text-center md:px-10">
          <div className="mb-5 inline-flex items-center rounded-full border border-[#283C5D]/10 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#283C5D]/70 backdrop-blur-sm">
            {t("eyebrow")}
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-[#283C5D] md:text-6xl">
            {t("title")}
          </h1>

          <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#283C5D]/70 md:text-lg">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <div className="space-y-16">
          {faqCategories.map((category) => (
            <div key={category.key}>
              <div className="mb-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#283C5D]/10" />

                <h2 className="shrink-0 text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]/60">
                  {t(`categories.${category.key}`)}
                </h2>

                <div className="h-px flex-1 bg-[#283C5D]/10" />
              </div>

              <div className="grid gap-5">
                {category.items.map((id) => (
                  <details
                    key={id}
                    className="group overflow-hidden rounded-3xl border border-[#283C5D]/10 bg-white shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-all duration-300 hover:border-[#d8bd8d]/60"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-6 md:px-8">
                      <div className="flex items-start gap-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-sm font-semibold text-white">
                          {id}
                        </div>

                        <div>
                          <h3 className="text-left text-lg font-semibold leading-snug text-[#283C5D] md:text-xl">
                            {t(`${id}.question`)}
                          </h3>
                        </div>
                      </div>

                      <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-[#283C5D]/50 transition-transform duration-300 group-open:rotate-180" />
                    </summary>

                    <div className="border-t border-[#283C5D]/8 px-6 py-6 md:px-8">
                      <p className="max-w-4xl text-sm leading-8 text-[#283C5D]/75 md:text-base">
                        {t(`${id}.answer`)}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-[#283C5D] px-8 py-14 text-white md:px-14">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#d8bd8d]/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
              {t("cta.eyebrow")}
            </p>

            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              {t("cta.title")}
            </h2>

            <p className="mt-5 text-base leading-8 text-white/70 md:text-lg">
              {t("cta.description")}
            </p>
            <div className="mt-6">
                <Link href="/doctors"
                  className="rounded-full border border-white/25 px-7 py-3 text-center bg-[#d8bd8d] text-sm font-semibold text-black 
                  transition hover:bg-[#c9a87a] active:scale-[0.98]"
                >
                  {t("CTA")}
                </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}