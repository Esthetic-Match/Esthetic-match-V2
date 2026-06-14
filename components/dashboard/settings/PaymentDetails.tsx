"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Save,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";

type DoctorProfileResponse = {
  stripeConnectAccountId?: string | null;
  stripeConnectChargesEnabled?: boolean | null;
  stripeConnectOnboardingComplete?: boolean | null;
  currency?: string | null;
};

const CURRENCIES = [
  { value: "eur", label: "Euro", symbol: "€" },
  { value: "usd", label: "US Dollar", symbol: "$" },
  { value: "gbp", label: "British Pound", symbol: "£" },
  { value: "chf", label: "Swiss Franc", symbol: "CHF" },
];

export default function PaymentDetails({
  doctorProfile,
}: {
  doctorProfile: DoctorProfileResponse;
}) {
  const t = useTranslations("settings.settings.paymentDetails");
  const [profile, setProfile] = useState<DoctorProfileResponse>(doctorProfile);

  const [selectedCurrency, setSelectedCurrency] = useState(
    doctorProfile?.currency?.toLowerCase() || "eur"
  );

  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isConnected =
    Boolean(profile?.stripeConnectAccountId) &&
    Boolean(profile?.stripeConnectChargesEnabled) &&
    Boolean(profile?.stripeConnectOnboardingComplete);

  const hasCurrencyChanged =
    selectedCurrency !== (profile?.currency?.toLowerCase() || "eur");


async function fetchDoctorProfile() {
  try {
    setIsFetching(true);
    setErrorMessage("");

    const res = await fetch("/api/doctor-profile", {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch doctor profile");
    }

    setProfile(data);
    setSelectedCurrency(data.currency?.toLowerCase() || "eur");
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : "Something went wrong"
    );
  } finally {
    setIsFetching(false);
  }
}

  async function handleConnectStripe() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to connect Stripe");
      }

      if (!data.url) {
        throw new Error("Stripe onboarding URL was not returned");
      }

      window.location.href = data.url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveCurrency() {
    try {
      setIsSavingCurrency(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await fetch("/api/doctor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: selectedCurrency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update currency");
      }

      setProfile((prev) => ({
        ...prev,
        ...data,
        currency: data.currency || selectedCurrency,
      }));

      setSuccessMessage("Currency updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsSavingCurrency(false);
    }
  }

useEffect(() => {
  async function syncProfile() {
    const searchParams = new URLSearchParams(window.location.search);
    const stripeStatus = searchParams.get("stripe");

    if (stripeStatus === "success") {
      await fetchDoctorProfile();
      setSuccessMessage("Stripe account connected successfully.");

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      return;
    }

    if (stripeStatus === "refresh") {
      await fetchDoctorProfile();
      setErrorMessage("Stripe onboarding was not completed. Please try again.");

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      return;
    }

    setProfile(doctorProfile);

    if (doctorProfile?.currency) {
      setSelectedCurrency(doctorProfile.currency.toLowerCase());
    }
  }

  syncProfile();
}, [doctorProfile]);



if (isFetching) {
  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
      <p className="text-sm text-[#283C5D]/60">{t("loading")}</p>
    </div>
  );
}

return (
  <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
    <div>
      <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
        {t("eyebrow")}
      </p>

      <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
        {t("title")}
      </h2>

      <div className="my-4 border-t border-gray-300" />
    </div>

    <div className="rounded-3xl border border-[#283C5D]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#283C5D]/10 text-[#283C5D]">
          <CreditCard size={20} />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#283C5D]">
            {t("stripeTitle")}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#283C5D]/60">
            {t("stripeDescription")}
          </p>
        </div>
      </div>
    </div>

    {isConnected ? (
      <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle size={16} />
        {t("connected")}
      </div>
    ) : profile?.stripeConnectAccountId ? (
      <div className="flex items-center gap-2 rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
        <AlertCircle size={16} />
        {t("onboardingIncomplete")}
      </div>
    ) : (
      <div className="flex items-center gap-2 rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
        <AlertCircle size={16} />
        {t("notConnected")}
      </div>
    )}

{!isConnected ? (
  <button
    type="button"
    onClick={handleConnectStripe}
    disabled={isLoading}
    className="rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
  >
    {isLoading
      ? t("redirecting")
      : profile?.stripeConnectAccountId
        ? t("completeOnboarding")
        : t("connectStripe")}
  </button>
) : null}

    <div className="rounded-3xl border border-[#283C5D]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#283C5D]/10 text-[#283C5D]">
          <Wallet size={20} />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#283C5D]">
            {t("currencyTitle")}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#283C5D]/60">
            {t("currencyDescription")}
          </p>

          <div className="mt-5 space-y-4">
            <select
              value={selectedCurrency}
              onChange={(event) => {
                setSelectedCurrency(event.target.value);
                setSuccessMessage("");
              }}
              className="w-full rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-3 text-sm font-medium text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.symbol} {currency.label}{" "}
                  ({currency.value.toUpperCase()})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSaveCurrency}
              disabled={isSavingCurrency || !hasCurrencyChanged}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#283C5D] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSavingCurrency ? t("saving") : t("saveCurrency")}
            </button>
          </div>
        </div>
      </div>
    </div>

    {successMessage ? (
      <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle size={16} />
        {successMessage}
      </div>
    ) : null}

    {errorMessage ? (
      <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
        <AlertCircle size={16} />
        {errorMessage}
      </div>
    ) : null}
  </div>
);
}