"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";

type InvitationData = {
  expiresAt: string;
  doctor: {
    name: string;
    clinicName: string;
    city: string | null;
    country: string | null;
  };
};

type InvitationErrorCode =
  | "UNAUTHORIZED"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_FOR_DIFFERENT_PATIENT"
  | "INVITATION_EXPIRED"
  | "INVITATION_REVOKED"
  | "INVITATION_ALREADY_USED"
  | "REVIEW_SUBMISSION_CONFLICT"
  | "UNKNOWN";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseInvitation(value: unknown): InvitationData | null {
  if (!isRecord(value) || !isRecord(value.invitation)) {
    return null;
  }

  const invitation = value.invitation;

  if (
    typeof invitation.expiresAt !== "string" ||
    !isRecord(invitation.doctor) ||
    typeof invitation.doctor.name !== "string" ||
    typeof invitation.doctor.clinicName !== "string"
  ) {
    return null;
  }

  if (
    invitation.doctor.city !== null &&
    typeof invitation.doctor.city !== "string"
  ) {
    return null;
  }

  if (
    invitation.doctor.country !== null &&
    typeof invitation.doctor.country !== "string"
  ) {
    return null;
  }

  return {
    expiresAt: invitation.expiresAt,
    doctor: {
      name: invitation.doctor.name,
      clinicName: invitation.doctor.clinicName,
      city: invitation.doctor.city,
      country: invitation.doctor.country,
    },
  };
}

function parseErrorCode(value: unknown): InvitationErrorCode {
  if (!isRecord(value) || typeof value.code !== "string") {
    return "UNKNOWN";
  }

  switch (value.code) {
    case "UNAUTHORIZED":
    case "INVITATION_NOT_FOUND":
    case "INVITATION_FOR_DIFFERENT_PATIENT":
    case "INVITATION_EXPIRED":
    case "INVITATION_REVOKED":
    case "INVITATION_ALREADY_USED":
    case "REVIEW_SUBMISSION_CONFLICT":
      return value.code;
    default:
      return "UNKNOWN";
  }
}

