"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useLocale,
} from "next-intl";

import {
  authClient,
} from "@/lib/auth/auth-client";

type InvitationState =
  | "VALID"
  | "USED"
  | "EXPIRED"
  | "REVOKED"
  | "INVALID";

type InviteData = {
  state: InvitationState;

  invitation?: {
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
};

type Props = {
  token: string;
};

type AuthMode =
  | "SIGN_IN"
  | "SIGN_UP"
  | "VERIFY";

async function api<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response =
    await fetch(
      url,
      init,
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ??
        "Something went wrong.",
    );
  }

  return data;
}

export default function PostOpInvitationClient({
  token,
}: Props) {
  const locale =
    useLocale();

  const {
    data: session,
    isPending:
      sessionPending,
    refetch:
      refetchSession,
  } =
    authClient.useSession();

  const [
    invitation,
    setInvitation,
  ] =
    useState<InviteData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    authMode,
    setAuthMode,
  ] =
    useState<AuthMode>(
      "SIGN_IN",
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
    otp,
    setOtp,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    claimedCaseId,
    setClaimedCaseId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const loadInvitation =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const data =
            await api<InviteData>(
              `/api/post-op/invitations/${encodeURIComponent(
                token,
              )}`,
            );

          setInvitation(
            data,
          );

          if (
            data.invitation
              ?.accountExists
          ) {
            setAuthMode(
              "SIGN_IN",
            );
          } else {
            setAuthMode(
              "SIGN_UP",
            );
          }
        } catch (
          err
        ) {
          setError(
            err instanceof
              Error
              ? err.message
              : "Unable to load this invitation.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [token],
    );

  useEffect(() => {
    void loadInvitation();
  }, [loadInvitation]);

  async function claim() {
    setSubmitting(true);
    setError(null);

    try {
      const result =
        await api<{
          success: boolean;

          caseId: string;

          alreadyClaimed:
            boolean;
        }>(
          `/api/post-op/invitations/${encodeURIComponent(
            token,
          )}`,
          {
            method:
              "POST",
          },
        );

      setClaimedCaseId(
        result.caseId,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate your recovery plan.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Existing patient.
   */
  async function signIn() {
    const email =
      invitation
        ?.invitation
        ?.recipientEmail;

    if (
      !email ||
      !password
    ) {
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
            "Unable to sign in.",
        );
      }

      await refetchSession();

      await claim();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * New patient.
   */
  async function signUp() {
    const details =
      invitation?.invitation;

    if (!details) {
      return;
    }

    if (
      !dateOfBirth
    ) {
      setError(
        "Please enter your date of birth.",
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result =
        await authClient.signUp.email({
          email:
            details.recipientEmail,

          password,

          name:
            details.recipientName,

          role:
            "PATIENT",

          dateOfBirth,
        });

      if (result.error) {
        throw new Error(
          result.error
            .message ??
            "Unable to create account.",
        );
      }

      /*
       * Your auth configuration already
       * sends the verification OTP on signup.
       */
      setAuthMode(
        "VERIFY",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp() {
    const email =
      invitation
        ?.invitation
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
      const verified =
        await authClient.emailOtp.verifyEmail({
          email,
          otp,
        });

      if (
        verified.error
      ) {
        throw new Error(
          verified.error
            .message ??
            "Invalid verification code.",
        );
      }

      /*
       * Sign in after verification to make
       * sure we have an authenticated session.
       */
      const signedIn =
        await authClient.signIn.email({
          email,
          password,
        });

      if (
        signedIn.error
      ) {
        throw new Error(
          signedIn.error
            .message ??
            "Email verified, but sign in failed.",
        );
      }

      await refetchSession();

      await claim();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resendOtp() {
    const email =
      invitation
        ?.invitation
        ?.recipientEmail;

    if (!email) {
      return;
    }

    setSubmitting(true);
    setError(null);

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
            "Unable to resend code.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend code.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function signOutWrongAccount() {
    await authClient.signOut();

    await refetchSession();
  }

  if (
    loading ||
    sessionPending
  ) {
    return (
      <InvitationShell>
        <div className="flex min-h-[500px] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[#283C5D]" />
        </div>
      </InvitationShell>
    );
  }

  if (
    !invitation ||
    !invitation.invitation
  ) {
    return (
      <InvitationShell>
        <StateMessage
          title="Invitation unavailable"
          description={
            error ??
            "This recovery invitation could not be found."
          }
        />
      </InvitationShell>
    );
  }

  if (
    invitation.state ===
      "EXPIRED" ||
    invitation.state ===
      "REVOKED" ||
    invitation.state ===
      "INVALID"
  ) {
    return (
      <InvitationShell>
        <StateMessage
          title={
            invitation.state ===
            "EXPIRED"
              ? "Invitation expired"
              : invitation.state ===
                  "REVOKED"
                ? "Invitation revoked"
                : "Invitation unavailable"
          }
          description="Please contact your doctor if you need a new recovery invitation."
        />
      </InvitationShell>
    );
  }

  if (claimedCaseId) {
    return (
      <InvitationShell>
        <div className="px-6 py-12 text-center md:px-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-[#283C5D]">
            Your recovery journey is ready
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Your recovery plan has been connected to your Esthetic Match account.
          </p>

          <Link
            href={`/${locale}/dashboard`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#21334F]"
          >
            Go to dashboard

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </InvitationShell>
    );
  }

  const details =
    invitation.invitation;

  const sessionEmail =
    session?.user.email
      ?.trim()
      .toLowerCase();

  const inviteEmail =
    details.recipientEmail
      .trim()
      .toLowerCase();

  const wrongAccount =
    Boolean(
      session &&
        sessionEmail !==
          inviteEmail,
    );

  return (
    <InvitationShell>
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* RECOVERY PLAN */}

        <section className="relative overflow-hidden bg-[#283C5D] p-7 text-white md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-16 size-64 rounded-full bg-[#D8BD8D]/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 text-[#D8BD8D]">
              <Sparkles className="size-4" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                Esthetic Match PostOp
              </span>
            </div>

            <h1 className="mt-6 max-w-md text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              Your personal recovery journey
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
              Your doctor has prepared a recovery plan to guide you through your post-procedure care.
            </p>

            <div className="mt-8 space-y-3">
              <InfoCard
                icon={
                  <Stethoscope className="size-4" />
                }
                label="Procedure"
                value={
                  details.procedure
                    .name
                }
              />

              <InfoCard
                icon={
                  <CalendarDays className="size-4" />
                }
                label="Procedure date"
                value={new Date(
                  details.procedure
                    .performedAt,
                ).toLocaleString()}
              />

              <InfoCard
                icon={
                  <ShieldCheck className="size-4" />
                }
                label="Recovery plan"
                value={`${details.stepCount} recovery steps`}
              />

              <InfoCard
                icon={
                  <UserRound className="size-4" />
                }
                label="Doctor"
                value={
                  details.doctor
                    .name ||
                  details.doctor
                    .clinicName
                }
              />
            </div>
          </div>
        </section>

        {/* AUTH / CLAIM */}

        <section className="p-6 md:p-10">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {session &&
          !wrongAccount ? (
            <div className="flex h-full flex-col justify-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#B4945A]">
                <ShieldCheck className="size-5" />
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-[#283C5D]">
                Welcome back,{" "}
                {details.recipientName}
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                You're signed in with the account this invitation was sent to.
              </p>

              <button
                type="button"
                onClick={() =>
                  void claim()
                }
                disabled={
                  submitting
                }
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#21334F] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}

                Open my recovery plan
              </button>
            </div>
          ) : wrongAccount ? (
            <div className="flex h-full flex-col justify-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Mail className="size-5" />
              </div>

              <h2 className="mt-5 text-2xl font-semibold text-[#283C5D]">
                Different account signed in
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                This invitation was sent to{" "}
                <strong>
                  {details.recipientEmail}
                </strong>
                , but you're currently signed in as{" "}
                <strong>
                  {session?.user.email}
                </strong>
                .
              </p>

              <button
                type="button"
                onClick={() =>
                  void signOutWrongAccount()
                }
                className="mt-7 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white"
              >
                Sign out and continue
              </button>
            </div>
          ) : authMode ===
            "VERIFY" ? (
            <OtpPanel
              email={
                details.recipientEmail
              }
              otp={otp}
              setOtp={
                setOtp
              }
              submitting={
                submitting
              }
              onVerify={() =>
                void verifyOtp()
              }
              onResend={() =>
                void resendOtp()
              }
            />
          ) : (
            <div>
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B4945A]">
                  Secure access
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#283C5D]">
                  {authMode ===
                  "SIGN_IN"
                    ? "Sign in to continue"
                    : "Create your patient account"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  {authMode ===
                  "SIGN_IN"
                    ? "Use the Esthetic Match account associated with this invitation."
                    : "Create your account to securely access your recovery journey."}
                </p>
              </div>

              <label className="block">
                <span className={labelClass}>
                  Email
                </span>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    value={
                      details.recipientEmail
                    }
                    readOnly
                    className={`${inputClass} bg-neutral-50 pl-11 text-neutral-500`}
                  />
                </div>
              </label>

              {authMode ===
                "SIGN_UP" && (
                <label className="mt-4 block">
                  <span className={labelClass}>
                    Date of birth
                  </span>

                  <input
                    type="date"
                    value={
                      dateOfBirth
                    }
                    onChange={(
                      event,
                    ) =>
                      setDateOfBirth(
                        event.target
                          .value,
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </label>
              )}

              <label className="mt-4 block">
                <span className={labelClass}>
                  Password
                </span>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    className={`${inputClass} pl-11 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </label>

              {authMode ===
                "SIGN_UP" && (
                <label className="mt-4 block">
                  <span className={labelClass}>
                    Confirm password
                  </span>

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
                        event.target
                          .value,
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </label>
              )}

              <button
                type="button"
                onClick={() =>
                  authMode ===
                  "SIGN_IN"
                    ? void signIn()
                    : void signUp()
                }
                disabled={
                  submitting
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#21334F] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}

                {authMode ===
                "SIGN_IN"
                  ? "Sign in and continue"
                  : "Create account"}
              </button>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(
                      null,
                    );

                    setAuthMode(
                      authMode ===
                        "SIGN_IN"
                        ? "SIGN_UP"
                        : "SIGN_IN",
                    );
                  }}
                  className="text-sm font-medium text-[#B4945A]"
                >
                  {authMode ===
                  "SIGN_IN"
                    ? "Don't have an account? Create one"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </InvitationShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OTP
═══════════════════════════════════════════════════════════════ */

function OtpPanel({
  email,
  otp,
  setOtp,
  submitting,
  onVerify,
  onResend,
}: {
  email: string;

  otp: string;

  setOtp: (
    value: string,
  ) => void;

  submitting: boolean;

  onVerify: () => void;

  onResend: () => void;
}) {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#B4945A]">
        <Mail className="size-5" />
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-[#283C5D]">
        Verify your email
      </h2>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        We sent a six-digit verification code to{" "}
        <strong>
          {email}
        </strong>
        .
      </p>

      <input
        inputMode="numeric"
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
        className="mt-7 w-full rounded-2xl border border-[#283C5D]/10 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10"
      />

      <button
        type="button"
        onClick={
          onVerify
        }
        disabled={
          submitting ||
          otp.length !== 6
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}

        Verify and open recovery plan
      </button>

      <button
        type="button"
        onClick={
          onResend
        }
        disabled={
          submitting
        }
        className="mt-4 text-sm font-medium text-[#B4945A]"
      >
        Resend verification code
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════════════ */

const inputClass =
  "w-full rounded-xl border border-[#283C5D]/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10";

const labelClass =
  "mb-2 block text-xs font-semibold text-[#283C5D]";

function InvitationShell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#FAF9F7] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_30px_100px_rgba(40,60,93,0.10)]">
        {children}
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#D8BD8D]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/40">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function StateMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#B4945A]">
        <ShieldCheck className="size-6" />
      </div>

      <h1 className="mt-5 text-2xl font-semibold text-[#283C5D]">
        {title}
      </h1>

      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}