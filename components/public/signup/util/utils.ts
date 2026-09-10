export type OnboardingProcedure = {
  id: string;
  name: string;
};

export type OnboardingSubcategory = {
  id: string;
  name: string;
  procedures: OnboardingProcedure[];
};

export type OnboardingCategory = {
  id: string;
  name: string;
  dashboardImage: string | null;
  specialtyIds: string[];
  subcategories: OnboardingSubcategory[];
};

export type OnboardingSpecialty = {
  id: string;
  name: string;
  icon: string | null;
};

export type OnboardingSpecialtyGroup = {
  id: string;
  name: string;
  specialties: OnboardingSpecialty[];
};

export type OnboardingCatalogue = {
  specialtyGroups: OnboardingSpecialtyGroup[];
  categories: OnboardingCategory[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isOnboardingProcedure(value: unknown): value is OnboardingProcedure {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string"
  );
}

function isOnboardingSubcategory(
  value: unknown,
): value is OnboardingSubcategory {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.procedures) &&
    value.procedures.every(isOnboardingProcedure)
  );
}

function isOnboardingCategory(value: unknown): value is OnboardingCategory {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isNullableString(value.dashboardImage) &&
    Array.isArray(value.specialtyIds) &&
    value.specialtyIds.every((id) => typeof id === "string") &&
    Array.isArray(value.subcategories) &&
    value.subcategories.every(isOnboardingSubcategory)
  );
}

function isOnboardingSpecialty(value: unknown): value is OnboardingSpecialty {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isNullableString(value.icon)
  );
}

function isOnboardingSpecialtyGroup(
  value: unknown,
): value is OnboardingSpecialtyGroup {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.specialties) &&
    value.specialties.every(isOnboardingSpecialty)
  );
}

function isOnboardingCatalogue(value: unknown): value is OnboardingCatalogue {
  return (
    isRecord(value) &&
    Array.isArray(value.specialtyGroups) &&
    value.specialtyGroups.every(isOnboardingSpecialtyGroup) &&
    Array.isArray(value.categories) &&
    value.categories.every(isOnboardingCategory)
  );
}

export function parseOnboardingCatalogueResponse(
  value: unknown,
): OnboardingCatalogue | null {
  if (isOnboardingCatalogue(value)) {
    return value;
  }

  if (isRecord(value) && isOnboardingCatalogue(value.data)) {
    return value.data;
  }

  return null;
}

export function getVisibleCategories(
  categories: readonly OnboardingCategory[],
  selectedSpecialtyIds: readonly string[],
) {
  if (selectedSpecialtyIds.length === 0) {
    return [];
  }

  const selectedIds = new Set(selectedSpecialtyIds);

  return categories.filter((category) =>
    category.specialtyIds.some((specialtyId) => selectedIds.has(specialtyId)),
  );
}

export function getCategoryProcedureIds(category: OnboardingCategory) {
  return Array.from(
    new Set(
      category.subcategories.flatMap((subcategory) =>
        subcategory.procedures.map((procedure) => procedure.id),
      ),
    ),
  );
}

export function getProcedureIdsForCategories(
  categories: readonly OnboardingCategory[],
  selectedCategoryIds: readonly string[],
) {
  const selectedIds = new Set(selectedCategoryIds);

  return Array.from(
    new Set(
      categories
        .filter((category) => selectedIds.has(category.id))
        .flatMap(getCategoryProcedureIds),
    ),
  );
}

export function getCategoriesWithSelectedProcedures(
  categories: readonly OnboardingCategory[],
  selectedProcedureIds: readonly string[],
): OnboardingCategory[] {
  const selectedIds = new Set(selectedProcedureIds);
  const addedProcedureIds = new Set<string>();

  return categories
    .map((category) => ({
      ...category,
      subcategories: category.subcategories
        .map((subcategory) => ({
          ...subcategory,
          procedures: subcategory.procedures.filter((procedure) => {
            if (
              !selectedIds.has(procedure.id) ||
              addedProcedureIds.has(procedure.id)
            ) {
              return false;
            }

            addedProcedureIds.add(procedure.id);
            return true;
          }),
        }))
        .filter((subcategory) => subcategory.procedures.length > 0),
    }))
    .filter((category) => category.subcategories.length > 0);
}

export function getSelectedProcedureLabels(
  categories: readonly OnboardingCategory[],
  selectedProcedureIds: readonly string[],
) {
  return getCategoriesWithSelectedProcedures(
    categories,
    selectedProcedureIds,
  ).flatMap((category) =>
    category.subcategories.flatMap((subcategory) => subcategory.procedures),
  );
}
