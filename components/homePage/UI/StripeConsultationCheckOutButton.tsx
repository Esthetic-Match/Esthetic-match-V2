"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type ConsultationType = "IN_CLINIC" | "ONLINE";

type StripeConsultationCheckOutButtonProps = {
  doctorProfileId: string;
  consultationType: ConsultationType;
  price: number | null;
};

export default function StripeConsultationCheckOutButton({
  doctorProfileId,
  consultationType,
  price,
}: StripeConsultationCheckOutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function createCheckoutSession() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorProfileId,
          consultationType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
      alert(error instanceof Error ? error.message : "Payment failed");
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
      className=" mt-6 inline-flex items-center justify-center rounded-2xl cursor-pointer
      bg-white border border-[#d8bd8d] px-6 py-3 font-semibold text-black transition hover:text-white hover:bg-[#283C5D]/70 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 text-xs animate-spin" />
          Redirecting...
        </>
      ) : (
        <p className="text-xs">
          {consultationType === "IN_CLINIC"
            ? "Book Now"
            : "Message Now"}
        </p>
      )}
    </button>
  );
}