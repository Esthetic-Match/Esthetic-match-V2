"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ConnectStripeButton() {
  const [loading, setLoading] = useState(false);

  async function connectStripe() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Stripe onboarding error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={connectStripe}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-2xl bg-[#283C5D] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Stripe"
      )}
    </button>
  );
}