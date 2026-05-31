"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {useSearchParams, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const t = useTranslations("home.Home");

  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale: string }>();

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    error === "INVALID_TOKEN" ? "This reset link is invalid or expired." : ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      setErrorMessage("Missing reset token.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { error } = await authClient.resetPassword({
      token,
      newPassword: password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || "Could not reset password.");
      return;
    }

    router.push(`/sign-in`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-[#283C5D]">
          {t("reset password")}
        </h1>

        <p className="mt-2 text-sm text-[#283C5D]/50">
          {t("enter new pass")}
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("new password")}
          className="mt-6 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-[#283C5D]"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("confirm password")}
          className="mt-3 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-[#283C5D]"
        />

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !token}
          className="mt-6 w-full rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </main>
  );
}