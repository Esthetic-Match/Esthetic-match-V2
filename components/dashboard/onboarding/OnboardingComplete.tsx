"use client";

import { useState } from "react";
import {
  Loader2,
  TriangleAlert,
  CreditCard,
  CheckCircle2,
  Clock,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";

import MessageText from "@/components/UI/MessageText";
import { useRouter } from "@/i18n/navigation";

export default function OnboardingComplete() {
  const t = useTranslations("onboarding.onboardingComplete");
  const router = useRouter();

  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function connectStripe() {
    setErrorMessage("");
    setIsConnecting(true);

    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || t("errors.stripeFailed"));
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("errors.stripeFailed")
      );
    } finally {
      setIsConnecting(false);
    }
  }

  function finishLater() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-lg md:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#283C5D] text-white">
            <CheckCircle2 size={28} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d8bd8d]">
            {t("eyebrow")}
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#283C5D] md:text-3xl">
            {t("title")}
          </h2>
        </div>

<div className="rounded-3xl border border-black/10 bg-red-100 p-5">
  <div className="flex items-start gap-3">


    <div className="flex-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-[#283C5D]">
          {t("verification.title")}
        </h3>

        <div className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#283C5D]">
          <Clock size={18} />
          <span>{t("verification.duration")}</span>
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-black/50">
        {t("verification.description")}
      </p>
    </div>
  </div>
</div>

<div className="mt-6 grid gap-4 md:grid-cols-2">
  <div className="rounded-3xl bg-[#FAF9F7] p-5">
    <h4 className="text-sm font-semibold text-[#283C5D]">
      {t("later.title")}
    </h4>

    <p className="mt-1 text-sm leading-6 text-black/45">
      {t("later.description")}
    </p>
  </div>

  <div className="rounded-3xl bg-[#FAF9F7] p-5">
    <h4 className="text-sm font-semibold text-[#283C5D]">
      {t("revenue.title")}
    </h4>

    <p className="mt-1 text-sm leading-6 text-black/45">
      {t("revenue.description")}
    </p>
  </div>
</div>

        <MessageText message={errorMessage} variant="error" />

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-between">
          <button
            type="button"
            onClick={finishLater}
            disabled={isConnecting}
            className="cursor-pointer rounded-full border border-black px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("buttons.doLater")}
          </button>

          <button
            type="button"
            onClick={connectStripe}
            disabled={isConnecting}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("buttons.redirecting")}
              </>
            ) : (
              t("buttons.doNow")
            )}
          </button>
        </div>
      </div>
    </section>
  );
}