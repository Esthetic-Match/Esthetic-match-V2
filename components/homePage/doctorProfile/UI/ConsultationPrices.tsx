import { WalletCards } from "lucide-react";

type ConsultationPricesProps = {
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
};

function formatPrice(price: number | null) {
  if (price === null || price === undefined) {
    return "Price not available";
  }

  return `€${price}`;
}

function PriceRow({
  label,
  price,
}: {
  label: string;
  price: number | null;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

      <p className="text-lg font-semibold text-[#283C5D]">
        {formatPrice(price)}
      </p>
    </div>
  );
}

export default function ConsultationPrices({
  inClinicPrice,
  onlineConsulPrice,
}: ConsultationPricesProps) {
  return (
    <article
      aria-labelledby="consultation-prices-title"
      className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
      <div className="flex items-center gap-3">
        <WalletCards size={22} className="text-[#d8bd8d]" aria-hidden="true" />

        <h2
          id="consultation-prices-title"
          className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
        >
          Consultation Prices
        </h2>
      </div>

      <div className="mt-10 space-y-8">
        <PriceRow
          label="In-clinic consultation"
          price={inClinicPrice}
        />

        <div className="border-t border-gray-200" />

        <PriceRow
          label="Online pre-consultation"
          price={onlineConsulPrice}
        />
      </div>
    </article>
  );
}