import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnvConfig } from "@next/env";

type JsonObject = Record<string, unknown>;

type DoctorProfileRow = {
  id: string;
  userId: string;
  clinicName: string;
  specialtyIds: string[];
  subcategoryIds: string[];
  procedureIds: string[];
  topThree: string[];
};

type DoctorSpecialtyRow = {
  doctorProfileId: string;
  specialtyId: string;
  position: number;
};

type DoctorCategoryRow = {
  doctorProfileId: string;
  categoryId: string;
  position: number;
};

type DoctorSubcategoryRow = {
  doctorProfileId: string;
  subcategoryId: string;
  position: number;
};

type DoctorProcedureRow = {
  doctorProfileId: string;
  procedureId: string;
  position: number;
  topRank: number | null;
  price: unknown;
};

type SubcategoryCatalogueRow = {
  id: string;
  categoryId: string;
  sortOrder: number;
};

type ProcedureSubcategoryRow = {
  procedureId: string;
  subcategoryId: string;
  sortOrder: number;
};

type MultiParentProcedure = {
  procedureId: string;
  subcategoryIds: string[];
};

type LegacyCategoryMapping = {
  legacyId: string;
  canonicalId: string;
};

type PreparedDoctor = DoctorProfileRow & {
  categoryIds: string[];
  legacyCategoryMappings: LegacyCategoryMapping[];
  derivedSubcategoryIds: string[];
  multiParentProcedures: MultiParentProcedure[];
};

const LEGACY_CATEGORY_ID_ALIASES: Readonly<Record<string, string>> = {
  wellness_and_drainage: "wellness_and_postoperative",
};

type FindManyDelegate<T> = {
  findMany(args?: Record<string, unknown>): Promise<T[]>;
};

type UpsertDelegate = {
  upsert(args: {
    where: Record<string, unknown>;
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }): Promise<unknown>;
};

