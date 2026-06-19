// components/dashboard/patient/PatientBookingHistory.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Loader2,
  ReceiptText,
  Stethoscope,
} from "lucide-react";
import { useTranslations } from "next-intl";

type PatientBooking = {
  id: string;
  consultationType: "IN_CLINIC" | "ONLINE" | string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  doctor: {
    id: string;
    slug: string | null;
    name: string | null;
    clinicName: string | null;
    avatar: string | null;
  };
};

type BookingsResponse = {
  bookings: PatientBooking[];
  error?: string;
};

function getStatusClass(status: string) {
  switch (status) {
    case "paid":
      return "border-green-200 bg-green-50 text-green-700";
    case "pending":
    case "processing":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "failed":
    case "cancelled":
    case "canceled":
      return "border-red-200 bg-red-50 text-red-700";
    case "refunded":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function getDisplayDate(booking: PatientBooking) {
  return booking.paidAt || booking.cancelledAt || booking.refundedAt || booking.createdAt;
}

export default function PatientBookingHistory() {
  const t = useTranslations("dashboard.dashboard.patientBookings");

  const [bookings, setBookings] = useState<PatientBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBookings = bookings.length > 0;

  const totalPaid = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === "paid")
      .reduce((sum, booking) => sum + booking.amount, 0);
  }, [bookings]);

  const currency = bookings[0]?.currency || "eur";

  function formatAmount(amount: number, bookingCurrency = currency) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: bookingCurrency.toUpperCase(),
    }).format(amount / 100);
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }

  function getConsultationTypeLabel(type: string) {
    if (type === "IN_CLINIC") return t("consultationTypes.inClinic");
    if (type === "ONLINE") return t("consultationTypes.online");

    return type;
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "paid":
        return t("statuses.paid");
      case "pending":
        return t("statuses.pending");
      case "processing":
        return t("statuses.processing");
      case "failed":
        return t("statuses.failed");
      case "cancelled":
      case "canceled":
        return t("statuses.cancelled");
      case "refunded":
        return t("statuses.refunded");
      default:
        return status;
    }
  }

  async function fetchBookings() {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/patient-profile/bookings", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await res.json()) as BookingsResponse;

      if (!res.ok) {
        throw new Error(data.error || t("errors.fetchFailed"));
      }

      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  async function openStripePortal() {
    try {
      setIsOpeningPortal(true);
      setError(null);

      const res = await fetch("/api/stripe/patient-portal", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("errors.portalFailed"));
      }

      if (!data.url) {
        throw new Error(t("errors.portalFailed"));
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.portalFailed"));
      setIsOpeningPortal(false);
    }
  }

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="w-full space-y-6">
      <div className="rounded-[32px] border border-[#283C5D]/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#283C5D]/45">
              {t("eyebrow")}
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#283C5D] md:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#283C5D]/60">
              {t("description")}
            </p>
          </div>

          <button
            type="button"
            onClick={openStripePortal}
            disabled={isOpeningPortal}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D8BD8D] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isOpeningPortal ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CreditCard size={18} />
            )}
            {t("actions.openStripe")}
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-[#FAF9F7] p-5">
            <div className="flex items-center gap-3 text-[#283C5D]">
              <ReceiptText size={20} />
              <p className="text-sm font-medium">{t("summary.totalBookings")}</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#283C5D]">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-3xl bg-[#FAF9F7] p-5">
            <div className="flex items-center gap-3 text-[#283C5D]">
              <CreditCard size={20} />
              <p className="text-sm font-medium">{t("summary.totalPaid")}</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#283C5D]">
              {formatAmount(totalPaid)}
            </p>
          </div>

          <div className="rounded-3xl bg-[#FAF9F7] p-5">
            <div className="flex items-center gap-3 text-[#283C5D]">
              <Stethoscope size={20} />
              <p className="text-sm font-medium">{t("summary.paidBookings")}</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#283C5D]">
              {bookings.filter((booking) => booking.status === "paid").length}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="rounded-[32px] border border-[#283C5D]/10 bg-white p-4 shadow-sm md:p-6">
        {isLoading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center text-[#283C5D]/60">
            <Loader2 size={28} className="animate-spin" />
            <p className="mt-4 text-sm">{t("loading")}</p>
          </div>
        ) : !hasBookings ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF9F7] text-[#283C5D]">
              <ReceiptText size={28} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#283C5D]">
              {t("empty.title")}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#283C5D]/60">
              {t("empty.description")}
            </p>

            <Link
              href="/doctors"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D8BD8D] hover:text-black"
            >
              {t("actions.findDoctors")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const doctorName =
                booking.doctor.name ||
                booking.doctor.clinicName ||
                t("fallbackDoctorName");

              return (
                <article
                  key={booking.id}
                  className="rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-4 transition hover:border-[#283C5D]/20 md:p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#283C5D]">
                        {booking.doctor.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={booking.doctor.avatar}
                            alt={doctorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Stethoscope size={22} />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[#283C5D]">
                            {doctorName}
                          </h3>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>

                        {booking.doctor.clinicName ? (
                          <p className="mt-1 text-sm text-[#283C5D]/55">
                            {booking.doctor.clinicName}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#283C5D]/65">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={16} />
                            {formatDate(getDisplayDate(booking))}
                          </span>

                          <span>
                            {getConsultationTypeLabel(booking.consultationType)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                      <p className="text-xl font-semibold text-[#283C5D]">
                        {formatAmount(booking.amount, booking.currency)}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {booking.doctor.slug ? (
                          <Link
                            href={`/doctors/${booking.doctor.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#283C5D]/15 bg-white px-4 py-2 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
                          >
                            {t("actions.viewDoctor")}
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={openStripePortal}
                          disabled={isOpeningPortal}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#283C5D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#D8BD8D] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ExternalLink size={15} />
                          {t("actions.manageInStripe")}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}