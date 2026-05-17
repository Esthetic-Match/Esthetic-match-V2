// components/UI/PriceRow.tsx

const CURRENCY_SYMBOLS: Record<string, string> = {
  eur: "€",
  usd: "$",
  gbp: "£",
  chf: "CHF",
};

type PriceRowProps = {
  label: string;
  price?: number | null;
  currency?: string | null;
  fallbackText?: string;
};

export default function PriceRow({
  label,
  price,
  currency = "eur",
  fallbackText = "Not added yet",
}: PriceRowProps) {
  const normalizedCurrency = (currency ?? "eur").toLowerCase();

  const currencySymbol =
    CURRENCY_SYMBOLS[normalizedCurrency] ??
    normalizedCurrency.toUpperCase();

  return (
    <div>
      <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

      <span className="inline-flex rounded-full border border-gray-200 px-7 py-2 text-sm font-semibold text-[#283C5D]">
        {price != null
          ? `${currencySymbol}${price}`
          : fallbackText}
      </span>
    </div>
  );
}