type UpdateDelegate = {
  update(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<unknown>;
};

type UpdateManyDelegate = {
  updateMany(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<unknown>;
};

type DoctorSpecialtyDelegate = FindManyDelegate<DoctorSpecialtyRow> &
  UpsertDelegate;

type DoctorCategoryDelegate = FindManyDelegate<DoctorCategoryRow> &
  UpsertDelegate;

type DoctorSubcategoryDelegate = FindManyDelegate<DoctorSubcategoryRow> &
  UpsertDelegate;

type DoctorProcedureDelegate = FindManyDelegate<DoctorProcedureRow> &
  UpsertDelegate &
  UpdateDelegate &
  UpdateManyDelegate;

type BackfillTransaction = {
  doctorProfile: FindManyDelegate<DoctorProfileRow>;
  specialty: FindManyDelegate<{ id: string }>;
  category: FindManyDelegate<{ id: string }>;
  subcategory: FindManyDelegate<SubcategoryCatalogueRow>;
  procedure: FindManyDelegate<{ id: string }>;
  procedureSubcategory: FindManyDelegate<ProcedureSubcategoryRow>;
  doctorSpecialty: DoctorSpecialtyDelegate;
  doctorCategory: DoctorCategoryDelegate;
  doctorSubcategory: DoctorSubcategoryDelegate;
  doctorProcedure: DoctorProcedureDelegate;
};

type PrismaClientLike = BackfillTransaction & {
  $transaction<T>(
    callback: (transaction: BackfillTransaction) => Promise<T>,
    options?: { maxWait?: number; timeout?: number },
  ): Promise<T>;
  $disconnect(): Promise<void>;
};

type DatabaseState = {
  doctors: DoctorProfileRow[];
  specialtyIds: Set<string>;
  categoryIds: Set<string>;
  subcategories: SubcategoryCatalogueRow[];
  procedureIds: Set<string>;
  procedureSubcategoryLinks: ProcedureSubcategoryRow[];
  doctorSpecialties: DoctorSpecialtyRow[];
  doctorCategories: DoctorCategoryRow[];
  doctorSubcategories: DoctorSubcategoryRow[];
  doctorProcedures: DoctorProcedureRow[];
};

type BackfillSummary = {
  doctors: number;
  specialties: number;
  categories: number;
  subcategories: number;
  procedures: number;
  topThree: number;
  specialtyRowsToCreate: number;
  categoryRowsToCreate: number;
  subcategoryRowsToCreate: number;
  procedureRowsToCreate: number;
  multiParentProcedureSelections: number;
  existingProcedurePricesPreserved: number;
};

type CliOptions = {
  prismaModulePath?: string;
  dryRun: boolean;
  help: boolean;
};

function printUsage(): void {
  console.log(
    `
Backfill normalized doctor catalogue relations from DoctorProfile arrays.

Usage:
  npx tsx scripts/backfill-doctor-catalogue-relations-v2.ts \\
    --prisma-module lib/database/prisma.ts \\
    --dry-run

Options:
  --prisma-module  Module exporting the configured Prisma client as "prisma"
  --dry-run        Validate and report the planned backfill without writing
  --help           Show this help

Behavior:
  - specialtyIds                  -> DoctorSpecialty
  - canonicalized legacy
    subcategoryIds                -> DoctorCategory
  - subcategories derived from
    selected procedure relations  -> DoctorSubcategory
  - procedureIds                  -> DoctorProcedure
  - topThree index                -> DoctorProcedure.topRank (1, 2, or 3)
  - source/derived order          -> position
  - existing DoctorProcedure.price values are never updated
  - legacy DoctorProfile arrays are never changed
  - known renamed category IDs are canonicalized only for relational writes

Safety:
  The script stops before writing if it finds an unknown or duplicate catalogue
  ID, an invalid topThree entry, a procedure with no linked subcategory in a
  selected category, or an existing relational selection absent from its
  expected source or derived selection.
`.trim(),
  );
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    const [flag, inlineValue] = argument.split("=", 2);
    const value =
      inlineValue ??
      (index + 1 < argv.length && !argv[index + 1].startsWith("--")
        ? argv[++index]
        : undefined);

    if (!value) {
      throw new Error(`Missing value for ${flag}.`);
    }

    if (flag === "--prisma-module") {
      options.prismaModulePath = value;
      continue;
    }

    throw new Error(`Unknown option: ${flag}`);
  }

  return options;
}

function absolutePath(path: string): string {
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

async function importModule(path: string): Promise<JsonObject> {
  return (await import(pathToFileURL(absolutePath(path)).href)) as JsonObject;
}

function databaseTarget(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return "DATABASE_URL is not set";
  }

  try {
    const url = new URL(databaseUrl);
    const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
    const schema = url.searchParams.get("schema") ?? "public";
    return `host=${url.hostname}, database=${database}, schema=${schema}`;
  } catch {
    return "DATABASE_URL is set but could not be parsed";
  }
}

function requireStringArray(
  value: unknown,
  label: string,
  errors: string[],
): string[] {
  if (!Array.isArray(value)) {
    errors.push(`${label} is not an array.`);
    return [];
  }

  const result: string[] = [];

  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || item.trim() === "") {
      errors.push(`${label}[${index}] must be a non-empty string.`);
      continue;
    }

    result.push(item.trim());
  }

  return result;
}

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates];
}

function doctorLabel(doctor: DoctorProfileRow): string {
  return `${doctor.clinicName || "Unnamed clinic"} (profile ${doctor.id}, user ${doctor.userId})`;
}

function groupByDoctor<T extends { doctorProfileId: string }>(
  rows: T[],
): Map<string, T[]> {
  const result = new Map<string, T[]>();

  for (const row of rows) {
    const doctorRows = result.get(row.doctorProfileId) ?? [];
    doctorRows.push(row);
    result.set(row.doctorProfileId, doctorRows);
  }

  return result;
}

