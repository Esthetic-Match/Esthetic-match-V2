// components/UI/PriceRow.tsx

type PriceRowProps = {
  label: string;
  price?: number | null;
  currency?: string;
  fallbackText?: string;
};

export default function PriceRow({
  label,
  price,
  currency = "€",
  fallbackText = "Not added yet",
}: PriceRowProps) {
  return (
    <div>
      <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

      <span className="inline-flex rounded-full border border-gray-200 px-7 py-2 text-sm font-semibold text-[#283C5D]">
        {price != null ? `${price} ${currency}` : fallbackText}
      </span>
    </div>
  );
}