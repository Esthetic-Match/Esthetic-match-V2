// components/signup/PaymentAndPrices.tsx
"use client";

import { useState } from "react";
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  Building2,
} from "lucide-react";
import MessageText from "@/components/UI/MessageText";
import { useTranslations } from "next-intl";
import OnboardingComplete from "./OnboardingComplete";

type PriceCardProps = {
  icon: React.ReactNode;
  currencySymbol: string;
  translationKey: "online";
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

const CURRENCIES = [
  { value: "eur", label: "Euro", symbol: "€" },
  { value: "usd", label: "US Dollar", symbol: "$" },
  { value: "gbp", label: "British Pound", symbol: "£" },
  { value: "chf", label: "Swiss Franc", symbol: "CHF" },
];

type CurrencyValue = (typeof CURRENCIES)[number]["value"];

export default function PaymentAndPrices() {
  const t = useTranslations("onboarding.paymentPrices");

  const [inClinicPrice, setInClinicPrice] = useState("");
  const [onlineConsulPrice, setOnlineConsulPrice] = useState("");
  const [currency, setCurrency] = useState<CurrencyValue>("eur");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const selectedCurrency =
    CURRENCIES.find((item) => item.value === currency) ?? CURRENCIES[0];

  async function savePrices() {
    setErrorMessage("");

    const inClinic = Number(inClinicPrice);
    const online = Number(onlineConsulPrice);

    if (!Number.isFinite(inClinic) || inClinic <= 0) {
      setErrorMessage(t("errors.invalidInClinicPrice"));
      return false;
    }

    if (!Number.isFinite(online) || online <= 0) {
      setErrorMessage(t("errors.invalidOnlinePrice"));
      return false;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/doctor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inClinicPrice: inClinic,
          onlineConsulPrice: online,
          currency,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || t("errors.saveFailed"));
      }

      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("errors.saveFailed")
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function finishOnboarding() {
    const pricesSaved = await savePrices();

    if (!pricesSaved) return;

    setIsComplete(true);
  }

  if (isComplete) {
    return <OnboardingComplete />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-lg md:p-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-white">
            <CreditCard size={26} />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d8bd8d]">
              {t("eyebrow")}
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#283C5D] md:text-3xl">
              {t("title")}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
              {t("description")}
            </p>
          </div>
        </div>

        <CurrencySelector value={currency} onChange={setCurrency} />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InClinicPriceCard
            currencySymbol={selectedCurrency.symbol}
            priceValue={inClinicPrice}
            onPriceChange={setInClinicPrice}
          />

          <PriceCard
            icon={<CreditCard size={22} />}
            currencySymbol={selectedCurrency.symbol}
            translationKey="online"
            value={onlineConsulPrice}
            onChange={setOnlineConsulPrice}
            placeholder="40"
          />
        </div>

        <div className="mt-6 rounded-3xl bg-[#FAF9F7] p-5">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#283C5D]">
              <ShieldCheck size={24} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#283C5D]">
                {t("stripe.title")}
              </p>

              <p className="mt-1 text-sm leading-6 text-black/50">
                {t("stripe.description")}
              </p>
            </div>
          </div>
        </div>

        <MessageText message={errorMessage} variant="error" />

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={finishOnboarding}
            disabled={isSaving}
            className="inline-flex items-center justify-center cursor-pointer rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("buttons.saving")}
              </>
            ) : (
              t("buttons.finish")
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function InClinicPriceCard({
  currencySymbol,
  priceValue,
  onPriceChange,
}: {
  currencySymbol: string;
  priceValue: string;
  onPriceChange: (value: string) => void;
}) {
  const t = useTranslations("onboarding.paymentPrices");

  return (
    <div className="rounded-3xl border border-black/10 bg-[#FAF9F7] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#283C5D]">
          <Building2 size={22} />
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#283C5D]">
            {t("inClinic.title")}
          </h3>

          <p className="text-xs text-black/45">
            {t("inClinic.description")}
          </p>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-black/40">
          {currencySymbol}
        </span>

        <input
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={priceValue}
          placeholder="100"
          onChange={(e) => onPriceChange(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white py-4 pl-9 pr-4 text-lg font-semibold text-[#283C5D] outline-none transition placeholder:text-black/20 focus:border-[#283C5D]"
        />
      </div>
    </div>
  );
}

function PriceCard({
  icon,
  currencySymbol,
  translationKey,
  value,
  placeholder,
  onChange,
}: PriceCardProps) {
  const t = useTranslations("onboarding.paymentPrices");

  return (
    <div className="rounded-3xl border border-black/10 bg-[#FAF9F7] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#283C5D]">
          {icon}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#283C5D]">
            {t(`${translationKey}.title`)}
          </h3>

          <p className="text-xs text-black/45">
            {t(`${translationKey}.description`)}
          </p>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-black/40">
          {currencySymbol}
        </span>

        <input
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white py-4 pl-9 pr-4 text-lg font-semibold text-[#283C5D] outline-none transition placeholder:text-black/20 focus:border-[#283C5D]"
        />
      </div>
    </div>
  );
}

function CurrencySelector({
  value,
  onChange,
}: {
  value: CurrencyValue;
  onChange: (value: CurrencyValue) => void;
}) {
  const t = useTranslations("onboarding.paymentPrices");

  return (
    <div className="rounded-3xl border border-black/10 bg-[#FAF9F7] p-5">
      <label className="mb-3 block text-sm font-semibold text-[#283C5D]">
        {t("currency.label")}
      </label>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CURRENCIES.map((currency) => {
          const isSelected = currency.value === value;

          return (
            <button
              key={currency.value}
              type="button"
              onClick={() => onChange(currency.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                isSelected
                  ? "border-[#283C5D] bg-white text-[#283C5D] shadow-sm"
                  : "border-black/10 bg-white/60 text-black/50 hover:bg-white"
              }`}
            >
              <span className="block text-sm font-semibold">
                {currency.symbol}
              </span>

              <span className="mt-1 block text-xs">
                {currency.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}