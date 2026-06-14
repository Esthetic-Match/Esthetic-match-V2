import MultiSelectDropdown from "./MultiSelectDropdown";
import type { Category } from "@/app/[locale]/(public)/sign-up/types";

type CategorySelectorProps = {
  category: Category;
  selectedServiceCategories: string[];
  selectedServices: string[];
  onToggleServiceCategory: (id: string) => void;
  onToggleService: (id: string) => void;
};

export default function CategorySelector({
  category,
  selectedServiceCategories,
  selectedServices,
  onToggleServiceCategory,
  onToggleService,
}: CategorySelectorProps) {
  return (
    <div className="space-y-4 rounded border p-4">
      <p className="text-sm font-semibold">{category.category}</p>

      <MultiSelectDropdown
        label="Subcategories"
        summaryLabel={`Select ${category.category.toLowerCase()} subcategories`}
        items={category.subcategories.map((subcategory) => ({
          id: subcategory.subcategory,
          label: subcategory.subcategory,
        }))}
        selectedItems={selectedServiceCategories}
        onToggle={onToggleServiceCategory}
      />

      {category.subcategories.map((subcategory) => {
        const isSelected = selectedServiceCategories.includes(
          subcategory.subcategory
        );

        if (!isSelected) {
          return null;
        }

        const availableProcedures = subcategory.procedures
          .filter((procedure) => !selectedServices.includes(procedure.id))
          .map((procedure) => ({
            id: procedure.id,
            label: procedure.name,
          }));

        return (
          <MultiSelectDropdown
            key={subcategory.subcategory}
            label={subcategory.subcategory}
            summaryLabel={`Select ${subcategory.subcategory.toLowerCase()} procedures`}
            items={availableProcedures}
            selectedItems={selectedServices}
            onToggle={onToggleService}
          />
        );
      })}
    </div>
  );
}