function getToken(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function ReviewInvitationPage() {
  const t = useTranslations("reviewInvitation");
  const format = useFormatter();
  const params = useParams<{
    token?: string | string[];
  }>();

  const token = getToken(params.token);

  const [invitation, setInvitation] =
    useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorCode, setErrorCode] =
    useState<InvitationErrorCode | null>(null);
  const [formError, setFormError] = useState("");

  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const location = useMemo(() => {
    if (!invitation) return "";

    return [
      invitation.doctor.city,
      invitation.doctor.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [invitation]);

  const loadInvitation = useCallback(async () => {
    if (!token) {
      setErrorCode("INVITATION_NOT_FOUND");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = await fetch(
        `/api/reviews/invitations/${encodeURIComponent(token)}`,
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
        setErrorCode(parseErrorCode(payload));
        return;
      }

      const parsedInvitation = parseInvitation(payload);

      if (!parsedInvitation) {
        setErrorCode("UNKNOWN");
        return;
      }

      setInvitation(parsedInvitation);
    } catch {
      setErrorCode("UNKNOWN");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadInvitation();
  }, [loadInvitation]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanReview = review.trim();

    if (
      cleanTitle.length < 3 ||
      cleanReview.length < 10 ||
      rating < 1 ||
      rating > 5
    ) {
      setFormError(t("validationError"));
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(
        `/api/reviews/invitations/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: cleanTitle,
            review: cleanReview,
            rating,
          }),
        }
      );

      const payload: unknown = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const code = parseErrorCode(payload);

        if (code !== "UNKNOWN") {
          setErrorCode(code);
          return;
        }

        setFormError(t("submissionError"));
        return;
      }

      setIsSubmitted(true);
    } catch {
      setFormError(t("submissionError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function getErrorContent(code: InvitationErrorCode) {
    switch (code) {
      case "UNAUTHORIZED":
        return {
          title: t("errors.unauthorizedTitle"),
          description: t("errors.unauthorizedDescription"),
        };
      case "INVITATION_FOR_DIFFERENT_PATIENT":
        return {
          title: t("errors.wrongAccountTitle"),
          description: t("errors.wrongAccountDescription"),
        };
      case "INVITATION_EXPIRED":
        return {
          title: t("errors.expiredTitle"),
          description: t("errors.expiredDescription"),
        };
      case "INVITATION_REVOKED":
        return {
          title: t("errors.revokedTitle"),
          description: t("errors.revokedDescription"),
        };
      case "INVITATION_ALREADY_USED":
      case "REVIEW_SUBMISSION_CONFLICT":
        return {
          title: t("errors.usedTitle"),
          description: t("errors.usedDescription"),
        };
      case "INVITATION_NOT_FOUND":
        return {
          title: t("errors.notFoundTitle"),
          description: t("errors.notFoundDescription"),
        };
      default:
        return {
          title: t("errors.genericTitle"),
          description: t("errors.genericDescription"),
        };
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07182A] px-4 py-8 text-[#283C5D] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#D8BD8D]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/25 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="relative overflow-hidden bg-[#283C5D] p-8 text-white sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-[#D8BD8D]/20 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8BD8D] text-[#283C5D]">
                  <Sparkles size={20} aria-hidden="true" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8BD8D]">
                    Esthetic Match
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    {t("privateInvitation")}
                  </p>
                </div>
              </div>

              <div className="my-auto py-12">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8BD8D]">
                  {t("eyebrow")}
                </p>

                <h1 className="mt-5 text-4xl font-light leading-tight tracking-tight sm:text-5xl">
                  {t("heroTitle")}
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
                  {t("heroDescription")}
                </p>

                {invitation && (
                  <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8BD8D]">
                      {t("reviewing")}
                    </p>

                    <p className="mt-3 text-xl font-semibold text-white">
                      {invitation.doctor.name}
                    </p>

                    <p className="mt-1 text-sm text-white/60">
                      {invitation.doctor.clinicName}
                    </p>

                    {location && (
                      <p className="mt-1 text-sm text-white/45">
                        {location}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-6 text-xs leading-5 text-white/55">
                <p className="flex items-start gap-2">
                  <LockKeyhole
                    size={15}
                    className="mt-0.5 shrink-0 text-[#D8BD8D]"
                    aria-hidden="true"
                  />
                  {t("security.private")}
                </p>

                <p className="flex items-start gap-2">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-[#D8BD8D]"
                    aria-hidden="true"
                  />
                  {t("security.oneTime")}
                </p>
              </div>
            </div>
          </aside>

          <section className="flex min-h-[680px] flex-col justify-center bg-[#FAF9F7] p-6 sm:p-10 lg:p-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-center">
                <Loader2
                  size={34}
                  className="animate-spin text-[#D8BD8D]"
                  aria-hidden="true"
                />
                <p className="mt-5 text-sm font-medium text-[#283C5D]/60">
                  {t("loading")}
                </p>
              </div>
            ) : errorCode ? (
              <ErrorState
                title={getErrorContent(errorCode).title}
                description={getErrorContent(errorCode).description}
                retryLabel={t("retry")}
                canRetry={errorCode === "UNKNOWN"}
                onRetry={() => void loadInvitation()}
              />
            ) : isSubmitted ? (
              <div className="mx-auto max-w-lg text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={30} aria-hidden="true" />
                </div>

                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#283C5D]">
                  {t("successTitle")}
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#283C5D]/60">
                  {t("successDescription")}
                </p>
              </div>
            ) : invitation ? (
              <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
                <div className="flex flex-col gap-4 border-b border-[#283C5D]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D8BD8D]">
                      {t("formEyebrow")}
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#283C5D]">
                      {t("formTitle")}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#283C5D]/50">
                    <Clock3 size={14} aria-hidden="true" />
                    {t("expires", {
                      date: format.dateTime(
                        new Date(invitation.expiresAt),
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      ),
                    })}
                  </div>
                </div>

                <fieldset className="mt-7">
                  <legend className="text-sm font-semibold text-[#283C5D]">
                    {t("ratingLabel")}
                  </legend>

                  <div
                    className="mt-4 flex items-center gap-2"
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((value) => {
                      const activeValue = hoveredRating || rating;
                      const isActive = value <= activeValue;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoveredRating(value)}
                          aria-label={t("ratingOption", { rating: value })}
                          aria-pressed={rating === value}
                          className="cursor-pointer rounded-xl p-1 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#283C5D] focus-visible:ring-offset-2"
                        >
                          <Star
                            size={34}
                            className={
                              isActive
                                ? "fill-[#D8BD8D] text-[#D8BD8D]"
                                : "text-[#283C5D]/20"
                            }
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-3 min-h-5 text-xs font-medium text-[#283C5D]/50">
                    {rating > 0
                      ? t(`ratingDescriptions.${rating}`)
                      : t("chooseRating")}
                  </p>
                </fieldset>

                <div className="mt-7">
                  <label
                    htmlFor="review-title"
                    className="text-sm font-semibold text-[#283C5D]"
                  >
                    {t("titleLabel")}
                  </label>

                  <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    placeholder={t("titlePlaceholder")}
                    className="mt-3 w-full rounded-2xl border border-[#283C5D]/12 bg-white px-4 py-3.5 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/30 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/15"
                  />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="review-body"
                      className="text-sm font-semibold text-[#283C5D]"
                    >
                      {t("reviewLabel")}
                    </label>

                    <span className="text-xs text-[#283C5D]/35">
                      {review.length}/3000
                    </span>
                  </div>

                  <textarea
                    id="review-body"
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    maxLength={3000}
                    rows={7}
                    placeholder={t("reviewPlaceholder")}
                    className="mt-3 w-full resize-none rounded-2xl border border-[#283C5D]/12 bg-white px-4 py-3.5 text-sm leading-7 text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/30 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/15"
                  />
                </div>

                {formError && (
                  <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-7 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-[#283C5D] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="mr-2 animate-spin"
                        aria-hidden="true"
                      />
                      {t("submitting")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-[#283C5D]/40">
                  {t("submissionNotice")}
                </p>
              </form>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function ErrorState({
  title,
  description,
  retryLabel,
  canRetry,
  onRetry,
}: {
  title: string;
  description: string;
  retryLabel: string;
  canRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#283C5D]/8 text-[#283C5D]">
        <LockKeyhole size={28} aria-hidden="true" />
      </div>

      <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#283C5D]">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-[#283C5D]/60">
        {description}
      </p>

      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-7 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D]"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}