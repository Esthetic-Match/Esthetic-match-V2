// components/dashboard/patient/PatientBookingHistory.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Loader2,
  ReceiptText,
  RotateCcw,
  Stethoscope,
  X,
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

type BookingsApiEnvelope = {
  data?: BookingsResponse;
  bookings?: PatientBooking[];
  error?: string;
};

function getApiErrorMessage(value: unknown, fallback: string) {
  if (typeof value !== "object" || value === null) return fallback;

  const candidate = value as { error?: unknown };

  return typeof candidate.error === "string" ? candidate.error : fallback;
}

function getBookingsPayload(value: unknown): BookingsResponse | null {
  if (typeof value !== "object" || value === null) return null;

  const candidate = value as BookingsApiEnvelope;

  if (candidate.data && Array.isArray(candidate.data.bookings)) {
    return candidate.data;
  }

  if (Array.isArray(candidate.bookings)) {
    return {
      bookings: candidate.bookings,
      error: candidate.error,
    };
  }

  return null;
}

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
  return (
    booking.paidAt ||
    booking.cancelledAt ||
    booking.refundedAt ||
    booking.createdAt
  );
}

function canRequestRefund(booking: PatientBooking) {
  return booking.status === "paid" && !booking.refundedAt;
}

export default function PatientBookingHistory() {
  const t = useTranslations("dashboard.patientBookings");

  const [bookings, setBookings] = useState<PatientBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedRefundBooking, setSelectedRefundBooking] =
    useState<PatientBooking | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

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

  function openRefundModal(booking: PatientBooking) {
    setError(null);
    setSuccessMessage(null);
    setRefundReason("");
    setSelectedRefundBooking(booking);
  }

  function closeRefundModal() {
    if (isSubmittingRefund) return;

    setSelectedRefundBooking(null);
    setRefundReason("");
  }

const requestBookings = useCallback(async (): Promise<PatientBooking[]> => {
  const res = await fetch("/api/patient-profile/bookings", {
    method: "GET",
    cache: "no-store",
  });

  const rawData = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    throw new Error(getApiErrorMessage(rawData, t("errors.fetchFailed")));
  }

  const payload = getBookingsPayload(rawData);

  if (!payload) {
    throw new Error(t("errors.fetchFailed"));
  }

  return payload.bookings;
}, [t]);

const fetchBookings = useCallback(
  async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      setError(null);

      const nextBookings = await requestBookings();

      setBookings(nextBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.fetchFailed"));
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  },
  [requestBookings, t]
);

  async function openStripePortal() {
    try {
      setIsOpeningPortal(true);
      setError(null);
      setSuccessMessage(null);

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

  async function submitRefundRequest() {
    if (!selectedRefundBooking) return;

    const reason = refundReason.trim();

    if (!reason) {
      setError(t("errors.refundReasonRequired"));
      return;
    }

    try {
      setIsSubmittingRefund(true);
      setError(null);
      setSuccessMessage(null);

      const res = await fetch(
        `/api/patient-profile/bookings/${selectedRefundBooking.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("errors.refundRequestFailed"));
      }

      setSuccessMessage(t("refund.success"));
      setSelectedRefundBooking(null);
      setRefundReason("");

      await fetchBookings({ showLoading: false });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.refundRequestFailed")
      );
    } finally {
      setIsSubmittingRefund(false);
    }
  }

useEffect(() => {
  let isMounted = true;

  requestBookings()
    .then((nextBookings) => {
      if (!isMounted) return;

      setBookings(nextBookings);
    })
    .catch((err: unknown) => {
      if (!isMounted) return;

      setError(err instanceof Error ? err.message : t("errors.fetchFailed"));
    })
    .finally(() => {
      if (!isMounted) return;

      setIsLoading(false);
    });

  return () => {
    isMounted = false;
  };
}, [requestBookings, t]);

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
              <p className="text-sm font-medium">
                {t("summary.totalBookings")}
              </p>
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

      {successMessage ? (
        <div className="flex items-start gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
          <ReceiptText size={20} className="mt-0.5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      ) : null}

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

              const refundAvailable = canRequestRefund(booking);

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

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        {booking.doctor.slug ? (
                          <Link
                            href={`/doctors/${booking.doctor.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#283C5D]/15 bg-white px-4 py-2 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
                          >
                            {t("actions.viewDoctor")}
                          </Link>
                        ) : null}

                        {refundAvailable ? (
                          <button
                            type="button"
                            onClick={() => openRefundModal(booking)}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#283C5D]/15 bg-white px-4 py-2 text-sm font-medium text-[#283C5D] transition hover:bg-[#D8BD8D] hover:text-black"
                          >
                            <RotateCcw size={15} />
                            {t("actions.requestRefund")}
                          </button>
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

      {selectedRefundBooking ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#283C5D]/45">
                  {t("refund.eyebrow")}
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-[#283C5D]">
                  {t("refund.title")}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-[#283C5D]/60">
                  {t("refund.description")}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRefundModal}
                disabled={isSubmittingRefund}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#FAF9F7] text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={t("refund.close")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-3xl bg-[#FAF9F7] p-4">
              <p className="text-sm font-semibold text-[#283C5D]">
                {selectedRefundBooking.doctor.name ||
                  selectedRefundBooking.doctor.clinicName ||
                  t("fallbackDoctorName")}
              </p>

              <p className="mt-1 text-sm text-[#283C5D]/60">
                {formatAmount(
                  selectedRefundBooking.amount,
                  selectedRefundBooking.currency
                )}{" "}
                ·{" "}
                {getConsultationTypeLabel(
                  selectedRefundBooking.consultationType
                )}
              </p>
            </div>

            <label
              htmlFor="refundReason"
              className="mt-5 block text-sm font-medium text-[#283C5D]"
            >
              {t("refund.reasonLabel")}
            </label>

            <textarea
              id="refundReason"
              value={refundReason}
              onChange={(event) => setRefundReason(event.target.value)}
              disabled={isSubmittingRefund}
              rows={5}
              placeholder={t("refund.reasonPlaceholder")}
              className="mt-2 w-full resize-none rounded-3xl border border-[#283C5D]/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/35 focus:border-[#283C5D]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRefundModal}
                disabled={isSubmittingRefund}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#283C5D]/15 bg-white px-5 py-3 text-sm font-medium text-[#283C5D] transition hover:bg-[#FAF9F7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("refund.cancel")}
              </button>

              <button
                type="button"
                onClick={submitRefundRequest}
                disabled={isSubmittingRefund}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D8BD8D] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingRefund ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RotateCcw size={18} />
                )}
                {t("refund.submit")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}