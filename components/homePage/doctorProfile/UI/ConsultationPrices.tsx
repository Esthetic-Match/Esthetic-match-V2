import { WalletCards } from "lucide-react";
import { getTranslations } from "next-intl/server";

type ConsultationPricesProps = {
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
};

async function formatPrice(
  price: number | null,
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  if (price === null || price === undefined) {
    return t("notAvailable");
  }

  return `€${price}`;
}

async function PriceRow({
  label,
  price,
  t,
}: {
  label: string;
  price: number | null;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

      <p className="text-lg font-semibold text-[#283C5D]">
        {await formatPrice(price, t)}
      </p>
    </div>
  );
}

export default async function ConsultationPrices({
  inClinicPrice,
  onlineConsulPrice,
}: ConsultationPricesProps) {
  const t = await getTranslations(
    "doctor.doctor.profile.consultationPrices"
  );

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
          t={t}
        />

        <div className="border-t border-gray-200" />

        <PriceRow
          label={t("online")}
          price={onlineConsulPrice}
          t={t}
        />
      </div>
    </article>
  );
}