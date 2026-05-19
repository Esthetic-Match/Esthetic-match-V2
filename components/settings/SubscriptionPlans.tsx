"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";

type BillingInterval = "monthly" | "yearly";
type PaidPlan = "free" | "standard";

type DoctorProfileResponse = {
  profile: {
    paidPlan?: string | null;
  };
};

export default function SubscriptionPlans() {
  const t = useTranslations("settings.subscriptionPlans");

  const [loadingPlan, setLoadingPlan] = useState<BillingInterval | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [paidPlan, setPaidPlan] = useState<PaidPlan>("free");
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const isStandardPlan = paidPlan === "standard";

  useEffect(() => {
    async function fetchDoctorProfile() {
      try {
        const res = await fetch("/api/doctor-profile", {
          method: "GET",
        });

        const data: DoctorProfileResponse = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch doctor profile");
        }
        console.log("Doctor profile data:", data);
        setPaidPlan(data.profile.paidPlan === "standard" ? "standard" : "free");
      } catch (error) {
        console.error(error);
        setPaidPlan("free");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchDoctorProfile();
  }, []);

  async function handleUpgradePlan(interval: BillingInterval) {
    try {
      setLoadingPlan(interval);

      const res = await fetch("/api/stripe/checkout/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingInterval: interval,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        console.error("Subscription checkout failed:", data);
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setLoadingPlan(null);
    }
  }

  async function handleOpenCustomerPortal() {
    try {
      setIsPortalLoading(true);

      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        console.error("Customer portal failed:", data);
        throw new Error(data.error || "Failed to create customer portal session");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setIsPortalLoading(false);
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm font-medium text-[#283C5D]/60">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (isStandardPlan) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-[#d8bd8d]/60 bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] text-[#283C5D]">
            ✓
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#d8bd8d]">
            Premium active
          </p>

          <h2 className="text-3xl font-bold text-[#283C5D]">
            Your Premium plan is active
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#283C5D]/65">
            Manage your subscription, invoices, payment method, renewal, or
            cancellation directly through the Stripe customer portal.
          </p>

          <button
            type="button"
            disabled={isPortalLoading}
            onClick={handleOpenCustomerPortal}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {isPortalLoading ? t("common.loading") : "Open billing portal"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        <PlanCard
          title={t("freePlan.title")}
          price={t("freePlan.price")}
          benefits={[
            t("freePlan.benefits.0"),
            t("freePlan.benefits.1"),
            t("freePlan.benefits.2"),
            t("freePlan.benefits.3"),
            t("freePlan.benefits.4"),
          ]}
          buttonLabel={t("freePlan.button")}
        />

        <PlanCard
          title={t("monthlyPlan.title")}
          price={t("monthlyPlan.price")}
          suffix={t("monthlyPlan.suffix")}
          highlighted
          benefits={[
            t("monthlyPlan.benefits.0"),
            t("monthlyPlan.benefits.1"),
            t("monthlyPlan.benefits.2"),
            t("monthlyPlan.benefits.3"),
            t("monthlyPlan.benefits.4"),
            t("monthlyPlan.benefits.5"),
            t("monthlyPlan.benefits.6"),
          ]}
          buttonLabel={
            loadingPlan === "monthly"
              ? t("common.loading")
              : t("monthlyPlan.button")
          }
          disabled={loadingPlan !== null}
          onClick={() => handleUpgradePlan("monthly")}
        />

        <PlanCard
          title={t("yearlyPlan.title")}
          price={t("yearlyPlan.price")}
          suffix={t("yearlyPlan.suffix")}
          badge={t("yearlyPlan.badge")}
          highlighted
          benefits={[
            t("yearlyPlan.benefits.0"),
            t("yearlyPlan.benefits.1"),
            t("yearlyPlan.benefits.2"),
            t("yearlyPlan.benefits.3"),
            t("yearlyPlan.benefits.4"),
            t("yearlyPlan.benefits.5"),
            t("yearlyPlan.benefits.6"),
          ]}
          buttonLabel={
            loadingPlan === "yearly"
              ? t("common.loading")
              : t("yearlyPlan.button")
          }
          disabled={loadingPlan !== null}
          onClick={() => handleUpgradePlan("yearly")}
        />
      </div>
    </div>
  );
}

function PlanCard({
  title,
  price,
  suffix,
  benefits,
  buttonLabel,
  highlighted,
  badge,
  disabled,
  onClick,
}: {
  title: string;
  price: string;
  suffix?: string;
  benefits: string[];
  buttonLabel: string;
  highlighted?: boolean;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`relative flex min-h-[370px] flex-1 flex-col rounded-xl border bg-white p-6 shadow-md ${
        highlighted ? "border-[#d8bd8d]" : "border-gray-200"
      }`}
    >
      {badge ? (
        <div className="absolute right-4 top-4 rounded-full bg-[#283C5D] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {badge}
        </div>
      ) : null}

      <p
        className={`mb-5 text-md font-medium ${
          highlighted ? "text-[#d8bd8d]" : "text-black"
        }`}
      >
        {title}
      </p>

      <div className="mb-4 flex items-end gap-1">
        <h2 className="text-4xl font-bold text-black">{price}</h2>

        {suffix ? (
          <span className="mb-1 text-sm font-medium text-gray-500">
            {suffix}
          </span>
        ) : null}
      </div>

      <div className="my-4 border-t border-gray-300" />

      <ul className="mb-8 space-y-3 text-xs text-black">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <span className="mt-[2px] text-[#283C5D]">✓</span>
            <span className="font-normal">{benefit}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={disabled || !onClick}
        onClick={onClick}
        className={`mt-auto rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
          highlighted
            ? "border-[#d8bd8d] bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] text-black hover:opacity-90"
            : "border-[#283C5D] text-[#283C5D] hover:bg-[#283C5D] hover:text-white"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}