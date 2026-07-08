"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type ConsultationBooking = {
  id: string;
  patientUserId: string;
  doctorProfileId: string;
  amount: number;
  platformFee: number;
  doctorAmount: number;
  status: string;
  currency: string;
  createdAt: string;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function parseBookings(
  payload: unknown
): ConsultationBooking[] {
  if (!isRecord(payload)) {
    return [];
  }

  const data = isRecord(payload.data)
    ? payload.data
    : payload;

  if (!Array.isArray(data.bookings)) {
    return [];
  }

  return data.bookings.reduce<
    ConsultationBooking[]
  >(
    (
      bookings: ConsultationBooking[],
      item: unknown
    ) => {
      if (!isRecord(item)) {
        return bookings;
      }

      if (
        typeof item.id !== "string" ||
        typeof item.patientUserId !==
          "string" ||
        typeof item.doctorProfileId !==
          "string" ||
        typeof item.amount !== "number" ||
        typeof item.platformFee !==
          "number" ||
        typeof item.doctorAmount !==
          "number" ||
        typeof item.status !== "string" ||
        typeof item.currency !==
          "string" ||
        typeof item.createdAt !== "string"
      ) {
        return bookings;
      }

      bookings.push({
        id: item.id,
        patientUserId:
          item.patientUserId,
        doctorProfileId:
          item.doctorProfileId,
        amount: item.amount,
        platformFee: item.platformFee,
        doctorAmount: item.doctorAmount,
        status: item.status,
        currency: item.currency,
        createdAt: item.createdAt,
      });

      return bookings;
    },
    []
  );
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

function getStatusClassName(
  status: string
): string {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";

    case "pending":
      return "bg-amber-50 text-amber-700";

    case "failed":
    case "cancelled":
    case "refunded":
      return "bg-red-50 text-red-700";

    default:
      return "bg-[#FAF2DE] text-[#283C5D]";
  }
}

export default function ConsultationBookingsTable() {
  const t = useTranslations(
    "admin.consultationBookingsTable"
  );

  const [bookings, setBookings] =
    useState<ConsultationBooking[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function fetchBookings(): Promise<void> {
      try {
        const res = await fetch(
          "/api/admin/consultation-bookings"
        );

        const payload =
          await parseJsonResponse(res);

        if (!res.ok) {
          throw new Error(
            "Could not load consultation bookings."
          );
        }

        setBookings(
          parseBookings(payload)
        );
      } catch (error) {
        console.error(
          "Could not load consultation bookings:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchBookings();
  }, []);

  function getLocalizedStatus(
    status: string
  ): string {
    switch (status.toLowerCase()) {
      case "paid":
        return t("statuses.paid");

      case "pending":
        return t("statuses.pending");

      case "failed":
        return t("statuses.failed");

      case "cancelled":
        return t("statuses.cancelled");

      case "refunded":
        return t("statuses.refunded");

      default:
        return status;
    }
  }

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-6 flex items-center justify-between gap-4">
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
          <CreditCard size={26} />
        </div>
      </div>

      <div className="max-h-[620px] overflow-auto rounded-2xl border border-[#283C5D]/10">
        <table className="min-w-[1050px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#FAF9F7] text-xs uppercase tracking-[0.18em] text-[#283C5D]/60">
            <tr>
              <th className="px-5 py-4 font-bold">
                {t("columns.patientUserId")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t(
                  "columns.doctorProfileId"
                )}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.amountPaid")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.platformFee")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.doctorAmount")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.status")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.currency")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#283C5D]/10">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#d8bd8d]" />
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-[#283C5D]/60"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              bookings.map(
                (
                  booking: ConsultationBooking
                ) => (
                  <tr
                    key={booking.id}
                    className="bg-white transition hover:bg-[#FAF9F7]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-[#283C5D]/70">
                      {booking.patientUserId}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-[#283C5D]/70">
                      {booking.doctorProfileId}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#283C5D]">
                      {formatMoney(
                        booking.amount,
                        booking.currency
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#d8bd8d]">
                      {formatMoney(
                        booking.platformFee,
                        booking.currency
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#283C5D]">
                      {formatMoney(
                        booking.doctorAmount,
                        booking.currency
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${getStatusClassName(
                          booking.status
                        )}`}
                      >
                        {getLocalizedStatus(
                          booking.status
                        )}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase text-[#283C5D]/60">
                      {booking.currency}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}