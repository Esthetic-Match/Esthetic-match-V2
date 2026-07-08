"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  RefreshCcw,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

type RefundRequest = {
  id: string;
  bookingId: string;
  patientUserId: string;
  doctorProfileId: string;
  reason: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  refundedAt: string | null;
  booking: {
    id: string;
    consultationType: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
    refundedAt: string | null;
    stripePaymentIntentId: string | null;
  };
  patient: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  doctor: {
    id: string;
    name: string | null;
    email: string | null;
    clinicName: string | null;
    avatar: string | null;
  };
};

type RefundRequestsResponse = {
  refundRequests: RefundRequest[];
  error?: string;
};

type ActionType = "approve" | "deny";

type RefundRequestsApiEnvelope = {
  data?: RefundRequestsResponse;
  refundRequests?: RefundRequest[];
  error?: string;
};

function getStatusClass(
  status: string
): string {
  switch (status) {
    case "pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "approved":
    case "refunded":
      return "border-green-200 bg-green-50 text-green-700";

    case "rejected":
    case "denied":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function getApiErrorMessage(
  value: unknown,
  fallback: string
): string {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return fallback;
  }

  const candidate = value as {
    error?: unknown;
  };

  return typeof candidate.error === "string"
    ? candidate.error
    : fallback;
}

function getRefundRequestsPayload(
  value: unknown
): RefundRequestsResponse | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const candidate =
    value as RefundRequestsApiEnvelope;

  if (
    candidate.data &&
    Array.isArray(
      candidate.data.refundRequests
    )
  ) {
    return candidate.data;
  }

  if (
    Array.isArray(
      candidate.refundRequests
    )
  ) {
    return {
      refundRequests:
        candidate.refundRequests,
      error: candidate.error,
    };
  }

  return null;
}

