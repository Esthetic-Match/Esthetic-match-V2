import type { MultiSelectOption } from "@/app/[locale]/sign-up/types";

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
  const selectedItemIds = new Set(selectedItems);
  const itemIds = items.map((item) => item.id);

  const selectedVisibleCount = itemIds.filter((id) =>
    selectedItemIds.has(id)
  ).length;

  const handleSelectAll = () => {
    itemIds.forEach((id) => {
      if (!selectedItemIds.has(id)) {
        onToggle(id);
      }
    });
  };

  const handleUnselectAll = () => {
    itemIds.forEach((id) => {
      if (selectedItemIds.has(id)) {
        onToggle(id);
      }
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      <details className="rounded border">
        <summary className="cursor-pointer px-4 py-3 text-sm text-gray-700">
          {selectedVisibleCount > 0
            ? `${selectedVisibleCount} selected`
            : summaryLabel}
        </summary>

        <div className="max-h-64 space-y-3 overflow-y-auto border-t px-4 py-3">
          {items.length > 0 ? (
            <>
              <div className="flex gap-2 border-b pb-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded border px-3 py-1 text-xs font-medium"
                >
                  Select all
                </button>

                <button
                  type="button"
                  onClick={handleUnselectAll}
                  className="rounded border px-3 py-1 text-xs font-medium"
                >
                  Unselect all
                </button>
              </div>

              {items.map((item) => {
                const checked = selectedItemIds.has(item.id);

                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </>
          ) : (
            <p className="text-sm text-gray-500">No options available</p>
          )}
        </div>
      </details>
    </div>
  );
}