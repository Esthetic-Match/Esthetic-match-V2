import {
  ArrowRight,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PatientDashboard() {
  const t = useTranslations("patientDashboard");

  return (
    <main className="min-h-screen bg-[#FAF9F7] p-6 md:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white px-6 py-10 shadow-[0_24px_70px_rgba(40,60,93,0.08)] md:px-10 md:py-14 lg:px-14">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#D8BD8D]/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#283C5D]/5 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8BD8D]/40 bg-[#FAF2DE] px-4 py-2">
                <Sparkles
                  size={15}
                  className="text-[#D8BD8D]"
                  aria-hidden="true"
                />

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#283C5D]">
                  {t("eyebrow")}
                </span>
              </div>

              <h1 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#283C5D] md:text-4xl lg:text-5xl">
                {t("title")}
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#283C5D]/60 md:text-base">
                {t("description")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/doctors"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#283C5D] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#283C5D]/15 transition hover:bg-[#D8BD8D] hover:text-[#283C5D]"
                >
                  <Search size={17} aria-hidden="true" />

                  {t("findDoctor")}

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>

                <p className="text-xs leading-5 text-[#283C5D]/45">
                  {t("findDoctorHint")}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] bg-[#283C5D] p-6 text-white shadow-xl shadow-[#283C5D]/15 md:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#D8BD8D]">
                  <Heart size={22} aria-hidden="true" />
                </div>

                <h2 className="mt-6 text-xl font-semibold">
                  {t("confidence.title")}
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/60">
                  {t("confidence.description")}
                </p>

                <div className="mt-7 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D8BD8D] text-[#283C5D]">
                      <ShieldCheck size={17} aria-hidden="true" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {t("trustedProfiles.title")}
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        {t("trustedProfiles.description")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D8BD8D] text-[#283C5D]">
                      <Search size={17} aria-hidden="true" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {t("easyDiscovery.title")}
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        {t("easyDiscovery.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-[#283C5D]/10 bg-white p-4 shadow-lg md:block">
                <p className="text-xs font-semibold text-[#283C5D]">
                  {t("nextStep.title")}
                </p>

                <p className="mt-1 text-xs text-[#283C5D]/45">
                  {t("nextStep.description")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}