export default function RefundRequestsManager() {
  const t = useTranslations(
    "admin.refundRequestsManager"
  );

  const locale = useLocale();

  const [
    refundRequests,
    setRefundRequests,
  ] = useState<RefundRequest[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    actionLoadingId,
    setActionLoadingId,
  ] = useState<string | null>(null);

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState<RefundRequest | null>(null);

  const [
    selectedAction,
    setSelectedAction,
  ] = useState<ActionType | null>(null);

  const [adminNote, setAdminNote] =
    useState("");

  const [error, setError] = useState<
    string | null
  >(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  const pendingCount = useMemo(
    () =>
      refundRequests.filter(
        (request: RefundRequest) =>
          request.status === "pending"
      ).length,
    [refundRequests]
  );

  const refundedCount = useMemo(
    () =>
      refundRequests.filter(
        (request: RefundRequest) =>
          request.status === "refunded"
      ).length,
    [refundRequests]
  );

  const rejectedCount = useMemo(
    () =>
      refundRequests.filter(
        (request: RefundRequest) =>
          request.status === "rejected"
      ).length,
    [refundRequests]
  );

  function formatAmount(
    amount: number,
    currency: string
  ): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  function formatDate(
    date: string | null
  ): string {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    ).format(new Date(date));
  }

  function formatStatus(
    status: string
  ): string {
    switch (status.toLowerCase()) {
      case "pending":
        return t("statuses.pending");

      case "approved":
        return t("statuses.approved");

      case "refunded":
        return t("statuses.refunded");

      case "rejected":
        return t("statuses.rejected");

      case "denied":
        return t("statuses.denied");

      default:
        return status;
    }
  }

  function formatBookingStatus(
    status: string
  ): string {
    switch (status.toLowerCase()) {
      case "pending":
        return t(
          "bookingStatuses.pending"
        );

      case "paid":
        return t("bookingStatuses.paid");

      case "cancelled":
        return t(
          "bookingStatuses.cancelled"
        );

      case "refunded":
        return t(
          "bookingStatuses.refunded"
        );

      case "failed":
        return t(
          "bookingStatuses.failed"
        );

      default:
        return status;
    }
  }

  function formatConsultationType(
    type: string
  ): string {
    if (type === "IN_CLINIC") {
      return t(
        "consultationTypes.inClinic"
      );
    }

    return t(
      "consultationTypes.online"
    );
  }

  function openActionModal(
    request: RefundRequest,
    action: ActionType
  ): void {
    setSelectedRequest(request);
    setSelectedAction(action);
    setAdminNote("");
    setError(null);
    setSuccessMessage(null);
  }

  function closeActionModal(): void {
    if (actionLoadingId) {
      return;
    }

    setSelectedRequest(null);
    setSelectedAction(null);
    setAdminNote("");
  }

  const requestRefundRequests =
    useCallback(
      async (): Promise<
        RefundRequest[]
      > => {
        const res = await fetch(
          "/api/admin/refund-requests",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const rawData = (await res
          .json()
          .catch(
            (): null => null
          )) as unknown;

        if (!res.ok) {
          throw new Error(
            getApiErrorMessage(
              rawData,
              t("errors.load")
            )
          );
        }

        const payload =
          getRefundRequestsPayload(
            rawData
          );

        if (!payload) {
          throw new Error(
            t("errors.load")
          );
        }

        return payload.refundRequests;
      },
      [t]
    );

  const fetchRefundRequests =
    useCallback(
      async ({
        showLoading = true,
      }: {
        showLoading?: boolean;
      } = {}): Promise<void> => {
        try {
          if (showLoading) {
            setIsLoading(true);
          }

          setError(null);

          const nextRefundRequests =
            await requestRefundRequests();

          setRefundRequests(
            nextRefundRequests
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : t("errors.load")
          );
        } finally {
          if (showLoading) {
            setIsLoading(false);
          }
        }
      },
      [requestRefundRequests, t]
    );

  async function submitAction(): Promise<void> {
    if (
      !selectedRequest ||
      !selectedAction
    ) {
      return;
    }

    try {
      setActionLoadingId(
        selectedRequest.id
      );

      setError(null);
      setSuccessMessage(null);

      const res = await fetch(
        `/api/admin/refund-requests/${selectedRequest.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: selectedAction,
            adminNote,
          }),
        }
      );

      const data: unknown =
        await res.json();

      if (!res.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            t("errors.update")
          )
        );
      }

      setSuccessMessage(
        selectedAction === "approve"
          ? t("success.approved")
          : t("success.denied")
      );

      setSelectedRequest(null);
      setSelectedAction(null);
      setAdminNote("");

      await fetchRefundRequests({
        showLoading: false,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("errors.update")
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    requestRefundRequests()
      .then(
        (
          nextRefundRequests: RefundRequest[]
        ) => {
          if (!isMounted) {
            return;
          }

          setRefundRequests(
            nextRefundRequests
          );
        }
      )
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : t("errors.load")
        );
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestRefundRequests, t]);

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
            onClick={() =>
              void fetchRefundRequests({
                showLoading: true,
              })
            }
            disabled={isLoading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D8BD8D] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <RefreshCcw size={18} />
            )}

            {t("actions.refresh")}
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-[#FAF9F7] p-5">
            <div className="flex items-center gap-3 text-[#283C5D]">
              <Clock size={20} />

              <p className="text-sm font-medium">
                {t("summary.pending")}
              </p>
            </div>

            <p className="mt-3 text-2xl font-semibold text-[#283C5D]">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-3xl bg-[#FAF9F7] p-5">
            <div className="flex items-center gap-3 text-[#283C5D]">
              <CheckCircle2 size={20} />

              <p className="text-sm font-medium">
                {t("summary.refunded")}
              </p>
            </div>

            <p className="mt-3 text-2xl font-semibold text-[#283C5D]">
              {refundedCount}
            </p>
          </div>

          <div className="rounded-3xl bg-[#FAF9F7] p-5">
            <div className="flex items-center gap-3 text-[#283C5D]">
              <XCircle size={20} />

              <p className="text-sm font-medium">
                {t("summary.rejected")}
              </p>
            </div>

            <p className="mt-3 text-2xl font-semibold text-[#283C5D]">
              {rejectedCount}
            </p>
          </div>
        </div>
      </div>

      {successMessage ? (
        <div className="flex items-start gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>{successMessage}</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      ) : null}

      <div className="rounded-[32px] border border-[#283C5D]/10 bg-white p-4 shadow-sm md:p-6">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center text-[#283C5D]/60">
            <Loader2
              size={28}
              className="animate-spin"
            />

            <p className="mt-4 text-sm">
              {t("loading")}
            </p>
          </div>
        ) : refundRequests.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF9F7] text-[#283C5D]">
              <CreditCard size={28} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#283C5D]">
              {t("empty.title")}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#283C5D]/60">
              {t("empty.description")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {refundRequests.map(
              (
                request: RefundRequest
              ) => {
                const patientName =
                  request.patient.name ||
                  t(
                    "fallbacks.patient"
                  );

                const doctorName =
                  request.doctor.name ||
                  request.doctor
                    .clinicName ||
                  t(
                    "fallbacks.doctor"
                  );

                const isPending =
                  request.status ===
                  "pending";

                const isActionLoading =
                  actionLoadingId ===
                  request.id;

                return (
                  <article
                    key={request.id}
                    className="rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-4 transition hover:border-[#283C5D]/20 md:p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                              request.status
                            )}`}
                          >
                            {formatStatus(
                              request.status
                            )}
                          </span>

                          <span className="text-sm text-[#283C5D]/50">
                            {t(
                              "requestedOn",
                              {
                                date: formatDate(
                                  request.createdAt
                                ),
                              }
                            )}
                          </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl bg-white p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#283C5D]">
                              <UserRound
                                size={17}
                              />

                              {t(
                                "cards.patient"
                              )}
                            </div>

                            <p className="mt-2 text-sm text-[#283C5D]/70">
                              {patientName}
                            </p>

                            <p className="text-xs text-[#283C5D]/45">
                              {request.patient
                                .email ||
                                t(
                                  "fallbacks.noEmail"
                                )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#283C5D]">
                              <Stethoscope
                                size={17}
                              />

                              {t(
                                "cards.doctor"
                              )}
                            </div>

                            <p className="mt-2 text-sm text-[#283C5D]/70">
                              {doctorName}
                            </p>

                            <p className="text-xs text-[#283C5D]/45">
                              {request.doctor
                                .clinicName ||
                                t(
                                  "fallbacks.noClinic"
                                )}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-sm font-semibold text-[#283C5D]">
                            {t(
                              "cards.patientReason"
                            )}
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#283C5D]/65">
                            {request.reason}
                          </p>
                        </div>

                        {request.adminNote ? (
                          <div className="rounded-2xl border border-[#283C5D]/10 bg-white p-4">
                            <p className="text-sm font-semibold text-[#283C5D]">
                              {t(
                                "cards.adminNote"
                              )}
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#283C5D]/65">
                              {
                                request.adminNote
                              }
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="min-w-full space-y-3 rounded-2xl bg-white p-4 lg:min-w-[260px]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[#283C5D]/40">
                            {t(
                              "booking.amount"
                            )}
                          </p>

                          <p className="mt-1 text-2xl font-semibold text-[#283C5D]">
                            {formatAmount(
                              request.booking
                                .amount,
                              request.booking
                                .currency
                            )}
                          </p>
                        </div>

                        <div className="space-y-1 text-sm text-[#283C5D]/65">
                          <p>
                            {t("booking.type")}
                            {": "}
                            {formatConsultationType(
                              request.booking
                                .consultationType
                            )}
                          </p>

                          <p>
                            {t(
                              "booking.status"
                            )}
                            {": "}
                            {formatBookingStatus(
                              request.booking
                                .status
                            )}
                          </p>

                          <p>
                            {t(
                              "booking.paidAt"
                            )}
                            {": "}
                            {formatDate(
                              request.booking
                                .paidAt
                            )}
                          </p>

                          <p>
                            {t(
                              "booking.reviewedAt"
                            )}
                            {": "}
                            {formatDate(
                              request.reviewedAt
                            )}
                          </p>
                        </div>

                        {isPending ? (
                          <div className="flex flex-col gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                openActionModal(
                                  request,
                                  "approve"
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isActionLoading ? (
                                <Loader2
                                  size={
                                    16
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2
                                  size={
                                    16
                                  }
                                />
                              )}

                              {t(
                                "actions.approveRefund"
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openActionModal(
                                  request,
                                  "deny"
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <XCircle
                                size={16}
                              />

                              {t(
                                "actions.denyRequest"
                              )}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>

      {selectedRequest &&
      selectedAction ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-xl md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#283C5D]/45">
              {selectedAction ===
              "approve"
                ? t(
                    "modal.approve.eyebrow"
                  )
                : t(
                    "modal.deny.eyebrow"
                  )}
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-[#283C5D]">
              {selectedAction ===
              "approve"
                ? t(
                    "modal.approve.title"
                  )
                : t(
                    "modal.deny.title"
                  )}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-[#283C5D]/60">
              {selectedAction ===
              "approve"
                ? t(
                    "modal.approve.description"
                  )
                : t(
                    "modal.deny.description"
                  )}
            </p>

            <div className="mt-5 rounded-3xl bg-[#FAF9F7] p-4">
              <p className="text-sm font-semibold text-[#283C5D]">
                {selectedRequest.patient
                  .name ||
                  t(
                    "fallbacks.patient"
                  )}
              </p>

              <p className="mt-1 text-sm text-[#283C5D]/60">
                {formatAmount(
                  selectedRequest.booking
                    .amount,
                  selectedRequest.booking
                    .currency
                )}{" "}
                ·{" "}
                {formatConsultationType(
                  selectedRequest.booking
                    .consultationType
                )}
              </p>
            </div>

            <label
              htmlFor="adminNote"
              className="mt-5 block text-sm font-medium text-[#283C5D]"
            >
              {t("modal.adminNote")}
            </label>

            <textarea
              id="adminNote"
              value={adminNote}
              onChange={(
                event: React.ChangeEvent<HTMLTextAreaElement>
              ) =>
                setAdminNote(
                  event.target.value
                )
              }
              disabled={Boolean(
                actionLoadingId
              )}
              rows={4}
              placeholder={
                selectedAction ===
                "approve"
                  ? t(
                      "modal.approve.notePlaceholder"
                    )
                  : t(
                      "modal.deny.notePlaceholder"
                    )
              }
              className="mt-2 w-full resize-none rounded-3xl border border-[#283C5D]/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/35 focus:border-[#283C5D]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  closeActionModal
                }
                disabled={Boolean(
                  actionLoadingId
                )}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#283C5D]/15 bg-white px-5 py-3 text-sm font-medium text-[#283C5D] transition hover:bg-[#FAF9F7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("actions.cancel")}
              </button>

              <button
                type="button"
                onClick={() =>
                  void submitAction()
                }
                disabled={Boolean(
                  actionLoadingId
                )}
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  selectedAction ===
                  "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoadingId ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : selectedAction ===
                  "approve" ? (
                  <CheckCircle2
                    size={18}
                  />
                ) : (
                  <XCircle size={18} />
                )}

                {selectedAction ===
                "approve"
                  ? t(
                      "actions.approveAndRefund"
                    )
                  : t(
                      "actions.denyRequest"
                    )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}