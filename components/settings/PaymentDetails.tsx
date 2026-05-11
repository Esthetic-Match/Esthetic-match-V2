"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";

type DoctorProfileResponse = {
  stripeConnectAccountId?: string | null;
  stripeConnectChargesEnabled?: boolean | null;
  stripeConnectOnboardingComplete?: boolean | null;
};

export default function PaymentDetails() {
  const [profile, setProfile] = useState<DoctorProfileResponse | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isConnected =
    Boolean(profile?.stripeConnectAccountId) &&
    Boolean(profile?.stripeConnectChargesEnabled) &&
    Boolean(profile?.stripeConnectOnboardingComplete);

  async function fetchDoctorProfile() {
    try {
      setIsFetching(true);
      setErrorMessage("");

      const res = await fetch("/api/doctor-profile", {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch doctor profile");
      }

      setProfile(data);
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

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  if (isFetching) {
    return (
      <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
        <p className="text-sm text-[#283C5D]/60">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Payments
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Payment Details
        </h2>

        <div className="my-4 border-t border-gray-300"></div>
      </div>

      <div className="rounded-3xl border border-[#283C5D]/10 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#283C5D]/10 text-[#283C5D]">
            <CreditCard size={20} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#283C5D]">
              Stripe Connect
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#283C5D]/60">
              Connect your Stripe account to receive patient consultation
              payments. Esthetic Match keeps 10% commission and the remaining
              amount is paid to you.
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle size={16} />
          Stripe is connected and ready to receive payments.
        </div>
      ) : profile?.stripeConnectAccountId ? (
        <div className="flex items-center gap-2 rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          <AlertCircle size={16} />
          Stripe account created. Please complete onboarding to receive payments.
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          <AlertCircle size={16} />
          Connect Stripe before receiving consultation payments.
        </div>
      )}

      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}

      <button
        type="button"
        onClick={handleConnectStripe}
        disabled={isLoading || isConnected}
        className="rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#d8bd8d] disabled:opacity-50"
      >
        {isLoading
          ? "Redirecting..."
          : isConnected
            ? "Stripe Connected"
            : profile?.stripeConnectAccountId
              ? "Complete Stripe Onboarding"
              : "Connect Stripe"}
      </button>
    </div>
  );
}