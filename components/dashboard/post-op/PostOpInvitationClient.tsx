/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import Link from "next/link";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  authClient,
} from "@/lib/auth/auth-client";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

type InvitationState =
  | "VALID"
  | "USED"
  | "EXPIRED"
  | "REVOKED"
  | "INVALID";

type InvitationData = {
  recipientName: string;
  recipientEmail: string;

  expiresAt: string;

  accountExists: boolean;

  procedure: {
    name: string;
    performedAt: string;
  };

  doctor: {
    name: string | null;
    clinicName: string;
    avatar: string | null;
  };

  stepCount: number;
};

type ViewerData = {
  authenticated: boolean;

  userId: string | null;
  email: string | null;
  role: string | null;

  emailMatches: boolean;
  accountMatches: boolean;

  claimedByViewer: boolean;
  canClaim: boolean;
};

type InvitationResponse = {
  state: InvitationState;

  invitation?: InvitationData;

  viewer?: ViewerData;

  expiresAt?: string;

  error?: string;
};

type Props = {
  token: string;
};

type Screen =
  | "READY"
  | "SIGN_IN"
  | "SIGN_UP"
  | "VERIFY"
  | "WRONG_ACCOUNT"
  | "USED"
  | "USED_OTHER"
  | "EXPIRED"
  | "REVOKED"
  | "INVALID";

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */

