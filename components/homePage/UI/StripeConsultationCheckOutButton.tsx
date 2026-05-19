"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type ConsultationType = "IN_CLINIC" | "ONLINE";

type StripeConsultationCheckOutButtonProps = {
  doctorProfileId: string;
  consultationType: ConsultationType;
  price: number | null;
  currency: string | null;
};

export default function StripeConsultationCheckOutButton({
  doctorProfileId,
  consultationType,
  price,
  currency,
}: StripeConsultationCheckOutButtonProps) {
  const t = useTranslations("doctor.doctor.profile.consultationPrices");
  const router = useRouter();

  const [loading, setLoading] = useState(false);

async function createCheckoutSession() {
  try {
    setLoading(true);

    const sessionRes = await fetch("/api/auth/get-session");

    const sessionData = await sessionRes.json();

    if (!sessionData?.user) {
      router.push("/sign-in");
      return;
    }

    const res = await fetch("/api/stripe/checkout/consultation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctorProfileId,
        consultationType,
        currency,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || t("errors.checkoutFailed"));
    }

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Stripe checkout error:", error);

    alert(
      error instanceof Error
        ? error.message
        : t("errors.paymentFailed")
    );
  } finally {
    setLoading(false);
  }
}

  const disabled = loading || !price || price <= 0;

  return (
    <button
      type="button"
      onClick={createCheckoutSession}
      disabled={disabled}
      className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[#d8bd8d] bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#283C5D]/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 animate-spin text-xs" />
          {t("redirecting")}
        </>
      ) : (
        <p className="text-xs">
          {consultationType === "IN_CLINIC"
            ? t("bookNow")
            : t("messageNow")}
        </p>
      )}
    </button>
  );
}