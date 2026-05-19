import { Lock, Sparkle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import UpgradeButton from "./UI/UpgradeButton"
import { useTranslations } from "next-intl";

type ExpertiseSectionProps = {
  procedureIds: string[];
  paidPlan?: "free" | "standard" | null;
};

export default function ExpertiseSection({
  procedureIds,
  paidPlan = "free",
}: ExpertiseSectionProps) {
  const proceduresT = useTranslations("proceduresName");
  const t = useTranslations("dashboard.expertise");

  const isFreePlan = paidPlan === "free";
  const visibleProcedures = isFreePlan ? procedureIds.slice(0, 5) : procedureIds;
  const hiddenCount = procedureIds.length - visibleProcedures.length;

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section className="mt-6 rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
        <div
          className={`grid gap-8 lg:items-center ${
            isFreePlan ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-1"
          }`}
        >
          <div>
            <div className="mb-7 flex items-center gap-3">
              <Sparkle size={20} className="text-[#d8bd8d]" />

              <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-[#283C5D]">
                {t("title")}
              </h2>
            </div>

            <p className="mb-4 text-sm font-medium text-[#283C5D]/80">
              {t("procedures")}
            </p>

            {visibleProcedures.length > 0 ? (
              <div
                className={`flex flex-wrap gap-3 ${
                  !isFreePlan ? "w-full content-center" : ""
                }`}
              >
                {visibleProcedures.map((procedureId) => (
                  <span
                    key={procedureId}
                    className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm"
                  >
                    {proceduresT(procedureId)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#283C5D]/55">
                {t("noProcedures")}
              </p>
            )}

            {isFreePlan && hiddenCount > 0 ? (
              <div className="mt-7 flex items-start gap-3 text-sm text-[#283C5D]/55">
                <Lock size={16} className="mt-0.5" />

                <div>
                  <p>
                    {t("hiddenProcedures", {
                      count: hiddenCount,
                    })}
                  </p>

                  <Link
                    href="/dashboard/settings"
                    className="text-[#F6C467] transition hover:text-[#283C5D]"
                  >
                    {t("moreAvailable")}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {isFreePlan ? (
            <aside className="rounded-2xl bg-[#283C5D] p-8 text-center text-white shadow-md">
              <Sparkle size={26} className="mx-auto mb-5 text-[#d8bd8d]" />

              <h3 className="text-lg font-semibold">
                {t("standardProfile")}
              </h3>

              <p className="mt-3 text-sm text-white/60">
                {t("standardDescription")}
              </p>

              <UpgradeButton />
            </aside>
          ) : null}
        </div>
      </section>
    </div>
  );
}