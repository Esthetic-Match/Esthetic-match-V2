// components/dashboard/admin/ConsultationBookingsAnalytics.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, ReceiptText } from "lucide-react";
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

function getCurrencySymbol(currency?: string | null) {
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

function formatMoney(amountInCents: number, currency: string) {
  const symbol = getCurrencySymbol(currency);
  const amount = (amountInCents / 100).toFixed(2);

  return symbol ? `${symbol} ${amount}` : amount;
}

export default function ConsultationBookingsAnalytics() {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/consultation-bookings/analytics");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Could not load booking analytics.");
        }

        setAnalytics(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const currency = analytics?.currency ?? "eur";

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            Bookings
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            Consultation Booking Analytics
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
            Daily booking volume and payment distribution across the platform.
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.dailyBookings ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickMargin={10}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar fill="#283C5D" dataKey="count" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                Total Bookings
              </p>
              <p className="mt-3 text-2xl font-bold text-[#283C5D]">
                {analytics?.totalBookings ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                Total Amount
              </p>
              <p className="mt-3 text-2xl font-bold text-[#283C5D]">
                {formatMoney(analytics?.totalAmount ?? 0, currency)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                Platform Fee
              </p>
              <p className="mt-3 text-2xl font-bold text-[#d8bd8d]">
                {formatMoney(analytics?.totalPlatformFee ?? 0, currency)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
                Doctor Amount
              </p>
              <p className="mt-3 text-2xl font-bold text-[#283C5D]">
                {formatMoney(analytics?.totalDoctorAmount ?? 0, currency)}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}