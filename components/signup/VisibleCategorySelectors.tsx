import CategorySelector from "./CategorySelector";
import type { Category } from "@/app/[locale]/(public)/sign-up/types";

type VisibleCategorySelectorsProps = {
  visibleCategories: readonly Category[];
  selectedServiceCategories: string[];
  selectedServices: string[];
  onToggleServiceCategory: (id: string) => void;
  onToggleService: (id: string) => void;
};

export default function VisibleCategorySelectors({
  visibleCategories,
  selectedServiceCategories,
  selectedServices,
  onToggleServiceCategory,
  onToggleService,
}: VisibleCategorySelectorsProps) {
  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <>
      {visibleCategories.map((category) => (
        <CategorySelector
          key={category.category}
          category={category}
          selectedServiceCategories={selectedServiceCategories}
          selectedServices={selectedServices}
          onToggleServiceCategory={onToggleServiceCategory}
          onToggleService={onToggleService}
        />
      ))}
    </>
  );
}