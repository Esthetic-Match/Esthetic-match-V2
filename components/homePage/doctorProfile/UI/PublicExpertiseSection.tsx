import { Lock, Sparkle } from "lucide-react";
import { getTranslations } from "next-intl/server";

type PublicExpertiseSectionProps = {
  doctorProfile: {
    procedureIds: string[];
    paidPlan: string | null;
  };
};

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default async function PublicExpertiseSection({
  doctorProfile,
}: PublicExpertiseSectionProps) {
  const isFreePlan = doctorProfile.paidPlan === "free" || !doctorProfile.paidPlan;
  const t = await getTranslations("doctor.doctor.profile");
  const proceduresT = await getTranslations("proceduresName");
  const visibleProcedures = isFreePlan
    ? doctorProfile.procedureIds.slice(0, 5)
    : doctorProfile.procedureIds;

  const hiddenCount = Math.max(
    doctorProfile.procedureIds.length - visibleProcedures.length,
    0
  );

  return (
<div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section
        aria-labelledby="doctor-expertise-title"
        className="mt-6 rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
      >
        <div
          className={`grid gap-8 lg:items-center ${
            isFreePlan
              ? "lg:grid-cols-[1fr_220px]"
              : "lg:grid-cols-[1fr_120px]"
          }`}
        >
          <div>
            <div className="mb-7 flex items-center gap-3">
              <Sparkle size={20} className="text-[#d8bd8d]" />

              <h2
                id="doctor-expertise-title"
                className="text-sm font-bold uppercase tracking-[0.22em] text-[#283C5D]"
              >
                {t("expertise.title")}
              </h2>
            </div>

            <p className="mb-4 text-sm font-medium text-[#283C5D]/80">
              {t("expertise.procedures")}
            </p>

            {visibleProcedures.length > 0 ? (
              <ul
                itemProp="knowsAbout"
                className="flex flex-wrap gap-3"
                aria-label={t("expertise.aria")}
              >
                {visibleProcedures.map((procedureId) => (
                  <li key={procedureId} className="mb-2">
                    <span className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm">
                      {proceduresT(procedureId)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#283C5D]/45">
                {t("expertise.noProcedures")}
              </p>
            )}

            {isFreePlan && hiddenCount > 0 ? (
              <div className="mt-7 flex items-start gap-3 text-sm text-[#283C5D]/55">
                <Lock size={16} className="mt-0.5" aria-hidden="true" />

                <p>
                  {t("expertise.moreProcedures", {
                    count: hiddenCount,
                  })}
                </p>
              </div>
            ) : null}
          </div>

          {isFreePlan ? (
            <aside className="rounded-2xl bg-[#283C5D] p-8 text-center text-white shadow-md">
              <Sparkle size={26} className="mx-auto mb-5 text-[#d8bd8d]" />

              <h3 className="text-lg font-semibold">
                {t("expertise.standardProfile")}
              </h3>

              <p className="mt-3 text-sm text-white/60">
                {t("expertise.moreAvailable")}
              </p>
            </aside>
          ) : null}
        </div>
      </section>
    </div>
  );
}