export default function PostOpInvitationClient({
  token,
}: Props) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  const locale =
    useLocale();

  const [
    data,
    setData,
  ] =
    useState<InvitationResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    dateOfBirth,
    setDateOfBirth,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    otp,
    setOtp,
  ] =
    useState("");

  const [
    otpSentAgain,
    setOtpSentAgain,
  ] =
    useState(false);

  const [
    verificationMode,
    setVerificationMode,
  ] =
    useState(false);

  const [
    claimedCaseId,
    setClaimedCaseId,
  ] =
    useState<string | null>(
      null,
    );

  /* ═══════════════════════════════════════
     LOAD INVITATION
  ═══════════════════════════════════════ */

  const loadInvitation =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await fetch(
              `/api/post-op/invitations/${encodeURIComponent(
                token,
              )}`,
              {
                cache:
                  "no-store",
              },
            );

          const body =
            (await response.json()) as InvitationResponse;

          /*
           * INVALID / EXPIRED / REVOKED intentionally
           * return 404 / 410, but they are valid UI states.
           */
          if (
            body.state ===
              "INVALID" ||
            body.state ===
              "EXPIRED" ||
            body.state ===
              "REVOKED" ||
            body.state ===
              "USED" ||
            body.state ===
              "VALID"
          ) {
            setData(body);
            return;
          }

          throw new Error(
            body.error ??
              t(
                "errors.load",
              ),
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : t(
                  "errors.load",
                ),
          );

          setData({
            state:
              "INVALID",
          });
        } finally {
          setLoading(false);
        }
      },
      [
        t,
        token,
      ],
    );

  useEffect(() => {
    void loadInvitation();
  }, [loadInvitation]);

  /* ═══════════════════════════════════════
     SCREEN RESOLUTION
  ═══════════════════════════════════════ */

  const screen =
    useMemo<Screen>(() => {
      if (
        verificationMode
      ) {
        return "VERIFY";
      }

      if (!data) {
        return "INVALID";
      }

      if (
        data.state ===
        "EXPIRED"
      ) {
        return "EXPIRED";
      }

      if (
        data.state ===
        "REVOKED"
      ) {
        return "REVOKED";
      }

      if (
        data.state ===
        "INVALID"
      ) {
        return "INVALID";
      }

      const viewer =
        data.viewer;

      const invitation =
        data.invitation;

      /*
       * Already claimed.
       */
      if (
        data.state ===
        "USED"
      ) {
        if (
          viewer
            ?.claimedByViewer
        ) {
          return "USED";
        }

        if (
          viewer
            ?.authenticated &&
          !viewer.accountMatches
        ) {
          return "WRONG_ACCOUNT";
        }

        if (
          viewer
            ?.authenticated &&
          viewer.accountMatches
        ) {
          return "USED_OTHER";
        }

        /*
         * Logged out:
         * allow the intended patient to
         * authenticate, then POST claim()
         * acts idempotently.
         */
        return "SIGN_IN";
      }

      /*
       * Valid + authenticated.
       */
      if (
        viewer?.authenticated
      ) {
        if (
          viewer.accountMatches
        ) {
          return "READY";
        }

        return "WRONG_ACCOUNT";
      }

      /*
       * Valid + logged out.
       */
      if (
        invitation?.accountExists
      ) {
        return "SIGN_IN";
      }

      return "SIGN_UP";
    }, [
      data,
      verificationMode,
    ]);

  /* ═══════════════════════════════════════
     CLAIM
  ═══════════════════════════════════════ */

  async function claim() {
    setSubmitting(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/post-op/invitations/${encodeURIComponent(
            token,
          )}`,
          {
            method:
              "POST",
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            t(
              "errors.claim",
            ),
        );
      }

      setClaimedCaseId(
        result.caseId,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.claim",
            ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ═══════════════════════════════════════
     SIGN IN
  ═══════════════════════════════════════ */

  async function signIn() {
    const email =
      data?.invitation
        ?.recipientEmail;

    if (
      !email ||
      !password
    ) {
      setError(
        t(
          "errors.passwordRequired",
        ),
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result =
        await authClient.signIn.email({
          email,
          password,
        });

      if (result.error) {
        throw new Error(
          result.error
            .message ??
            t(
              "errors.signIn",
            ),
        );
      }

      /*
       * Claim immediately.
       *
       * The backend checks the newly-created
       * authenticated session itself.
       */
      await claim();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.signIn",
            ),
      );

      setSubmitting(false);
    }
  }

  /* ═══════════════════════════════════════
     SIGN UP
  ═══════════════════════════════════════ */

  async function signUp() {
    const invitation =
      data?.invitation;

    if (!invitation) {
      return;
    }

    setError(null);

    if (!dateOfBirth) {
      setError(
        t(
          "errors.dateOfBirth",
        ),
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        t(
          "errors.passwordLength",
        ),
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        t(
          "errors.passwordMismatch",
        ),
      );

      return;
    }

    setSubmitting(true);

    try {
      const result =
        await authClient.signUp.email({
          email:
            invitation.recipientEmail,

          name:
            invitation.recipientName,

          password,

          role:
            "PATIENT",

          dateOfBirth,
        });

      if (result.error) {
        throw new Error(
          result.error
            .message ??
            t(
              "errors.signUp",
            ),
        );
      }

      /*
       * Better Auth already sends the
       * verification OTP on signup.
       */
      setVerificationMode(
        true,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.signUp",
            ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ═══════════════════════════════════════
     VERIFY
  ═══════════════════════════════════════ */

  async function verifyOtp() {
    const email =
      data?.invitation
        ?.recipientEmail;

    if (
      !email ||
      otp.length !== 6
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const verification =
        await authClient.emailOtp.verifyEmail(
          {
            email,
            otp,
          },
        );

      if (
        verification.error
      ) {
        throw new Error(
          verification.error
            .message ??
            t(
              "errors.invalidOtp",
            ),
        );
      }

      /*
       * Verification does not need to be
       * assumed to create a session.
       * Explicitly sign in afterward.
       */
      const signInResult =
        await authClient.signIn.email({
          email,
          password,
        });

      if (
        signInResult.error
      ) {
        throw new Error(
          signInResult.error
            .message ??
            t(
              "errors.signInAfterVerification",
            ),
        );
      }

      await claim();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.invalidOtp",
            ),
      );

      setSubmitting(false);
    }
  }

  async function resendOtp() {
    const email =
      data?.invitation
        ?.recipientEmail;

    if (!email) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setOtpSentAgain(false);

    try {
      const result =
        await authClient.emailOtp.sendVerificationOtp(
          {
            email,

            type:
              "email-verification",
          },
        );

      if (result.error) {
        throw new Error(
          result.error
            .message ??
            t(
              "errors.resendOtp",
            ),
        );
      }

      setOtpSentAgain(
        true,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.resendOtp",
            ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ═══════════════════════════════════════
     WRONG ACCOUNT
  ═══════════════════════════════════════ */

  async function signOutWrongAccount() {
    setSubmitting(true);
    setError(null);

    try {
      await authClient.signOut();

      setPassword("");

      await loadInvitation();
    } catch {
      setError(
        t(
          "errors.signOut",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ═══════════════════════════════════════
     LOADING
  ═══════════════════════════════════════ */

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[680px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_15px_50px_rgba(40,60,93,0.08)]">
              <Loader2 className="size-5 animate-spin text-[#283C5D]" />
            </div>

            <p className="mt-4 text-sm text-neutral-400">
              {t(
                "loading",
              )}
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ═══════════════════════════════════════
     HARD STATES
  ═══════════════════════════════════════ */

  if (
    screen ===
    "INVALID"
  ) {
    return (
      <PageShell>
        <StandaloneState
          icon={
            <XCircle className="size-6" />
          }
          eyebrow={t(
            "invalid.eyebrow",
          )}
          title={t(
            "invalid.title",
          )}
          description={t(
            "invalid.description",
          )}
        />
      </PageShell>
    );
  }

  if (
    screen ===
    "EXPIRED"
  ) {
    return (
      <PageShell>
        <StandaloneState
          icon={
            <Clock3 className="size-6" />
          }
          eyebrow={t(
            "expired.eyebrow",
          )}
          title={t(
            "expired.title",
          )}
          description={t(
            "expired.description",
          )}
          accent="warning"
        />
      </PageShell>
    );
  }

  if (
    screen ===
    "REVOKED"
  ) {
    return (
      <PageShell>
        <StandaloneState
          icon={
            <ShieldCheck className="size-6" />
          }
          eyebrow={t(
            "revoked.eyebrow",
          )}
          title={t(
            "revoked.title",
          )}
          description={t(
            "revoked.description",
          )}
        />
      </PageShell>
    );
  }

  if (
    !data?.invitation
  ) {
    return null;
  }

  const invitation =
    data.invitation;

  /* ═══════════════════════════════════════
     CLAIM SUCCESS
  ═══════════════════════════════════════ */

  if (claimedCaseId) {
    return (
      <PageShell>
        <div className="flex min-h-[680px] items-center justify-center p-6 md:p-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="w-full max-w-lg text-center"
          >
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em] text-[#283C5D]">
              {t(
                "success.title",
              )}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
              {t(
                "success.description",
              )}
            </p>

            <Link
              href={`/${locale}/dashboard`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#21334F]"
            >
              {t(
                "success.continue",
              )}

              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  /* ═══════════════════════════════════════
     MAIN EXPERIENCE
  ═══════════════════════════════════════ */

  return (
    <PageShell>
      <div className="grid min-h-[680px] lg:grid-cols-[0.92fr_1.08fr]">
        <RecoverySummary
          invitation={
            invitation
          }
        />

        <section className="flex min-h-[580px] items-center bg-white p-6 md:p-9 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <AnimatePresence
              mode="wait"
            >
              <motion.div
                key={screen}
                initial={{
                  opacity: 0,
                  x: 10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -10,
                }}
                transition={{
                  duration:
                    0.22,
                }}
              >
                {error && (
                  <ErrorNotice
                    message={
                      error
                    }
                    onClose={() =>
                      setError(
                        null,
                      )
                    }
                  />
                )}

                {screen ===
                  "READY" && (
                  <ReadyPanel
                    invitation={
                      invitation
                    }
                    viewer={
                      data.viewer
                    }
                    submitting={
                      submitting
                    }
                    onClaim={() =>
                      void claim()
                    }
                  />
                )}

                {screen ===
                  "SIGN_IN" && (
                  <SignInPanel
                    invitation={
                      invitation
                    }
                    used={
                      data.state ===
                      "USED"
                    }
                    password={
                      password
                    }
                    setPassword={
                      setPassword
                    }
                    showPassword={
                      showPassword
                    }
                    setShowPassword={
                      setShowPassword
                    }
                    submitting={
                      submitting
                    }
                    onSubmit={() =>
                      void signIn()
                    }
                  />
                )}

                {screen ===
                  "SIGN_UP" && (
                  <SignUpPanel
                    invitation={
                      invitation
                    }
                    password={
                      password
                    }
                    setPassword={
                      setPassword
                    }
                    confirmPassword={
                      confirmPassword
                    }
                    setConfirmPassword={
                      setConfirmPassword
                    }
                    dateOfBirth={
                      dateOfBirth
                    }
                    setDateOfBirth={
                      setDateOfBirth
                    }
                    showPassword={
                      showPassword
                    }
                    setShowPassword={
                      setShowPassword
                    }
                    submitting={
                      submitting
                    }
                    onSubmit={() =>
                      void signUp()
                    }
                  />
                )}

                {screen ===
                  "VERIFY" && (
                  <VerifyPanel
                    email={
                      invitation.recipientEmail
                    }
                    otp={otp}
                    setOtp={
                      setOtp
                    }
                    submitting={
                      submitting
                    }
                    resent={
                      otpSentAgain
                    }
                    onVerify={() =>
                      void verifyOtp()
                    }
                    onResend={() =>
                      void resendOtp()
                    }
                  />
                )}

                {screen ===
                  "WRONG_ACCOUNT" && (
                  <WrongAccountPanel
                    intendedEmail={
                      invitation.recipientEmail
                    }
                    viewerEmail={
                      data.viewer
                        ?.email ??
                      ""
                    }
                    submitting={
                      submitting
                    }
                    onSignOut={() =>
                      void signOutWrongAccount()
                    }
                  />
                )}

                {screen ===
                  "USED" && (
                  <AlreadyUsedPanel
                    locale={
                      locale
                    }
                  />
                )}

                {screen ===
                  "USED_OTHER" && (
                  <AlreadyUsedOtherPanel />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RECOVERY SUMMARY
═══════════════════════════════════════════════════════════════ */

function RecoverySummary({
  invitation,
}: {
  invitation: InvitationData;
}) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  const locale =
    useLocale();

  const date =
    new Intl.DateTimeFormat(
      locale === "fr"
        ? "fr-FR"
        : "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(
      new Date(
        invitation.procedure
          .performedAt,
      ),
    );

  const time =
    new Intl.DateTimeFormat(
      locale === "fr"
        ? "fr-FR"
        : "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(
      new Date(
        invitation.procedure
          .performedAt,
      ),
    );

  const doctorName =
    invitation.doctor.name ||
    invitation.doctor
      .clinicName;

  return (
    <section className="relative overflow-hidden bg-[#283C5D] p-7 text-white md:p-10 lg:p-12">
      <div className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full bg-[#D8BD8D]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-24 size-72 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative flex h-full flex-col">
        <div>
          <div className="inline-flex items-center gap-2 text-[#D8BD8D]">
            <Sparkles className="size-4" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Esthetic Match PostOp
            </span>
          </div>

          <h1 className="mt-7 max-w-sm text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
            {t(
              "summary.title",
            )}
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
            {t(
              "summary.description",
            )}
          </p>
        </div>

        <div className="mt-9 space-y-3">
          <SummaryItem
            icon={
              <Stethoscope className="size-4" />
            }
            label={t(
              "summary.procedure",
            )}
            value={
              invitation
                .procedure.name
            }
          />

          <SummaryItem
            icon={
              <CalendarDays className="size-4" />
            }
            label={t(
              "summary.date",
            )}
            value={date}
            secondary={
              time
            }
          />

          <SummaryItem
            icon={
              <ShieldCheck className="size-4" />
            }
            label={t(
              "summary.plan",
            )}
            value={t(
              "summary.steps",
              {
                count:
                  invitation.stepCount,
              },
            )}
          />
        </div>

        <div className="mt-auto pt-10">
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              {invitation.doctor
                .avatar ? (
                <img
                  src={
                    invitation
                      .doctor
                      .avatar
                  }
                  alt=""
                  className="size-11 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="flex size-11 items-center justify-center rounded-full bg-white/10">
                  <Stethoscope className="size-4 text-[#D8BD8D]" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  {t(
                    "summary.preparedBy",
                  )}
                </p>

                <p className="mt-1 truncate text-sm font-semibold">
                  {doctorName}
                </p>

                {invitation.doctor
                  .name &&
                  invitation.doctor
                    .clinicName && (
                    <p className="mt-0.5 truncate text-xs text-white/45">
                      {
                        invitation
                          .doctor
                          .clinicName
                      }
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   READY
═══════════════════════════════════════════════════════════════ */

function ReadyPanel({
  invitation,
  viewer,
  submitting,
  onClaim,
}: {
  invitation: InvitationData;

  viewer:
    | ViewerData
    | undefined;

  submitting: boolean;

  onClaim: () => void;
}) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <div>
      <PanelIcon>
        <Check className="size-5" />
      </PanelIcon>

      <Eyebrow>
        {t(
          "ready.eyebrow",
        )}
      </Eyebrow>

      <PanelTitle>
        {t(
          "ready.title",
          {
            name:
              invitation.recipientName,
          },
        )}
      </PanelTitle>

      <PanelDescription>
        {t(
          "ready.description",
        )}
      </PanelDescription>

      <div className="mt-6 rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#283C5D] shadow-sm">
            <UserRound className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#283C5D]">
              {
                invitation.recipientName
              }
            </p>

            <p className="truncate text-xs text-neutral-400">
              {viewer?.email}
            </p>
          </div>

          <div className="ml-auto flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="size-3.5" />
          </div>
        </div>
      </div>

      <PrimaryButton
        onClick={
          onClaim
        }
        disabled={
          submitting
        }
        className="mt-6 w-full"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}

        {t(
          "ready.button",
        )}
      </PrimaryButton>

      <SecurityNote />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIGN IN
═══════════════════════════════════════════════════════════════ */

function SignInPanel({
  invitation,
  used,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  submitting,
  onSubmit,
}: {
  invitation: InvitationData;

  used: boolean;

  password: string;

  setPassword: (
    value: string,
  ) => void;

  showPassword: boolean;

  setShowPassword: (
    value: boolean,
  ) => void;

  submitting: boolean;

  onSubmit: () => void;
}) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <form
      onSubmit={(
        event,
      ) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <PanelIcon>
        <LockKeyhole className="size-5" />
      </PanelIcon>

      <Eyebrow>
        {used
          ? t(
              "used.eyebrow",
            )
          : t(
              "signIn.eyebrow",
            )}
      </Eyebrow>

      <PanelTitle>
        {used
          ? t(
              "used.signInTitle",
            )
          : t(
              "signIn.title",
            )}
      </PanelTitle>

      <PanelDescription>
        {used
          ? t(
              "used.signInDescription",
            )
          : t(
              "signIn.description",
            )}
      </PanelDescription>

      <div className="mt-7 space-y-4">
        <Field>
          <FieldLabel>
            {t(
              "email",
            )}
          </FieldLabel>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

            <input
              value={
                invitation.recipientEmail
              }
              readOnly
              className={`${inputClass} bg-[#FAF9F7] pl-11 text-neutral-500`}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>
            {t(
              "password",
            )}
          </FieldLabel>

          <PasswordInput
            value={
              password
            }
            onChange={
              setPassword
            }
            visible={
              showPassword
            }
            setVisible={
              setShowPassword
            }
          />
        </Field>
      </div>

      <PrimaryButton
        type="submit"
        disabled={
          submitting ||
          !password
        }
        className="mt-6 w-full"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}

        {t(
          "signIn.button",
        )}
      </PrimaryButton>

      <SecurityNote />
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIGN UP
═══════════════════════════════════════════════════════════════ */

function SignUpPanel({
  invitation,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  dateOfBirth,
  setDateOfBirth,
  showPassword,
  setShowPassword,
  submitting,
  onSubmit,
}: {
  invitation: InvitationData;

  password: string;

  setPassword: (
    value: string,
  ) => void;

  confirmPassword: string;

  setConfirmPassword: (
    value: string,
  ) => void;

  dateOfBirth: string;

  setDateOfBirth: (
    value: string,
  ) => void;

  showPassword: boolean;

  setShowPassword: (
    value: boolean,
  ) => void;

  submitting: boolean;

  onSubmit: () => void;
}) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <form
      onSubmit={(
        event,
      ) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <PanelIcon>
        <Sparkles className="size-5" />
      </PanelIcon>

      <Eyebrow>
        {t(
          "signUp.eyebrow",
        )}
      </Eyebrow>

      <PanelTitle>
        {t(
          "signUp.title",
          {
            name:
              invitation.recipientName,
          },
        )}
      </PanelTitle>

      <PanelDescription>
        {t(
          "signUp.description",
        )}
      </PanelDescription>

      <div className="mt-7 space-y-4">
        <Field>
          <FieldLabel>
            {t(
              "email",
            )}
          </FieldLabel>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

            <input
              value={
                invitation.recipientEmail
              }
              readOnly
              className={`${inputClass} bg-[#FAF9F7] pl-11 text-neutral-500`}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>
            {t(
              "dateOfBirth",
            )}
          </FieldLabel>

          <input
            type="date"
            value={
              dateOfBirth
            }
            onChange={(
              event,
            ) =>
              setDateOfBirth(
                event
                  .target
                  .value,
              )
            }
            className={
              inputClass
            }
          />
        </Field>

        <Field>
          <FieldLabel>
            {t(
              "password",
            )}
          </FieldLabel>

          <PasswordInput
            value={
              password
            }
            onChange={
              setPassword
            }
            visible={
              showPassword
            }
            setVisible={
              setShowPassword
            }
          />
        </Field>

        <Field>
          <FieldLabel>
            {t(
              "confirmPassword",
            )}
          </FieldLabel>

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={
              confirmPassword
            }
            onChange={(
              event,
            ) =>
              setConfirmPassword(
                event
                  .target
                  .value,
              )
            }
            autoComplete="new-password"
            className={
              inputClass
            }
          />
        </Field>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#FAF9F7] px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#B4945A]" />

        <p className="text-[11px] leading-5 text-neutral-500">
          {t(
            "signUp.privacy",
          )}
        </p>
      </div>

      <PrimaryButton
        type="submit"
        disabled={
          submitting
        }
        className="mt-5 w-full"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}

        {t(
          "signUp.button",
        )}
      </PrimaryButton>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OTP
═══════════════════════════════════════════════════════════════ */

function VerifyPanel({
  email,
  otp,
  setOtp,
  submitting,
  resent,
  onVerify,
  onResend,
}: {
  email: string;

  otp: string;

  setOtp: (
    value: string,
  ) => void;

  submitting: boolean;

  resent: boolean;

  onVerify: () => void;

  onResend: () => void;
}) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <form
      onSubmit={(
        event,
      ) => {
        event.preventDefault();
        onVerify();
      }}
    >
      <PanelIcon>
        <KeyRound className="size-5" />
      </PanelIcon>

      <Eyebrow>
        {t(
          "verify.eyebrow",
        )}
      </Eyebrow>

      <PanelTitle>
        {t(
          "verify.title",
        )}
      </PanelTitle>

      <PanelDescription>
        {t(
          "verify.description",
          {
            email,
          },
        )}
      </PanelDescription>

      <div className="mt-8">
        <input
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(
            event,
          ) =>
            setOtp(
              event.target.value
                .replace(
                  /\D/g,
                  "",
                )
                .slice(
                  0,
                  6,
                ),
            )
          }
          placeholder="000000"
          className="w-full rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-4 text-center text-2xl font-semibold tracking-[0.42em] text-[#283C5D] outline-none transition placeholder:text-neutral-200 focus:border-[#D8BD8D] focus:bg-white focus:ring-4 focus:ring-[#D8BD8D]/10"
        />

        <p className="mt-2 text-center text-xs text-neutral-400">
          {t(
            "verify.expires",
          )}
        </p>
      </div>

      {resent && (
        <motion.div
          initial={{
            opacity: 0,
            y: -4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600"
        >
          <Check className="size-3.5" />

          {t(
            "verify.resent",
          )}
        </motion.div>
      )}

      <PrimaryButton
        type="submit"
        disabled={
          submitting ||
          otp.length !== 6
        }
        className="mt-6 w-full"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}

        {t(
          "verify.button",
        )}
      </PrimaryButton>

      <button
        type="button"
        disabled={
          submitting
        }
        onClick={
          onResend
        }
        className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-semibold text-[#B4945A] transition hover:text-[#92733F] disabled:opacity-50"
      >
        <RefreshCw className="size-3.5" />

        {t(
          "verify.resend",
        )}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WRONG ACCOUNT
═══════════════════════════════════════════════════════════════ */

function WrongAccountPanel({
  intendedEmail,
  viewerEmail,
  submitting,
  onSignOut,
}: {
  intendedEmail: string;

  viewerEmail: string;

  submitting: boolean;

  onSignOut: () => void;
}) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <div>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <AlertTriangle className="size-5" />
      </div>

      <Eyebrow>
        {t(
          "wrongAccount.eyebrow",
        )}
      </Eyebrow>

      <PanelTitle>
        {t(
          "wrongAccount.title",
        )}
      </PanelTitle>

      <PanelDescription>
        {t(
          "wrongAccount.description",
        )}
      </PanelDescription>

      <div className="mt-6 space-y-2">
        <EmailRow
          label={t(
            "wrongAccount.invited",
          )}
          value={
            intendedEmail
          }
          correct
        />

        <EmailRow
          label={t(
            "wrongAccount.current",
          )}
          value={
            viewerEmail
          }
        />
      </div>

      <PrimaryButton
        onClick={
          onSignOut
        }
        disabled={
          submitting
        }
        className="mt-6 w-full"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}

        {t(
          "wrongAccount.button",
        )}
      </PrimaryButton>

      <SecurityNote />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USED
═══════════════════════════════════════════════════════════════ */

function AlreadyUsedPanel({
  locale,
}: {
  locale: string;
}) {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <div>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-5" />
      </div>

      <Eyebrow>
        {t(
          "used.eyebrow",
        )}
      </Eyebrow>

      <PanelTitle>
        {t(
          "used.title",
        )}
      </PanelTitle>

      <PanelDescription>
        {t(
          "used.description",
        )}
      </PanelDescription>

      <Link
        href={`/${locale}/dashboard`}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#21334F]"
      >
        {t(
          "used.button",
        )}

        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function AlreadyUsedOtherPanel() {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <div>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
        <LockKeyhole className="size-5" />
      </div>

      <Eyebrow>
        {t(
          "used.eyebrow",
        )}
      </Eyebrow>

      <PanelTitle>
        {t(
          "used.otherTitle",
        )}
      </PanelTitle>

      <PanelDescription>
        {t(
          "used.otherDescription",
        )}
      </PanelDescription>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HARD STATE
═══════════════════════════════════════════════════════════════ */

function StandaloneState({
  icon,
  eyebrow,
  title,
  description,
  accent = "default",
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;

  accent?:
    | "default"
    | "warning";
}) {
  return (
    <div className="flex min-h-[680px] items-center justify-center p-6 md:p-10">
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="max-w-md text-center"
      >
        <div className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${
          accent ===
          "warning"
            ? "bg-amber-50 text-amber-600"
            : "bg-[#283C5D]/[0.06] text-[#283C5D]"
        }`}>
          {icon}
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B4945A]">
          {eyebrow}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#283C5D]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-neutral-500">
          {description}
        </p>

        <div className="mx-auto mt-7 flex max-w-xs items-start gap-2 rounded-2xl bg-[#FAF9F7] p-4 text-left">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#B4945A]" />

          <p className="text-xs leading-5 text-neutral-500">
            {description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════════════ */

const inputClass =
  "w-full rounded-xl border border-[#283C5D]/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition placeholder:text-neutral-300 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10";

function PageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#FAF9F7] px-4 py-6 md:px-6 md:py-10">
      <div className="pointer-events-none absolute left-[8%] top-[8%] size-64 rounded-full bg-[#D8BD8D]/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[5%] right-[6%] size-72 rounded-full bg-[#283C5D]/[0.04] blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_30px_100px_rgba(40,60,93,0.10)]">
        {children}
      </div>
    </main>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  secondary,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.055] p-4 backdrop-blur-sm transition hover:bg-white/[0.075]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-[#D8BD8D]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
          {label}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2">
          <p className="truncate text-sm font-semibold text-white">
            {value}
          </p>

          {secondary && (
            <span className="text-xs text-white/40">
              {secondary}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PanelIcon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#B4945A]">
      {children}
    </div>
  );
}

function Eyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#B4945A]">
      {children}
    </p>
  );
}

function PanelTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#283C5D] md:text-[1.75rem]">
      {children}
    </h2>
  );
}

function PanelDescription({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="mt-2 text-sm leading-6 text-neutral-500">
      {children}
    </p>
  );
}

function Field({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <label className="block">
      {children}
    </label>
  );
}

function FieldLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="mb-2 block text-xs font-semibold text-[#283C5D]">
      {children}
    </span>
  );
}

function PasswordInput({
  value,
  onChange,
  visible,
  setVisible,
}: {
  value: string;

  onChange: (
    value: string,
  ) => void;

  visible: boolean;

  setVisible: (
    value: boolean,
  ) => void;
}) {
  return (
    <div className="relative">
      <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

      <input
        type={
          visible
            ? "text"
            : "password"
        }
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        autoComplete="current-password"
        className={`${inputClass} pl-11 pr-11`}
      />

      <button
        type="button"
        onClick={() =>
          setVisible(
            !visible,
          )
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-[#283C5D]"
      >
        {visible ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
}

function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#21334F] hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function ErrorNotice({
  message,
  onClose,
}: {
  message: string;

  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
        className="shrink-0"
      >
        <XCircle className="size-4" />
      </button>
    </motion.div>
  );
}

function EmailRow({
  label,
  value,
  correct = false,
}: {
  label: string;
  value: string;
  correct?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
      correct
        ? "border-emerald-100 bg-emerald-50/70"
        : "border-neutral-100 bg-[#FAF9F7]"
    }`}>
      <Mail className={`size-4 shrink-0 ${
        correct
          ? "text-emerald-600"
          : "text-neutral-400"
      }`} />

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-medium text-[#283C5D]">
          {value}
        </p>
      </div>

      {correct && (
        <Check className="size-4 text-emerald-600" />
      )}
    </div>
  );
}

function SecurityNote() {
  const t =
    useTranslations(
      "postOp.invitation",
    );

  return (
    <div className="mt-5 flex items-start justify-center gap-2 text-center">
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#B4945A]" />

      <p className="max-w-xs text-[11px] leading-5 text-neutral-400">
        {t(
          "security",
        )}
      </p>
    </div>
  );
}