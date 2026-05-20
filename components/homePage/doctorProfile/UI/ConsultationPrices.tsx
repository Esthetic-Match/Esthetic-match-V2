import { WalletCards } from "lucide-react";
import { getTranslations } from "next-intl/server";
import StripeConsultationCheckOutButton from "@/components/homePage/UI/StripeConsultationCheckOutButton";
import FreeOnlineConsultationButton from "./FreeOnlineConsultationButton";
import { Info } from "lucide-react";

type ConsultationPricesProps = {
  doctorProfileId: string;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  currency: string | null;
};

function getCurrencySymbol(currency?: string | null) {
  switch (currency?.toLowerCase()) {
    case "usd":
      return "$";
    case "eur":
      return "€";
    case "gbp":
      return "£";
    case "chf":
      return "CHF";
    default:
      return "";
  }
}

function formatPrice(price: number | null | undefined, currency?: string | null) {
  if (price === null || price === undefined || price <= 0) {
    return "Free";
  }

  const symbol = getCurrencySymbol(currency);

  return symbol ? `${symbol} ${price}` : price.toString();
}

function isFreePrice(price: number | null | undefined) {
  return price === null || price === undefined || price <= 0;
}

function PriceRow({
  label,
  price,
  consultationType,
  doctorProfileId,
  currency,
}: {
  label: string;
  price: number | null;
  consultationType: "IN_CLINIC" | "ONLINE";
  doctorProfileId: string;
  currency: string | null;
}) {
  const formattedPrice = formatPrice(price, currency);
  const isOnlineFree = consultationType === "ONLINE" && isFreePrice(price);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

        <p className="text-lg font-semibold text-[#283C5D]">
          {formattedPrice}
        </p>
      </div>

      {consultationType === "ONLINE" ? (
        isOnlineFree ? (
          <FreeOnlineConsultationButton doctorProfileId={doctorProfileId} />
        ) : (
          <StripeConsultationCheckOutButton
            doctorProfileId={doctorProfileId}
            consultationType={consultationType}
            price={price}
            currency={currency}
          />
        )
      ) : null}
    </div>
  );
}

export default async function ConsultationPrices({
  doctorProfileId,
  inClinicPrice,
  onlineConsulPrice,
  currency,
}: ConsultationPricesProps) {
  const t = await getTranslations("doctor.doctor.profile.consultationPrices");

  const shouldShowInClinic =
    inClinicPrice !== null && inClinicPrice !== undefined;

  const shouldShowOnline = true;

  return (
    <article
      aria-labelledby="consultation-prices-title"
      className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <WalletCards
          size={22}
          className="text-[#d8bd8d]"
          aria-hidden="true"
        />
    
        <h2
          id="consultation-prices-title"
          className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
        >
          {t("title")}
        </h2>
      </div>
      
      <div className="group relative">
        <button
          type="button"
          aria-label={t("commissionInfoAriaLabel")}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#283C5D]/15 bg-[#FAF9F7] text-[#283C5D]/70 transition hover:bg-[#283C5D] hover:text-white"
        >
          <Info size={13} />
        </button>

        <div className="pointer-events-none absolute right-0 top-8 z-20 w-64 rounded-2xl bg-[#283C5D] p-3 text-xs leading-relaxed text-white opacity-0 shadow-2xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          {t("commissionInfo")}
        </div>
      </div>
    </div>

      <div className="mt-10 space-y-8">
        {shouldShowInClinic ? (
          <PriceRow
            label={t("inClinic")}
            price={inClinicPrice}
            consultationType="IN_CLINIC"
            doctorProfileId={doctorProfileId}
            currency={currency}
          />
        ) : null}

        {shouldShowInClinic && shouldShowOnline ? (
          <div className="border-t border-gray-200" />
        ) : null}

        {shouldShowOnline ? (
          <PriceRow
            label={t("online")}
            price={onlineConsulPrice}
            consultationType="ONLINE"
            doctorProfileId={doctorProfileId}
            currency={currency}
          />
        ) : null}
      </div>
    </article>
  );
}