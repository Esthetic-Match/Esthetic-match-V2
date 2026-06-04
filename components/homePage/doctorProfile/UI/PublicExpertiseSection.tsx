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
          className="grid gap-8 lg:items-center lg:grid-cols-1"
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

            {visibleProcedures.length > 0 ? (
              <ul
                itemProp="knowsAbout"
                className="flex flex-wrap gap-3"
                aria-label={t("expertise.aria")}
              >
                {visibleProcedures.map((procedureId) => (
                <li key={procedureId} className="mb-2">
                  <span className="inline-flex max-w-full whitespace-normal break-words rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm">
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
        </div>
      </section>
    </div>
  );
}