function normalizeDoctors(
  doctors: DoctorProfileRow[],
  errors: string[],
): DoctorProfileRow[] {
  return doctors.map((doctor) => ({
    ...doctor,
    specialtyIds: requireStringArray(
      doctor.specialtyIds,
      `${doctorLabel(doctor)} specialtyIds`,
      errors,
    ),
    subcategoryIds: requireStringArray(
      doctor.subcategoryIds,
      `${doctorLabel(doctor)} subcategoryIds`,
      errors,
    ),
    procedureIds: requireStringArray(
      doctor.procedureIds,
      `${doctorLabel(doctor)} procedureIds`,
      errors,
    ),
    topThree: requireStringArray(
      doctor.topThree,
      `${doctorLabel(doctor)} topThree`,
      errors,
    ),
  }));
}

function normalizeLegacyCategoryIds(doctor: DoctorProfileRow): {
  categoryIds: string[];
  legacyCategoryMappings: LegacyCategoryMapping[];
} {
  const legacyCategoryMappings: LegacyCategoryMapping[] = [];
  const categoryIds = doctor.subcategoryIds.map((legacyId) => {
    const canonicalId = LEGACY_CATEGORY_ID_ALIASES[legacyId] ?? legacyId;

    if (canonicalId !== legacyId) {
      legacyCategoryMappings.push({
        legacyId,
        canonicalId,
      });
    }

    return canonicalId;
  });

  return {
    categoryIds,
    legacyCategoryMappings,
  };
}

async function loadState(prisma: BackfillTransaction): Promise<DatabaseState> {
  const [
    doctors,
    specialties,
    categories,
    subcategories,
    procedures,
    procedureSubcategoryLinks,
    doctorSpecialties,
    doctorCategories,
    doctorSubcategories,
    doctorProcedures,
  ] = await Promise.all([
    prisma.doctorProfile.findMany({
      select: {
        id: true,
        userId: true,
        clinicName: true,
        specialtyIds: true,
        subcategoryIds: true,
        procedureIds: true,
        topThree: true,
      },
      orderBy: { id: "asc" },
    }),
    prisma.specialty.findMany({ select: { id: true } }),
    prisma.category.findMany({ select: { id: true } }),
    prisma.subcategory.findMany({
      select: {
        id: true,
        categoryId: true,
        sortOrder: true,
      },
    }),
    prisma.procedure.findMany({ select: { id: true } }),
    prisma.procedureSubcategory.findMany({
      select: {
        procedureId: true,
        subcategoryId: true,
        sortOrder: true,
      },
    }),
    prisma.doctorSpecialty.findMany({
      select: {
        doctorProfileId: true,
        specialtyId: true,
        position: true,
      },
    }),
    prisma.doctorCategory.findMany({
      select: {
        doctorProfileId: true,
        categoryId: true,
        position: true,
      },
    }),
    prisma.doctorSubcategory.findMany({
      select: {
        doctorProfileId: true,
        subcategoryId: true,
        position: true,
      },
    }),
    prisma.doctorProcedure.findMany({
      select: {
        doctorProfileId: true,
        procedureId: true,
        position: true,
        topRank: true,
        price: true,
      },
    }),
  ]);

  return {
    doctors,
    specialtyIds: new Set(specialties.map(({ id }) => id)),
    categoryIds: new Set(categories.map(({ id }) => id)),
    subcategories,
    procedureIds: new Set(procedures.map(({ id }) => id)),
    procedureSubcategoryLinks,
    doctorSpecialties,
    doctorCategories,
    doctorSubcategories,
    doctorProcedures,
  };
}

