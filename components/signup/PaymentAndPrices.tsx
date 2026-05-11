// components/signup/PaymentAndPrices.tsx
"use client";

import { useState } from "react";
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  Building2,
  LinkIcon,
} from "lucide-react";
import MessageText from "@/components/UI/MessageText";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export default function PaymentAndPrices() {
  const t = useTranslations("signup.SignUp");
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [inClinicPrice, setInClinicPrice] = useState("");
  const [onlineConsulPrice, setOnlineConsulPrice] = useState("");
  const [inClinicLink, setInClinicLink] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasInClinicLink = inClinicLink.trim().length > 0;
  const loading = isSaving || isConnecting;

  async function savePrices() {
    setErrorMessage("");

    const inClinic = Number(inClinicPrice);
    const online = Number(onlineConsulPrice);
    const bookingLink = inClinicLink.trim();

    if (!inClinic || inClinic <= 0) {
      setErrorMessage("Please enter a valid in-clinic consultation price.");
      return false;
    }

    if (!bookingLink) {
      setErrorMessage("Please add your in-clinic booking link.");
      return false;
    }

    if (!online || online <= 0) {
      setErrorMessage("Please enter a valid online consultation price.");
      return false;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/doctor-profile/consultation-prices", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inClinicPrice: inClinic,
          onlineConsulPrice: online,
          inClinicLink: bookingLink,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Could not save consultation prices.");
      }

      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save consultation prices."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function connectStripe() {
    const pricesSaved = await savePrices();

    if (!pricesSaved) return;

    setIsConnecting(true);

    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Could not start Stripe onboarding.");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not start Stripe onboarding."
      );
    } finally {
      setIsConnecting(false);
    }
  }

  async function finishLater() {
    const pricesSaved = await savePrices();

    if (!pricesSaved) return;

    const userId = session?.user?.id;

    if (!userId) {
      setErrorMessage("User ID is missing.");
      return;
    }

    router.push(`/dashboard/${userId}`);
    router.refresh();
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
              Payments
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#283C5D] md:text-3xl">
              Set your consultation prices
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
              Patients will pay the price you set. Esthetic Match takes a 10%
              platform fee, and the remaining amount goes to your connected
              Stripe account.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InClinicPriceCard
            priceValue={inClinicPrice}
            onPriceChange={setInClinicPrice}
            linkValue={inClinicLink}
            onLinkChange={setInClinicLink}
          />

          <PriceCard
            icon={<CreditCard size={22} />}
            title="Online consultation"
            description="The price patients pay for online consultations."
            value={onlineConsulPrice}
            onChange={setOnlineConsulPrice}
            placeholder="75"
          />
        </div>

        <div className="mt-6 rounded-3xl bg-[#FAF9F7] p-5">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#283C5D]">
              <ShieldCheck size={24} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#283C5D]">
                Secure Stripe payments
              </p>
              <p className="mt-1 text-sm leading-6 text-black/50">
                Stripe handles payment collection, doctor payouts, and card
                processing. You will be redirected to Stripe to connect your
                account.
              </p>
            </div>
          </div>
        </div>

        <MessageText message={errorMessage} variant="error" />

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={finishLater}
            disabled={loading || !hasInClinicLink}
            className="rounded-full border border-black px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save and finish later
          </button>

          <button
            type="button"
            onClick={connectStripe}
            disabled={loading || !hasInClinicLink}
            className="inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save prices & connect Stripe"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function InClinicPriceCard({
  priceValue,
  linkValue,
  onPriceChange,
  onLinkChange,
}: {
  priceValue: string;
  linkValue: string;
  onPriceChange: (value: string) => void;
  onLinkChange: (value: string) => void;
}) {
  const t = useTranslations("signup.SignUp");
  return (
    <div className="rounded-3xl border border-black/10 bg-[#FAF9F7] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#283C5D]">
          <Building2 size={22} />
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#283C5D]">
            In-clinic consultation
          </h3>
          <p className="text-xs text-black/45">
            The price patients pay for appointments at your clinic.
          </p>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-black/40">
          €
        </span>

        <input
          type="number"
          min="1"
          step="1"
          inputMode="decimal"
          value={priceValue}
          placeholder="100"
          onChange={(e) => onPriceChange(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white py-4 pl-9 pr-4 text-lg font-semibold text-[#283C5D] outline-none transition placeholder:text-black/20 focus:border-[#283C5D]"
        />
      </div>

      <div className="relative mt-3">
        <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

        <input
          type="url"
          value={linkValue}
          placeholder="In-clinic booking link"
          onChange={(e) => onLinkChange(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white py-4 pl-10 pr-4 text-sm font-medium text-[#283C5D] outline-none transition placeholder:text-black/25 focus:border-[#283C5D]"
        />
      </div>
    </div>
  );
}

type PriceCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function PriceCard({
  icon,
  title,
  description,
  value,
  placeholder,
  onChange,
}: PriceCardProps) {
  const t = useTranslations("signup.SignUp");
  return (
    <div className="rounded-3xl border border-black/10 bg-[#FAF9F7] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#283C5D]">
          {icon}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#283C5D]">{title}</h3>
          <p className="text-xs text-black/45">{description}</p>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-black/40">
          €
        </span>

        <input
          type="number"
          min="1"
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