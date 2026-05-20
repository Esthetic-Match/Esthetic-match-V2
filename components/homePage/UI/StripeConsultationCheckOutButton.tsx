"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
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
  className="
    inline-flex items-center justify-center gap-2 rounded-full
    bg-gradient-to-r from-[#d8bd8d] via-[#f4e4c6] to-[#c9a46a]
    px-5 py-3 text-sm font-medium text-black
    shadow-md shadow-[#d8bd8d]/30
    transition-all duration-200
    hover:scale-[1.02] hover:shadow-lg hover:shadow-[#d8bd8d]/40
    active:scale-[0.98]
    disabled:cursor-not-allowed disabled:opacity-60
  "
>
  {loading ? (
    <Loader2 size={16} className="animate-spin" />
  ) : (
    <MessageCircle size={20} />
  )}

  {t("messageNow")}
</button>
  );
}