function deriveSubcategories(
  doctor: DoctorProfileRow & { categoryIds: string[] },
  state: DatabaseState,
  errors: string[],
): {
  derivedSubcategoryIds: string[];
  multiParentProcedures: MultiParentProcedure[];
} {
  const label = doctorLabel(doctor);
  const selectedCategoryOrder = new Map(
    doctor.categoryIds.map((categoryId, index) => [categoryId, index]),
  );
  const subcategoryById = new Map(
    state.subcategories.map((subcategory) => [subcategory.id, subcategory]),
  );
  const linksByProcedure = new Map<string, ProcedureSubcategoryRow[]>();

  for (const link of state.procedureSubcategoryLinks) {
    const links = linksByProcedure.get(link.procedureId) ?? [];
    links.push(link);
    linksByProcedure.set(link.procedureId, links);
  }

  const derivedSubcategoryIds: string[] = [];
  const seenSubcategoryIds = new Set<string>();
  const multiParentProcedures: MultiParentProcedure[] = [];

  for (const procedureId of doctor.procedureIds) {
    if (!state.procedureIds.has(procedureId)) {
      continue;
    }

    const allLinks = linksByProcedure.get(procedureId) ?? [];
    const validLinks = allLinks
      .filter((link) => {
        const subcategory = subcategoryById.get(link.subcategoryId);
        return (
          subcategory !== undefined &&
          selectedCategoryOrder.has(subcategory.categoryId)
        );
      })
      .sort((left, right) => {
        const leftSubcategory = subcategoryById.get(left.subcategoryId)!;
        const rightSubcategory = subcategoryById.get(right.subcategoryId)!;

        return (
          selectedCategoryOrder.get(leftSubcategory.categoryId)! -
            selectedCategoryOrder.get(rightSubcategory.categoryId)! ||
          left.sortOrder - right.sortOrder ||
          leftSubcategory.sortOrder - rightSubcategory.sortOrder ||
          left.subcategoryId.localeCompare(right.subcategoryId)
        );
      });

    if (validLinks.length === 0) {
      const availableCategoryIds = [
        ...new Set(
          allLinks
            .map((link) => subcategoryById.get(link.subcategoryId)?.categoryId)
            .filter((id): id is string => id !== undefined),
        ),
      ];

      errors.push(
        `${label} procedure "${procedureId}" has no linked subcategory in its canonical selected categories [${doctor.categoryIds.join(", ")}]. Catalogue categories for this procedure: [${availableCategoryIds.join(", ") || "none"}].`,
      );
      continue;
    }

    const validSubcategoryIds = [
      ...new Set(validLinks.map(({ subcategoryId }) => subcategoryId)),
    ];

    if (validSubcategoryIds.length > 1) {
      multiParentProcedures.push({
        procedureId,
        subcategoryIds: validSubcategoryIds,
      });
    }

    for (const subcategoryId of validSubcategoryIds) {
      if (seenSubcategoryIds.has(subcategoryId)) {
        continue;
      }

      seenSubcategoryIds.add(subcategoryId);
      derivedSubcategoryIds.push(subcategoryId);
    }
  }

  return {
    derivedSubcategoryIds,
    multiParentProcedures,
  };
}

