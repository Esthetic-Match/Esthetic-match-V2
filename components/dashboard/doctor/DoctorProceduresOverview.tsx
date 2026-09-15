"use client";

import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Loader2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useState,
} from "react";

type Summary = {
  total: number;
  priced: number;
  missingPrice: number;
  descriptions: number;
  topThree: number;
};

type ResponseData = {
  success?: boolean;
  summary?: Summary;
  error?: string;
};

export default function DoctorProceduresOverview() {
  const t = useTranslations(
    "mainDashboard.procedureOverview"
  );

  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/doctor-profile/procedures",
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as ResponseData;

        if (
          !response.ok ||
          !data.summary
        ) {
          throw new Error(
            data.error ||
              t("errors.load")
          );
        }

        setSummary(data.summary);
      } catch (loadError) {
        console.error(loadError);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [t]);

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-[2rem] border border-[#283C5D]/10 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-[#283C5D]" />
      </div>
    );
  }

  if (error || !summary) {
    return null;
  }

  const pricingPercentage =
    summary.total > 0
      ? Math.round(
          (summary.priced /
            summary.total) *
            100
        )
      : 0;

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_20px_60px_rgba(40,60,93,0.07)]">
      <div className="border-b border-[#283C5D]/10 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D8BD8D]" />

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8BD8D]">
                {t("eyebrow")}
              </p>
            </div>

            <h2 className="mt-2 text-xl font-bold text-[#283C5D]">
              {t("title")}
            </h2>

            <p className="mt-1 text-sm text-[#283C5D]/60">
              {t("description")}
            </p>
          </div>

          <Link
            href="/dashboard/procedures"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 text-sm font-semibold text-white transition hover:bg-[#1f304d]"
          >
            {t("manageProcedures")}

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 p-6 sm:grid-cols-2 md:p-8 lg:grid-cols-4">
        <StatCard
          icon={
            <Sparkles className="h-5 w-5" />
          }
          value={summary.total}
          label={t("stats.selected")}
        />

        <StatCard
          icon={
            <CircleDollarSign className="h-5 w-5" />
          }
          value={summary.priced}
          label={t("stats.priced")}
        />

        <StatCard
          icon={
            <TriangleAlert className="h-5 w-5" />
          }
          value={summary.missingPrice}
          label={t(
            "stats.missingPrice"
          )}
        />

        <StatCard
          icon={
            <FileText className="h-5 w-5" />
          }
          value={summary.descriptions}
          label={t(
            "stats.customDescriptions"
          )}
        />
      </div>

      <div className="px-6 pb-7 md:px-8">
        <div className="rounded-2xl bg-[#FAF9F7] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#283C5D]" />

                <p className="text-sm font-semibold text-[#283C5D]">
                  {t(
                    "pricingCoverage.title"
                  )}
                </p>
              </div>

              <p className="mt-1 text-xs text-[#283C5D]/50">
                {t(
                  "pricingCoverage.description",
                  {
                    priced:
                      summary.priced,
                    total:
                      summary.total,
                  }
                )}
              </p>
            </div>

            <span className="text-lg font-bold text-[#283C5D]">
              {pricingPercentage}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#283C5D]/10">
            <div
              className="h-full rounded-full bg-[#D8BD8D] transition-all"
              style={{
                width: `${pricingPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#D8BD8D] shadow-sm">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold text-[#283C5D]">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-[#283C5D]/55">
        {label}
      </p>
    </div>
  );
}