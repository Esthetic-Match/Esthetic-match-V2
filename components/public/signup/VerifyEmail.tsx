"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/auth-client";

type VerifyEmailProps = {
  email: string;
  role: string;
  onVerified?: () => void;
};

export default function VerifyEmail({
  email,
  onVerified,
}: VerifyEmailProps) {
  const router = useRouter();
  const t = useTranslations("home.Home");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) {
      setError(t("missingEmail"));
      return;
    }

    if (otp.length !== 6) {
      setError(t("invalidOtpLength"));
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp,
    });

    if (error) {
      setLoading(false);
      setError(error.message || t("invalidOtp"));
      return;
    }

    setLoading(false);

    if (onVerified) {
      onVerified();
      return;
    }

    router.push("/sign-in");
  }

  async function handleResendCode() {
    if (!email) {
      setError(t("missingEmail"));
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    setResending(false);

    if (error) {
      setError(error.message || t("resendError"));
      return;
    }

    setMessage(t("resendSuccess"));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-6">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#283C5D]">
            {t("verifyTitle")}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-black/50">
            {t("verifySubtitle")}{" "}
            <span className="font-medium text-[#283C5D]">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <input
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(value);
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.4em] text-[#283C5D] outline-none transition focus:border-[#283C5D]"
          />

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          {message && (
            <p className="text-center text-sm text-green-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2f49] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("verifying") : t("verifyButton")}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={resending}
          className="mt-5 w-full text-center text-sm font-medium text-[#283C5D]/70 transition hover:text-[#283C5D] disabled:opacity-50"
        >
          {resending ? t("sending") : t("resend")}
        </button>
      </div>
    </main>
  );
}