function validateSource(state: DatabaseState): PreparedDoctor[] {
  const errors: string[] = [];
  const doctors = normalizeDoctors(state.doctors, errors).map((doctor) => ({
    ...doctor,
    ...normalizeLegacyCategoryIds(doctor),
  }));
  const existingSpecialties = groupByDoctor(state.doctorSpecialties);
  const existingCategories = groupByDoctor(state.doctorCategories);
  const existingSubcategories = groupByDoctor(state.doctorSubcategories);
  const existingProcedures = groupByDoctor(state.doctorProcedures);

  if (state.specialtyIds.size === 0) {
    errors.push(
      "The Specialty catalogue is empty. Import the catalogue before running this backfill.",
    );
  }

  if (state.categoryIds.size === 0) {
    errors.push(
      "The Category catalogue is empty. Import the catalogue before running this backfill.",
    );
  }

  if (state.subcategories.length === 0) {
    errors.push(
      "The Subcategory catalogue is empty. Import the catalogue before running this backfill.",
    );
  }

  if (state.procedureIds.size === 0) {
    errors.push(
      "The Procedure catalogue is empty. Import the catalogue before running this backfill.",
    );
  }

  for (const doctor of doctors) {
    const label = doctorLabel(doctor);
    const collections = [
      {
        name: "specialtyIds",
        values: doctor.specialtyIds,
        catalogueIds: state.specialtyIds,
      },
      {
        name: "canonical category IDs from legacy subcategoryIds",
        values: doctor.categoryIds,
        catalogueIds: state.categoryIds,
      },
      {
        name: "procedureIds",
        values: doctor.procedureIds,
        catalogueIds: state.procedureIds,
      },
      {
        name: "topThree",
        values: doctor.topThree,
        catalogueIds: state.procedureIds,
      },
    ];

    for (const collection of collections) {
      const duplicates = duplicateValues(collection.values);

      if (duplicates.length > 0) {
        errors.push(
          `${label} has duplicate ${collection.name}: ${duplicates.join(", ")}.`,
        );
      }

      const unknown = collection.values.filter(
        (id) => !collection.catalogueIds.has(id),
      );

      if (unknown.length > 0) {
        errors.push(
          `${label} has unknown ${collection.name}: ${unknown.join(", ")}.`,
        );
      }
    }

    if (doctor.topThree.length > 3) {
      errors.push(
        `${label} has ${doctor.topThree.length} topThree values; at most 3 are allowed.`,
      );
    }

    const selectedProcedureIds = new Set(doctor.procedureIds);
    const unselectedTopThree = doctor.topThree.filter(
      (procedureId) => !selectedProcedureIds.has(procedureId),
    );

    if (unselectedTopThree.length > 0) {
      errors.push(
        `${label} has topThree procedures missing from procedureIds: ${unselectedTopThree.join(", ")}.`,
      );
    }

    const sourceSpecialties = new Set(doctor.specialtyIds);
    const extraSpecialties = (existingSpecialties.get(doctor.id) ?? [])
      .map(({ specialtyId }) => specialtyId)
      .filter((id) => !sourceSpecialties.has(id));

    if (extraSpecialties.length > 0) {
      errors.push(
        `${label} already has DoctorSpecialty rows absent from specialtyIds: ${extraSpecialties.join(", ")}.`,
      );
    }
  }

  const preparedDoctors = doctors.map((doctor) => {
    const derived = deriveSubcategories(doctor, state, errors);
    return {
      ...doctor,
      ...derived,
    };
  });

  for (const doctor of preparedDoctors) {
    const label = doctorLabel(doctor);
    const sourceCategories = new Set(doctor.categoryIds);
    const extraCategories = (existingCategories.get(doctor.id) ?? [])
      .map(({ categoryId }) => categoryId)
      .filter((id) => !sourceCategories.has(id));

    if (extraCategories.length > 0) {
      errors.push(
        `${label} already has DoctorCategory rows absent from canonicalized legacy subcategoryIds: ${extraCategories.join(", ")}.`,
      );
    }

    const expectedSubcategories = new Set(doctor.derivedSubcategoryIds);
    const extraSubcategories = (existingSubcategories.get(doctor.id) ?? [])
      .map(({ subcategoryId }) => subcategoryId)
      .filter((id) => !expectedSubcategories.has(id));

    if (extraSubcategories.length > 0) {
      errors.push(
        `${label} already has DoctorSubcategory rows not derived from procedureIds and the selected categories: ${extraSubcategories.join(", ")}.`,
      );
    }

    const selectedProcedureIds = new Set(doctor.procedureIds);
    const extraProcedures = (existingProcedures.get(doctor.id) ?? [])
      .map(({ procedureId }) => procedureId)
      .filter((id) => !selectedProcedureIds.has(id));

    if (extraProcedures.length > 0) {
      errors.push(
        `${label} already has DoctorProcedure rows absent from procedureIds: ${extraProcedures.join(", ")}.`,
      );
    }
  }

  const doctorIds = new Set(doctors.map(({ id }) => id));

  for (const [relationName, rows] of [
    ["DoctorSpecialty", state.doctorSpecialties],
    ["DoctorCategory", state.doctorCategories],
    ["DoctorSubcategory", state.doctorSubcategories],
    ["DoctorProcedure", state.doctorProcedures],
  ] as const) {
    const orphanDoctorIds = [
      ...new Set(
        rows
          .map(({ doctorProfileId }) => doctorProfileId)
          .filter((id) => !doctorIds.has(id)),
      ),
    ];

    if (orphanDoctorIds.length > 0) {
      errors.push(
        `${relationName} contains rows for missing doctor profiles: ${orphanDoctorIds.join(", ")}.`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Backfill validation failed with ${errors.length} issue(s):\n- ${errors.join("\n- ")}`,
    );
  }

  return preparedDoctors;
}

function relationKey(doctorProfileId: string, catalogueId: string): string {
  return `${doctorProfileId}\u0000${catalogueId}`;
}

function summarize(
  doctors: PreparedDoctor[],
  state: DatabaseState,
): BackfillSummary {
  const existingSpecialties = new Set(
    state.doctorSpecialties.map(({ doctorProfileId, specialtyId }) =>
      relationKey(doctorProfileId, specialtyId),
    ),
  );
  const existingCategories = new Set(
    state.doctorCategories.map(({ doctorProfileId, categoryId }) =>
      relationKey(doctorProfileId, categoryId),
    ),
  );
  const existingSubcategories = new Set(
    state.doctorSubcategories.map(({ doctorProfileId, subcategoryId }) =>
      relationKey(doctorProfileId, subcategoryId),
    ),
  );
  const existingProcedures = new Set(
    state.doctorProcedures.map(({ doctorProfileId, procedureId }) =>
      relationKey(doctorProfileId, procedureId),
    ),
  );

  let specialties = 0;
  let categories = 0;
  let subcategories = 0;
  let procedures = 0;
  let topThree = 0;
  let specialtyRowsToCreate = 0;
  let categoryRowsToCreate = 0;
  let subcategoryRowsToCreate = 0;
  let procedureRowsToCreate = 0;
  let multiParentProcedureSelections = 0;

  for (const doctor of doctors) {
    specialties += doctor.specialtyIds.length;
    categories += doctor.categoryIds.length;
    subcategories += doctor.derivedSubcategoryIds.length;
    procedures += doctor.procedureIds.length;
    topThree += doctor.topThree.length;
    multiParentProcedureSelections += doctor.multiParentProcedures.length;

    specialtyRowsToCreate += doctor.specialtyIds.filter(
      (id) => !existingSpecialties.has(relationKey(doctor.id, id)),
    ).length;
    categoryRowsToCreate += doctor.categoryIds.filter(
      (id) => !existingCategories.has(relationKey(doctor.id, id)),
    ).length;
    subcategoryRowsToCreate += doctor.derivedSubcategoryIds.filter(
      (id) => !existingSubcategories.has(relationKey(doctor.id, id)),
    ).length;
    procedureRowsToCreate += doctor.procedureIds.filter(
      (id) => !existingProcedures.has(relationKey(doctor.id, id)),
    ).length;
  }

  return {
    doctors: doctors.length,
    specialties,
    categories,
    subcategories,
    procedures,
    topThree,
    specialtyRowsToCreate,
    categoryRowsToCreate,
    subcategoryRowsToCreate,
    procedureRowsToCreate,
    multiParentProcedureSelections,
    existingProcedurePricesPreserved: state.doctorProcedures.filter(
      ({ price }) => price !== null,
    ).length,
  };
}

function printSummary(title: string, summary: BackfillSummary): void {
  console.log(title);
  console.table({
    doctors: summary.doctors,
    specialtySelections: summary.specialties,
    categorySelectionsFromLegacySubcategoryIds: summary.categories,
    derivedSubcategorySelections: summary.subcategories,
    procedureSelections: summary.procedures,
    topThreeSelections: summary.topThree,
    specialtyRowsToCreate: summary.specialtyRowsToCreate,
    categoryRowsToCreate: summary.categoryRowsToCreate,
    subcategoryRowsToCreate: summary.subcategoryRowsToCreate,
    procedureRowsToCreate: summary.procedureRowsToCreate,
    multiParentProcedureSelections: summary.multiParentProcedureSelections,
    existingProcedurePricesPreserved: summary.existingProcedurePricesPreserved,
  });
}

function printMultiParentProcedures(doctors: PreparedDoctor[]): void {
  const rows = doctors.flatMap((doctor) =>
    doctor.multiParentProcedures.map(({ procedureId, subcategoryIds }) => ({
      doctor: doctor.clinicName || "Unnamed clinic",
      doctorProfileId: doctor.id,
      procedureId,
      derivedSubcategoryIds: subcategoryIds.join(", "),
    })),
  );

  if (rows.length === 0) {
    return;
  }

  console.log(
    "Multi-parent procedure selections (all listed subcategories will be linked):",
  );
  console.table(rows);
}

function printLegacyCategoryMappings(doctors: PreparedDoctor[]): void {
  const rows = doctors.flatMap((doctor) =>
    doctor.legacyCategoryMappings.map(({ legacyId, canonicalId }) => ({
      doctor: doctor.clinicName || "Unnamed clinic",
      doctorProfileId: doctor.id,
      legacyId,
      canonicalId,
    })),
  );

  if (rows.length === 0) {
    return;
  }

  console.log(
    "Known legacy category IDs canonicalized for relational writes (legacy arrays remain unchanged):",
  );
  console.table(rows);
}

function priceSnapshot(rows: DoctorProcedureRow[]): Map<string, string | null> {
  return new Map(
    rows.map(
      ({ doctorProfileId, procedureId, price }) =>
        [
          relationKey(doctorProfileId, procedureId),
          price === null ? null : String(price),
        ] as const,
    ),
  );
}

function verifyParity(
  doctors: PreparedDoctor[],
  state: DatabaseState,
  pricesBefore: Map<string, string | null>,
): void {
  const errors: string[] = [];
  const specialtiesByDoctor = groupByDoctor(state.doctorSpecialties);
  const categoriesByDoctor = groupByDoctor(state.doctorCategories);
  const subcategoriesByDoctor = groupByDoctor(state.doctorSubcategories);
  const proceduresByDoctor = groupByDoctor(state.doctorProcedures);

  for (const doctor of doctors) {
    const label = doctorLabel(doctor);
    const specialtyRows = specialtiesByDoctor.get(doctor.id) ?? [];
    const categoryRows = categoriesByDoctor.get(doctor.id) ?? [];
    const subcategoryRows = subcategoriesByDoctor.get(doctor.id) ?? [];
    const procedureRows = proceduresByDoctor.get(doctor.id) ?? [];

    const actualSpecialties = [...specialtyRows]
      .sort((a, b) => a.position - b.position)
      .map(({ specialtyId }) => specialtyId);
    const actualCategories = [...categoryRows]
      .sort((a, b) => a.position - b.position)
      .map(({ categoryId }) => categoryId);
    const actualSubcategories = [...subcategoryRows]
      .sort((a, b) => a.position - b.position)
      .map(({ subcategoryId }) => subcategoryId);
    const actualProcedures = [...procedureRows]
      .sort((a, b) => a.position - b.position)
      .map(({ procedureId }) => procedureId);
    const actualTopThree = procedureRows
      .filter(
        (row): row is DoctorProcedureRow & { topRank: number } =>
          row.topRank !== null,
      )
      .sort((a, b) => a.topRank - b.topRank)
      .map(({ procedureId }) => procedureId);

    const comparisons: Array<[string, string[], string[]]> = [
      ["specialtyIds", doctor.specialtyIds, actualSpecialties],
      [
        "canonicalized legacy subcategoryIds -> DoctorCategory",
        doctor.categoryIds,
        actualCategories,
      ],
      [
        "procedure-derived DoctorSubcategory",
        doctor.derivedSubcategoryIds,
        actualSubcategories,
      ],
      ["procedureIds", doctor.procedureIds, actualProcedures],
      ["topThree", doctor.topThree, actualTopThree],
    ];

    for (const [name, expected, actual] of comparisons) {
      if (
        expected.length !== actual.length ||
        expected.some((value, index) => value !== actual[index])
      ) {
        errors.push(
          `${label} ${name} parity mismatch. Expected [${expected.join(", ")}], got [${actual.join(", ")}].`,
        );
      }
    }

    for (const row of procedureRows) {
      const key = relationKey(row.doctorProfileId, row.procedureId);

      if (!pricesBefore.has(key)) {
        continue;
      }

      const before = pricesBefore.get(key);
      const after = row.price === null ? null : String(row.price);

      if (before !== after) {
        errors.push(
          `${label} price changed unexpectedly for procedure "${row.procedureId}".`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Parity verification failed with ${errors.length} issue(s):\n- ${errors.join("\n- ")}`,
    );
  }
}

async function backfill(
  prisma: PrismaClientLike,
  doctors: PreparedDoctor[],
  pricesBefore: Map<string, string | null>,
): Promise<void> {
  await prisma.$transaction(
    async (transaction) => {
      for (const doctor of doctors) {
        for (const [position, specialtyId] of doctor.specialtyIds.entries()) {
          await transaction.doctorSpecialty.upsert({
            where: {
              doctorProfileId_specialtyId: {
                doctorProfileId: doctor.id,
                specialtyId,
              },
            },
            update: { position },
            create: {
              doctorProfileId: doctor.id,
              specialtyId,
              position,
            },
          });
        }

        for (const [position, categoryId] of doctor.categoryIds.entries()) {
          await transaction.doctorCategory.upsert({
            where: {
              doctorProfileId_categoryId: {
                doctorProfileId: doctor.id,
                categoryId,
              },
            },
            update: { position },
            create: {
              doctorProfileId: doctor.id,
              categoryId,
              position,
            },
          });
        }

        for (const [
          position,
          subcategoryId,
        ] of doctor.derivedSubcategoryIds.entries()) {
          await transaction.doctorSubcategory.upsert({
            where: {
              doctorProfileId_subcategoryId: {
                doctorProfileId: doctor.id,
                subcategoryId,
              },
            },
            update: { position },
            create: {
              doctorProfileId: doctor.id,
              subcategoryId,
              position,
            },
          });
        }

        // Clear ranks first so swapped top-three positions cannot violate the
        // unique (doctorProfileId, topRank) constraint during a rerun.
        await transaction.doctorProcedure.updateMany({
          where: { doctorProfileId: doctor.id },
          data: { topRank: null },
        });

        for (const [position, procedureId] of doctor.procedureIds.entries()) {
          await transaction.doctorProcedure.upsert({
            where: {
              doctorProfileId_procedureId: {
                doctorProfileId: doctor.id,
                procedureId,
              },
            },
            // Deliberately omit price so a rerun preserves doctor pricing.
            update: { position },
            create: {
              doctorProfileId: doctor.id,
              procedureId,
              position,
              topRank: null,
              price: null,
            },
          });
        }

        for (const [index, procedureId] of doctor.topThree.entries()) {
          await transaction.doctorProcedure.update({
            where: {
              doctorProfileId_procedureId: {
                doctorProfileId: doctor.id,
                procedureId,
              },
            },
            data: { topRank: index + 1 },
          });
        }
      }

      const stateAfter = await loadState(transaction);
      verifyParity(doctors, stateAfter, pricesBefore);
    },
    {
      maxWait: 30_000,
      timeout: 300_000,
    },
  );
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  if (!options.prismaModulePath) {
    throw new Error("Missing required --prisma-module path.");
  }

  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

  console.log(`Database target: ${databaseTarget()}`);

  const prismaModule = await importModule(options.prismaModulePath);
  const prisma = prismaModule.prisma as PrismaClientLike | undefined;

  if (
    !prisma ||
    typeof prisma.$transaction !== "function" ||
    typeof prisma.$disconnect !== "function"
  ) {
    throw new Error(
      `The Prisma module "${options.prismaModulePath}" must export the configured client as "prisma".`,
    );
  }

  try {
    const state = await loadState(prisma);
    const doctors = validateSource(state);
    const summary = summarize(doctors, state);
    const pricesBefore = priceSnapshot(state.doctorProcedures);

    printSummary("Doctor relation backfill validation passed.", summary);
    printLegacyCategoryMappings(doctors);
    printMultiParentProcedures(doctors);

    if (options.dryRun) {
      console.log("Dry run complete. The database was not changed.");
      return;
    }

    await backfill(prisma, doctors, pricesBefore);
    console.log(
      `Doctor relation backfill completed with exact parity for ${doctors.length} doctor profile(s).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Doctor relation backfill failed: ${message}`);
  process.exitCode = 1;
});