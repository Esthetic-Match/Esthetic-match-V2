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
        {t("premiumActive")}
      </p>

      <h2 className="text-3xl font-bold text-[#283C5D]">
        {t("premiumPlanActiveTitle")}
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#283C5D]/65">
        {t("premiumPlanActiveDescription")}
      </p>

      <button
        type="button"
        disabled={isPortalLoading}
        onClick={handleOpenCustomerPortal}
        className="mt-8 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ExternalLink className="mr-2 h-4 w-4" />

        {isPortalLoading
          ? t("common.loading")
          : t("openBillingPortal")}
      </button>
    </div>
  </div>
);
}

return (
<div className="h-full w-full overflow-y-auto px-4 py-6">
  <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
      <PlanCard
        title={t("freePlan.title")}
        subtitle={t("freePlan.subtitle")}
        price={t("freePlan.price")}
        suffix={t("freePlan.suffix")}
        benefits={[
          {
            title: t("freePlan.benefits.0.title"),
            description: t("freePlan.benefits.0.description"),
          },
          {
            title: t("freePlan.benefits.1.title"),
            description: t("freePlan.benefits.1.description"),
          },
          {
            title: t("freePlan.benefits.2.title"),
            description: t("freePlan.benefits.2.description"),
          },
          {
            title: t("freePlan.benefits.3.title"),
            description: t("freePlan.benefits.3.description"),
          },
          {
            title: t("freePlan.benefits.4.title"),
            description: t("freePlan.benefits.4.description"),
          }
        ]}
        buttonLabel={t("freePlan.button")}
      />

      <PlanCard
        title={t("monthlyPlan.title")}
        subtitle={t("monthlyPlan.subtitle")}
        price={t("monthlyPlan.price")}
        suffix={t("monthlyPlan.suffix")}
        note={t("monthlyPlan.note")}
        badge={t("monthlyPlan.badge")}
        highlighted
        benefits={[
          {
            title: t("monthlyPlan.benefits.0.title"),
            description: t("monthlyPlan.benefits.0.description"),
          },
          {
            title: t("monthlyPlan.benefits.1.title"),
            description: t("monthlyPlan.benefits.1.description"),
          },
          {
            title: t("monthlyPlan.benefits.2.title"),
            description: t("monthlyPlan.benefits.2.description"),
          },
          {
            title: t("monthlyPlan.benefits.3.title"),
            description: t("monthlyPlan.benefits.3.description"),
          },
          {
            title: t("monthlyPlan.benefits.4.title"),
            description: t("monthlyPlan.benefits.4.description"),
          },
          {
            title: t("monthlyPlan.benefits.5.title"),
            description: t("monthlyPlan.benefits.5.description"),
          },
          {
            title: t("monthlyPlan.benefits.6.title"),
            description: t("monthlyPlan.benefits.6.description"),
          },
          {
            title: t("monthlyPlan.benefits.7.title"),
            description: t("monthlyPlan.benefits.7.description"),
          },
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
  isYearly
  title={t("yearlyPlan.title")}
  subtitle={t("yearlyPlan.subtitle")}
  price={t("yearlyPlan.price")}
  suffix={t("yearlyPlan.suffix")}
  billingNote={t("yearlyPlan.billingNote")}
  savingNote={t("yearlyPlan.savingNote")}
  badge={t("yearlyPlan.badge")}
  highlighted
  benefits={[
    {
      title: t("yearlyPlan.benefits.0.title"),
      description: t("yearlyPlan.benefits.0.description"),
    },
    {
      title: t("yearlyPlan.benefits.1.title"),
      description: t("yearlyPlan.benefits.1.description"),
    },
    {
      title: t("yearlyPlan.benefits.2.title"),
      description: t("yearlyPlan.benefits.2.description"),
    },
    {
      title: t("yearlyPlan.benefits.3.title"),
      description: t("yearlyPlan.benefits.3.description"),
    },
    {
      title: t("yearlyPlan.benefits.4.title"),
      description: t("yearlyPlan.benefits.4.description"),
    },
    {
      title: t("yearlyPlan.benefits.5.title"),
      description: t("yearlyPlan.benefits.5.description"),
    },
    {
      title: t("yearlyPlan.benefits.6.title"),
      description: t("yearlyPlan.benefits.6.description"),
    },
    {
      title: t("yearlyPlan.benefits.7.title"),
      description: t("yearlyPlan.benefits.7.description"),
    },
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

type PlanBenefit = {
  title: string;
  description: string;
  isYearly?: boolean;
};

function PlanCard({
  title,
  subtitle,
  price,
  suffix,
  note,
  billingNote,
  savingNote,
  benefits,
  buttonLabel,
  highlighted,
  badge,
  disabled,
  onClick,
  isYearly,
}: {
  title: string;
  subtitle?: string;
  price: string;
  suffix?: string;
  note?: string;
  billingNote?: string;
  savingNote?: string;
  benefits: PlanBenefit[];
  buttonLabel: string;
  highlighted?: boolean;
  isYearly?: boolean;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`relative flex min-h-[520px] flex-1 flex-col rounded-xl border p-6 shadow-md mt-6 ${
        isYearly
          ? "border-[#3D5A80] bg-gradient-to-br from-[#1B2A41] via-[#283C5D] to-[#3D5A80]"
          : highlighted
          ? "border-[#d8bd8d] bg-white"
          : "border-gray-200 bg-white"
      }`}
    >
      {badge ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d8bd8d] px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#283C5D]">
          {badge}
        </div>
      ) : null}

      <div className="mb-5 text-center">
        <p
        className={`text-sm font-bold uppercase ${
          isYearly ? "text-white" : "text-[#283C5D]"
        }`}
      >
          {title}
        </p>

        {subtitle ? (
          <p
            className={`mt-1 text-xs font-medium ${
              isYearly ? "text-white/70" : "text-[#283C5D]/60"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="mb-2 flex items-end justify-center gap-1">
        <h2
          className={`text-4xl font-bold ${
            isYearly
              ? "text-white"
              : highlighted
              ? "text-[#f5a623]"
              : "text-[#283C5D]"
          }`}
        >
          {price}
        </h2>

        {suffix ? (
          <span
            className={`mb-1 text-sm font-medium ${
              isYearly ? "text-white/70" : "text-[#283C5D]/60"
            }`}
          >
            {suffix}
          </span>
        ) : null}
      </div>

      {note ? (
        <p
          className={`mb-1 text-center text-xs font-medium ${
            isYearly ? "text-white/70" : "text-[#283C5D]/60"
          }`}
        >
          {note}
        </p>
      ) : null}

      {billingNote ? (
        <p className="text-center text-xs font-semibold text-[#8FE3C3]">
          {billingNote}
        </p>
      ) : null}

      {savingNote ? (
        <p className="mb-4 text-center text-xs font-semibold text-[#8FE3C3]">
          {savingNote}
        </p>
      ) : null}

      <button
        type="button"
        disabled={disabled || !onClick}
        onClick={onClick}
        className={`my-5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
            isYearly
              ? "border-white/20 bg-gradient-to-r from-[#d8bd8d] via-[#f3d38a] to-[#b8892d] text-[#1B2A41] hover:brightness-105"
              : highlighted
              ? "border-[#e7b95a] bg-gradient-to-r from-[#c8922e] via-[#f3c96b] to-[#b97a1f] text-[#283C5D] shadow-[#d8bd8d]/40 hover:brightness-105"
              : "border-[#d8bd8d] text-[#283C5D] hover:bg-[#283C5D] hover:text-white"
          }`}
      >
        {buttonLabel}
      </button>

      <ul
        className={`space-y-3 text-xs ${
          isYearly ? "text-white" : "text-[#283C5D]"
        }`}
      >
{benefits.map((benefit) => (
  <li key={benefit.title} className="flex items-start gap-3">
    <span
      className={`mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ${
        isYearly
          ? "bg-[#cf9b39] text-[#1B2A41]"
          : highlighted
          ? "bg-[#3a567c] "
          : "bg-gray-400"
      }`}
    >
      ✓
    </span>

    <span>
      <span
        className={`block text-sm font-semibold ${
          isYearly ? "text-white" : "text-[#283C5D]"
        }`}
      >
        {benefit.title}
      </span>

      <span
        className={`mt-1 block text-xs leading-5 ${
          isYearly
            ? "text-white/70"
            : "text-[#283C5D]/60"
        }`}
      >
        {benefit.description}
      </span>
    </span>
  </li>
))}
      </ul>
    </div>
  );
}