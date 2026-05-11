import { WalletCards } from "lucide-react";
import { getTranslations } from "next-intl/server";
import StripeConsultationCheckOutButton from "@/components/homePage/UI/StripeConsultationCheckOutButton";

type ConsultationPricesProps = {
  doctorProfileId: string;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
};

function formatPrice(price: number | null) {
  if (price === null || price === undefined) {
    return null;
  }

  return `€${price}`;
}

function PriceRow({
  label,
  price,
  consultationType,
  doctorProfileId,
}: {
  label: string;
  price: number | null;
  consultationType: "IN_CLINIC" | "ONLINE";
  doctorProfileId: string;
}) {
  const formattedPrice = formatPrice(price);

  if (!formattedPrice) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

        <p className="text-lg font-semibold text-[#283C5D]">
          {formattedPrice}
        </p>
      </div>

      <StripeConsultationCheckOutButton
        doctorProfileId={doctorProfileId}
        consultationType={consultationType}
        price={price}
      />
    </div>
  );
}

export default async function ConsultationPrices({
  doctorProfileId,
  inClinicPrice,
  onlineConsulPrice,
}: ConsultationPricesProps) {
  const t = await getTranslations("doctor.doctor.profile.consultationPrices");

  const hasAnyPrice =
    (inClinicPrice !== null && inClinicPrice !== undefined && inClinicPrice > 0) ||
    (onlineConsulPrice !== null &&
      onlineConsulPrice !== undefined &&
      onlineConsulPrice > 0);

  if (!hasAnyPrice) {
    return (
      <article
        aria-labelledby="consultation-prices-title"
        className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
      >
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

        <div className="mt-8 rounded-3xl bg-[#FAF9F7] p-5">
          <p className="text-sm font-medium text-[#283C5D]/70">
            Doctor has not added prices yet.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      aria-labelledby="consultation-prices-title"
      className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
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

      <div className="mt-10 space-y-8">
        <PriceRow
          label={t("inClinic")}
          price={inClinicPrice}
          consultationType="IN_CLINIC"
          doctorProfileId={doctorProfileId}
        />

        {inClinicPrice && onlineConsulPrice ? (
          <div className="border-t border-gray-200" />
        ) : null}

        <PriceRow
          label={t("online")}
          price={onlineConsulPrice}
          consultationType="ONLINE"
          doctorProfileId={doctorProfileId}
        />
      </div>
    </article>
  );
}