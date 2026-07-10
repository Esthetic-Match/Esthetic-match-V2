import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

type PublicTopThreeProceduresSectionProps = {
  topThree: string[];
};

export default async function PublicTopThreeProceduresSection({
  topThree,
}: PublicTopThreeProceduresSectionProps) {
  const t = await getTranslations(
    "doctor.doctor.profile"
  );

  const proceduresT = await getTranslations(
    "proceduresName"
  );

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl border border-[#CEB591]/20 bg-white px-6 py-8 shadow-[0_18px_55px_rgba(40,60,93,0.08)] md:px-10 md:py-10">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-72 -translate-x-1/2 rounded-full bg-[#F1E1C6]/35 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          {/* Title */}
          <h2 className="mt-4 text-xl font-bold tracking-tight text-[#283C5D] md:text-2xl">
            {t("header.topProcedures")}
          </h2>

          {/* Accent divider */}
          <div className="mt-3 h-px w-16 bg-gradient-to-r from-transparent via-[#D8BD8D] to-transparent" />
        </div>

        {/* Procedures */}
        <div className="relative mt-7 flex min-h-14 flex-wrap items-center justify-center gap-3">
          {topThree.length > 0 ? (
            topThree.map(
              (
                procedure: string,
                index: number
              ) => (
                <div
                  key={procedure}
                  className="flex min-h-11 max-w-full items-center justify-center rounded-full border border-[#D8BD8D]/40 
                  bg-[#F8F3EA] px-5 py-2.5 text-center text-sm font-semibold text-[#283C5D] cursor-default"
                >
                  <span className="break-words">
                    {proceduresT(procedure)}
                  </span>
                </div>
              )
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-[#283C5D]/15 bg-[#FAF9F7] px-6 py-4 text-center">
              <p className="text-sm font-medium text-[#283C5D]/55">
                {t("header.noTopProcedures")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}