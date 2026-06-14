import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { SPECIALTY_CATEGORY_MAP } from "@/lib/specialtyCategoryMap";
import type { Category, Procedure } from "@/app/[locale]/sign-up/types";

export function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/—/g, " ")
    .replace(/-/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

export function getCategoryId(categoryName: string) {
  const id = toId(categoryName);
  return id === "longevity_medicine" ? "longevity" : id;
}

export function getSpecialtyId(specialty: string) {
  return toId(specialty);
}

export function getSelectedProcedureLabels(
  categories: readonly Category[],
  selectedProcedureIds: string[]
) {
  const selectedIds = new Set(selectedProcedureIds);
  const procedures: Procedure[] = [];

  categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.procedures.forEach((procedure) => {
        if (selectedIds.has(procedure.id)) {
          procedures.push(procedure);
        }
      });
    });
  });

  return procedures;
}

export function getVisibleCategories(selectedSpecialties: string[]) {
  if (selectedSpecialties.length === 0) {
    return [];
  }

  const allowedCategoryIds = new Set<string>();

  selectedSpecialties.forEach((specialty) => {
    const specialtyId = getSpecialtyId(specialty);
    const categoriesForSpecialty = SPECIALTY_CATEGORY_MAP[specialtyId] ?? [];

    categoriesForSpecialty.forEach((categoryId) => {
      allowedCategoryIds.add(categoryId);
    });
  });

  return DoctorCatalog.categories.filter((category) =>
    allowedCategoryIds.has(getCategoryId(category.category))
  );
}