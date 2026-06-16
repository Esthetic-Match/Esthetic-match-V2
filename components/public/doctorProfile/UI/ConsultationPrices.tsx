import { Info, MonitorCheck, Stethoscope, WalletCards } from "lucide-react";
import { getTranslations } from "next-intl/server";
import StripeConsultationCheckOutButton from "@/components/public/doctorProfile/UI/StripeConsultationCheckOutButton";
import FreeOnlineConsultationButton from "./FreeOnlineConsultationButton";
import { useTranslations } from "next-intl";

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

function ConsultationCard({
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
  const t =  useTranslations("doctor.doctor.profile.stickyContactBanner");
  const formattedPrice = formatPrice(price, currency);
  const isOnline = consultationType === "ONLINE";
  const isOnlineFree = isOnline && isFreePrice(price);

  return (
    <div
      className={
        isOnline
          ? "relative overflow-hidden rounded-3xl border border-[#d8bd8d]/60 bg-gradient-to-br from-[#283C5D] via-[#31486d] to-[#18263d] p-5 text-white shadow-xl"
          : "rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5 shadow-sm"
      }
    >
      {isOnline ? (
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#d8bd8d]/20 blur-2xl" />
      ) : null}

      <div className="relative flex items-start gap-4">
        <div
          className={
            isOnline
              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#f4e4c6] ring-1 ring-white/15"
              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#283C5D] ring-1 ring-[#283C5D]/10"
          }
        >
          {isOnline ? <MonitorCheck size={20} /> : <Stethoscope size={20} />}
        </div>

        <div className="flex-1">
          <p
            className={
              isOnline
                ? "mb-2 text-sm font-medium text-white/70"
                : "mb-2 text-sm font-medium text-[#283C5D]/60"
            }
          >
            {label}
          </p>

          <p
            className={
              isOnline
                ? "text-2xl font-semibold text-white"
                : "text-2xl font-semibold text-[#283C5D]"
            }
          >
            {formattedPrice === "Free" ? t("free") : formattedPrice}
          </p>
        </div>
      </div>

      {isOnline ? (
        <div className="relative mt-5">
          {isOnlineFree ? (
            <FreeOnlineConsultationButton doctorProfileId={doctorProfileId} />
          ) : (
            <StripeConsultationCheckOutButton
              doctorProfileId={doctorProfileId}
              consultationType={consultationType}
              price={price}
              currency={currency}
            />
          )}
        </div>
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
          <WalletCards size={22} className="text-[#d8bd8d]" aria-hidden="true" />

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

          <div className="pointer-events-none absolute right-0 top-8 z-20 w-64 rounded-2xl bg-[#283C5D] p-3 text-xs leading-relaxed text-white opacity-0 shadow-2xl transition-all duration-200 group-hover:opacity-100">
            {t("commissionInfo")}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {shouldShowOnline ? (
          <ConsultationCard
            label={t("online")}
            price={onlineConsulPrice}
            consultationType="ONLINE"
            doctorProfileId={doctorProfileId}
            currency={currency}
          />
        ) : null}

        {shouldShowInClinic ? (
          <ConsultationCard
            label={t("inClinic")}
            price={inClinicPrice}
            consultationType="IN_CLINIC"
            doctorProfileId={doctorProfileId}
            currency={currency}
          />
        ) : null}
      </div>
    </article>
  );
}