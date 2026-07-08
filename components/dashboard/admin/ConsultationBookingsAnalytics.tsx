"use client";

import { useEffect, useState } from "react";
import { Loader2, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DailyBooking = {
  date: string;
  count: number;
};

type BookingAnalytics = {
  dailyBookings: DailyBooking[];
  totalBookings: number;
  totalAmount: number;
  totalPlatformFee: number;
  totalDoctorAmount: number;
  currency: string;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function parseDailyBookings(
  value: unknown
): DailyBooking[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<DailyBooking[]>(
    (
      bookings: DailyBooking[],
      item: unknown
    ) => {
      if (!isRecord(item)) {
        return bookings;
      }

      if (
        typeof item.date !== "string" ||
        typeof item.count !== "number"
      ) {
        return bookings;
      }

      bookings.push({
        date: item.date,
        count: item.count,
      });

      return bookings;
    },
    []
  );
}

function parseBookingAnalytics(
  payload: unknown
): BookingAnalytics | null {
  if (!isRecord(payload)) {
    return null;
  }

  const data = isRecord(payload.data)
    ? payload.data
    : payload;

  if (
    typeof data.totalBookings !== "number" ||
    typeof data.totalAmount !== "number" ||
    typeof data.totalPlatformFee !== "number" ||
    typeof data.totalDoctorAmount !== "number" ||
    typeof data.currency !== "string"
  ) {
    return null;
  }

  return {
    dailyBookings: parseDailyBookings(
      data.dailyBookings
    ),
    totalBookings: data.totalBookings,
    totalAmount: data.totalAmount,
    totalPlatformFee:
      data.totalPlatformFee,
    totalDoctorAmount:
      data.totalDoctorAmount,
    currency: data.currency,
  };
}

async function parseJsonResponse(
  response: Response
): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return parsed;
  } catch {
    return {
      error: raw,
    };
  }
}

function getCurrencySymbol(
  currency?: string | null
): string {
  switch (currency?.toLowerCase()) {
    case "usd":
      return "$";

    case "eur":
      return "€";

    case "gbp":
      return "£";

    case "chf":
      return "CHF";

    case "aed":
      return "AED";

    case "egp":
      return "EGP";

    default:
      return currency?.toUpperCase() || "";
  }
}

function formatMoney(
  amountInCents: number,
  currency: string
): string {
  const symbol =
    getCurrencySymbol(currency);

  const amount = (
    amountInCents / 100
  ).toFixed(2);

  return symbol
    ? `${symbol} ${amount}`
    : amount;
}

export default function ConsultationBookingsAnalytics() {
  const t = useTranslations(
    "admin.consultationBookingsAnalytics"
  );

  const [analytics, setAnalytics] =
    useState<BookingAnalytics | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function fetchAnalytics(): Promise<void> {
      try {
        const res = await fetch(
          "/api/admin/consultation-bookings/analytics"
        );

        const payload =
          await parseJsonResponse(res);

        if (!res.ok) {
          throw new Error(
            "Could not load booking analytics."
          );
        }

        const parsedAnalytics =
          parseBookingAnalytics(payload);

        if (!parsedAnalytics) {
          throw new Error(
            "Invalid booking analytics response."
          );
        }

        setAnalytics(parsedAnalytics);
      } catch (error) {
        console.error(
          "Could not load booking analytics:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAnalytics();
  }, []);

  const currency =
    analytics?.currency ?? "eur";

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            {t("eyebrow")}
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
            {t("description")}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF2DE] text-[#d8bd8d]">
          <ReceiptText size={26} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#d8bd8d]" />
        </div>
      ) : (
        <>
          <div className="h-72 rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-4">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  analytics?.dailyBookings ?? []
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                  }}
                  tickMargin={10}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip />

                <Bar
                  fill="#283C5D"
                  dataKey="count"
                  name={t("chart.bookings")}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                {t(
                  "metrics.totalBookings"
                )}
              </p>

              <p className="mt-3 text-2xl font-bold text-[#283C5D]">
                {analytics?.totalBookings ??
                  0}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                {t("metrics.totalAmount")}
              </p>

              <p className="mt-3 text-2xl font-bold text-[#283C5D]">
                {formatMoney(
                  analytics?.totalAmount ?? 0,
                  currency
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                {t("metrics.platformFee")}
              </p>

              <p className="mt-3 text-2xl font-bold text-[#d8bd8d]">
                {formatMoney(
                  analytics?.totalPlatformFee ??
                    0,
                  currency
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                {t("metrics.doctorAmount")}
              </p>

              <p className="mt-3 text-2xl font-bold text-[#283C5D]">
                {formatMoney(
                  analytics?.totalDoctorAmount ??
                    0,
                  currency
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}