"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("home.Home");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const locale = useLocale();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || "Could not send reset email.");
      return;
    }

    setMessage("If an account exists, a reset link has been sent.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-[#283C5D]">
          {t("forgot password")}
        </h1>

        <p className="mt-2 text-sm text-[#283C5D]/50">
          {t("enter mail")}
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email address")}
          className="mt-6 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-[#283C5D]"
        />

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
        ) : null}

        {message ? (
          <p className="mt-3 text-sm text-green-600">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="mt-6 w-full rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? t("Sending") : t("send link")}
        </button>
      </form>
    </main>
  );
}