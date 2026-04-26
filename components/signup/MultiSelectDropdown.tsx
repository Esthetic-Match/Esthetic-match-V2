import type { MultiSelectOption } from "@/app/sign-up/types";

type MultiSelectDropdownProps = {
  label: string;
  summaryLabel: string;
  items: readonly MultiSelectOption[];
  selectedItems: string[];
  onToggle: (value: string) => void;
};

export default function MultiSelectDropdown({
  label,
  summaryLabel,
  items,
  selectedItems,
  onToggle,
}: MultiSelectDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      <details className="rounded border">
        <summary className="cursor-pointer px-4 py-3 text-sm text-gray-700">
          {selectedItems.length > 0
            ? `${selectedItems.length} selected`
            : summaryLabel}
        </summary>

        <div className="max-h-64 space-y-3 overflow-y-auto border-t px-4 py-3">
          {items.length > 0 ? (
            items.map((item) => {
              const checked = selectedItems.includes(item.id);

              return (
                <label key={item.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No options available</p>
          )}
        </div>
      </details>
    </div>
  );
}