"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Heart,
  Loader2,
  RefreshCcw,
  UsersRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

type DoctorLikesResponse = {
  totalLikes: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDoctorLikesResponse(
  value: unknown
): DoctorLikesResponse | null {
  if (!isRecord(value) || typeof value.totalLikes !== "number") {
    return null;
  }

  return {
    totalLikes: value.totalLikes,
  };
}

export default function DoctorLikeDash() {
  const t = useTranslations("mainDashboard.doctorLikes");

  const [totalLikes, setTotalLikes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  const loadLikes = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/dashboard/doctor/likes",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const payload: unknown = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(t("loadError"));
      }

      const parsedPayload = parseDoctorLikesResponse(payload);

      if (!parsedPayload) {
        throw new Error(t("loadError"));
      }

      setTotalLikes(parsedPayload.totalLikes);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("loadError")
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadLikes();
  }, [loadLikes]);

  return (
    <section className="relative overflow-hidden mt-4 rounded-3xl border border-[#283C5D]/10 bg-white p-6 shadow-lg shadow-[#283C5D]/5 md:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-[#D8BD8D] shadow-md">
              <Heart
                size={22}
                fill="currentColor"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8BD8D]">
                {t("eyebrow")}
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#283C5D]">
                {t("title")}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#283C5D]/60">
                {t("description")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadLikes()}
            disabled={isLoading}
            aria-label={t("refresh")}
            title={t("refresh")}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-[#283C5D] transition hover:border-[#D8BD8D] hover:bg-[#283C5D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2
                size={17}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <RefreshCcw size={17} aria-hidden="true" />
            )}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void loadLikes()}
              className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D]"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-3xl bg-[#283C5D] p-6 text-white">
              <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-[#D8BD8D]/20 blur-2xl" />

              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                  {t("totalLabel")}
                </p>

                {isLoading ? (
                  <div className="mt-5 h-14 w-28 animate-pulse rounded-2xl bg-white/10" />
                ) : (
                  <p className="mt-4 text-5xl font-semibold tracking-tight text-[#D8BD8D] md:text-6xl">
                    {totalLikes.toLocaleString()}
                  </p>
                )}

                <p className="mt-4 text-sm leading-6 text-white/65">
                  {isLoading
                    ? t("loading")
                    : t("summary", { count: totalLikes })}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#D8BD8D] shadow-sm">
                <UsersRound size={20} aria-hidden="true" />
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold text-[#283C5D]">
                  {t("currentMetric")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#283C5D]/55">
                  {t("currentMetricDescription")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
