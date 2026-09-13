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

type DoctorProcedureRow = {
  doctorProfileId: string;
  procedureId: string;
  position: number;
  topRank: number | null;
  price: unknown;
};

type SubcategoryRow = {
  id: string;
  categoryId: string;
  sortOrder: number;
};

type ProcedureSubcategoryRow = {
  procedureId: string;
  subcategoryId: string;
  sortOrder: number;
};

type PreparedDoctor = DoctorProfileRow & {
  categoryIds: string[];
  derivedSubcategoryIds: string[];
};

type CliOptions = {
  prismaModulePath?: string;
  dryRun: boolean;
  help: boolean;
};

const LEGACY_CATEGORY_ID_ALIASES: Readonly<Record<string, string>> = {
  wellness_and_drainage: "wellness_and_postoperative",
};

function printUsage() {
  console.log(`
Backfill normalized doctor catalogue relations from legacy DoctorProfile arrays.

Usage:
  npx tsx scripts/backfill-doctor-catalogue-relations-v2.ts \\
    --prisma-module lib/database/prisma.ts \\
    --dry-run

Behavior:
  - specialtyIds           -> DoctorSpecialty
  - legacy subcategoryIds  -> DoctorCategory
  - procedure-derived rows -> DoctorSubcategory
  - procedureIds           -> DoctorProcedure
  - topThree               -> DoctorProcedure.topRank when safe
  - existing relational rows are preserved
  - existing DoctorProcedure.price values are preserved
  - legacy arrays are never changed

IMPORTANT:
  Legacy DoctorProfile.subcategoryIds intentionally contains CATEGORY IDs.
`.trim());
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false, help: false };

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

    if (!value) throw new Error(`Missing value for ${flag}.`);

    if (flag === "--prisma-module") {
      options.prismaModulePath = value;
      continue;
    }

    throw new Error(`Unknown option: ${flag}`);
  }

  return options;
}

function absolutePath(path: string) {
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

async function importModule(path: string): Promise<JsonObject> {
  return (await import(pathToFileURL(absolutePath(path)).href)) as JsonObject;
}

function databaseTarget() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return "DATABASE_URL is not set";

  try {
    const url = new URL(databaseUrl);
    return `host=${url.hostname}, database=${decodeURIComponent(
      url.pathname.replace(/^\//, ""),
    )}, schema=${url.searchParams.get("schema") ?? "public"}`;
  } catch {
    return "DATABASE_URL is set but could not be parsed";
  }
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function label(doctor: DoctorProfileRow) {
  return `${doctor.clinicName || "Unnamed clinic"} (profile ${doctor.id}, user ${doctor.userId})`;
}

function relationKey(doctorProfileId: string, id: string) {
  return `${doctorProfileId}\u0000${id}`;
}

async function loadState(prisma: any) {
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
      select: { id: true, categoryId: true, sortOrder: true },
    }),
    prisma.procedure.findMany({ select: { id: true } }),
    prisma.procedureSubcategory.findMany({
      select: { procedureId: true, subcategoryId: true, sortOrder: true },
    }),
    prisma.doctorSpecialty.findMany({
      select: { doctorProfileId: true, specialtyId: true, position: true },
    }),
    prisma.doctorCategory.findMany({
      select: { doctorProfileId: true, categoryId: true, position: true },
    }),
    prisma.doctorSubcategory.findMany({
      select: { doctorProfileId: true, subcategoryId: true, position: true },
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
    doctors: doctors as DoctorProfileRow[],
    specialtyIds: new Set<string>(specialties.map((row: { id: string }) => row.id)),
    categoryIds: new Set<string>(categories.map((row: { id: string }) => row.id)),
    subcategories: subcategories as SubcategoryRow[],
    procedureIds: new Set<string>(procedures.map((row: { id: string }) => row.id)),
    procedureSubcategoryLinks:
      procedureSubcategoryLinks as ProcedureSubcategoryRow[],
    doctorSpecialties,
    doctorCategories,
    doctorSubcategories,
    doctorProcedures: doctorProcedures as DoctorProcedureRow[],
  };
}

function prepareDoctors(state: Awaited<ReturnType<typeof loadState>>) {
  const errors: string[] = [];
  const warnings: string[] = [];

  const subcategoryById = new Map(
    state.subcategories.map((subcategory) => [subcategory.id, subcategory]),
  );

  const linksByProcedure = new Map<string, ProcedureSubcategoryRow[]>();

  for (const link of state.procedureSubcategoryLinks) {
    const rows = linksByProcedure.get(link.procedureId) ?? [];
    rows.push(link);
    linksByProcedure.set(link.procedureId, rows);
  }

  const doctors: PreparedDoctor[] = state.doctors.map((source) => {
    const sourceDoctor: DoctorProfileRow = {
      ...source,
      specialtyIds: unique(source.specialtyIds),
      subcategoryIds: unique(source.subcategoryIds),
      procedureIds: unique(source.procedureIds),
      topThree: unique(source.topThree),
    };

    const doctorName = label(sourceDoctor);

    // IMPORTANT: legacy subcategoryIds are CATEGORY IDs.
    const categoryIds = sourceDoctor.subcategoryIds.map(
      (id) => LEGACY_CATEGORY_ID_ALIASES[id] ?? id,
    );

    const unknownSpecialties = sourceDoctor.specialtyIds.filter(
      (id) => !state.specialtyIds.has(id),
    );

    const unknownCategories = categoryIds.filter(
      (id) => !state.categoryIds.has(id),
    );

    if (unknownSpecialties.length) {
      errors.push(
        `${doctorName} has unknown specialtyIds: ${unknownSpecialties.join(", ")}.`,
      );
    }

    if (unknownCategories.length) {
      errors.push(
        `${doctorName} has unknown legacy category IDs: ${unknownCategories.join(", ")}.`,
      );
    }

    /*
     * Legacy procedure arrays can contain IDs that no longer exist in the
     * normalized Procedure catalogue. Production data should not be blocked by
     * those stale values: skip them and continue migrating everything valid.
     */
    const knownProcedureIds = sourceDoctor.procedureIds.filter((procedureId) => {
      if (state.procedureIds.has(procedureId)) {
        return true;
      }

      warnings.push(
        `${doctorName} skipped unknown legacy procedureId "${procedureId}".`,
      );

      return false;
    });

    const selectedCategoryOrder = new Map(
      categoryIds.map((categoryId, index) => [categoryId, index]),
    );

    const derivedSubcategoryIds: string[] = [];
    const seenSubcategories = new Set<string>();
    const migratableProcedureIds: string[] = [];

    for (const procedureId of knownProcedureIds) {
      const links = (linksByProcedure.get(procedureId) ?? [])
        .filter((link) => {
          const subcategory = subcategoryById.get(link.subcategoryId);

          return Boolean(
            subcategory && selectedCategoryOrder.has(subcategory.categoryId),
          );
        })
        .sort((a, b) => {
          const aSub = subcategoryById.get(a.subcategoryId)!;
          const bSub = subcategoryById.get(b.subcategoryId)!;

          return (
            selectedCategoryOrder.get(aSub.categoryId)! -
              selectedCategoryOrder.get(bSub.categoryId)! ||
            a.sortOrder - b.sortOrder ||
            aSub.sortOrder - bSub.sortOrder ||
            a.subcategoryId.localeCompare(b.subcategoryId)
          );
        });

      /*
       * A procedure may still exist in Procedure but no longer have a usable
       * ProcedureSubcategory link for this doctor's legacy categories. Treat
       * that stale selection the same way as an unknown procedure: skip it.
       */
      if (links.length === 0) {
        warnings.push(
          `${doctorName} skipped legacy procedure "${procedureId}" because it has no ProcedureSubcategory link inside selected legacy categories [${categoryIds.join(", ")}].`,
        );

        continue;
      }

      migratableProcedureIds.push(procedureId);

      for (const link of links) {
        if (!seenSubcategories.has(link.subcategoryId)) {
          seenSubcategories.add(link.subcategoryId);
          derivedSubcategoryIds.push(link.subcategoryId);
        }
      }
    }

    const migratableProcedureSet = new Set(migratableProcedureIds);

    const filteredTopThree = sourceDoctor.topThree.filter((procedureId) => {
      if (migratableProcedureSet.has(procedureId)) {
        return true;
      }

      warnings.push(
        `${doctorName} skipped legacy topThree procedure "${procedureId}" because it is not being migrated as a valid DoctorProcedure.`,
      );

      return false;
    });

    if (filteredTopThree.length > 3) {
      errors.push(`${doctorName} has more than 3 valid topThree values.`);
    }

    return {
      ...sourceDoctor,
      categoryIds,
      procedureIds: migratableProcedureIds,
      topThree: filteredTopThree.slice(0, 3),
      derivedSubcategoryIds,
    };
  });

  if (warnings.length > 0) {
    console.log(
      `Legacy catalogue warnings (${warnings.length}) — these values will be skipped:`,
    );

    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (errors.length) {
    throw new Error(
      `Backfill validation failed with ${errors.length} issue(s):\n- ${errors.join("\n- ")}`,
    );
  }

  return doctors;
}

function planTopRanks(
  doctors: PreparedDoctor[],
  existingRows: DoctorProcedureRow[],
) {
  const assignments = new Map<string, number>();
  const conflicts: Array<{
    doctor: string;
    procedureId: string;
    desiredRank: number;
    reason: string;
  }> = [];

  const byDoctor = new Map<string, DoctorProcedureRow[]>();

  for (const row of existingRows) {
    const rows = byDoctor.get(row.doctorProfileId) ?? [];
    rows.push(row);
    byDoctor.set(row.doctorProfileId, rows);
  }

  for (const doctor of doctors) {
    const rows = byDoctor.get(doctor.id) ?? [];
    const byProcedure = new Map(rows.map((row) => [row.procedureId, row]));
    const rankOwners = new Map<number, string>();

    for (const row of rows) {
      if (row.topRank !== null) rankOwners.set(row.topRank, row.procedureId);
    }

    doctor.topThree.forEach((procedureId, index) => {
      const desiredRank = index + 1;
      const existing = byProcedure.get(procedureId);

      if (existing?.topRank !== null && existing?.topRank !== undefined) {
        if (existing.topRank !== desiredRank) {
          conflicts.push({
            doctor: doctor.clinicName || doctor.userId,
            procedureId,
            desiredRank,
            reason: `Already has relational topRank ${existing.topRank}; preserved.`,
          });
        }
        return;
      }

      const owner = rankOwners.get(desiredRank);
      if (owner && owner !== procedureId) {
        conflicts.push({
          doctor: doctor.clinicName || doctor.userId,
          procedureId,
          desiredRank,
          reason: `Rank ${desiredRank} already belongs to relational procedure "${owner}"; preserved.`,
        });
        return;
      }

      assignments.set(relationKey(doctor.id, procedureId), desiredRank);
      rankOwners.set(desiredRank, procedureId);
    });
  }

  return { assignments, conflicts };
}

function printSummary(
  doctors: PreparedDoctor[],
  state: Awaited<ReturnType<typeof loadState>>,
) {
  const existingSpecialties = new Set(
    state.doctorSpecialties.map((row: any) =>
      relationKey(row.doctorProfileId, row.specialtyId),
    ),
  );
  const existingCategories = new Set(
    state.doctorCategories.map((row: any) =>
      relationKey(row.doctorProfileId, row.categoryId),
    ),
  );
  const existingSubcategories = new Set(
    state.doctorSubcategories.map((row: any) =>
      relationKey(row.doctorProfileId, row.subcategoryId),
    ),
  );
  const existingProcedures = new Set(
    state.doctorProcedures.map((row) =>
      relationKey(row.doctorProfileId, row.procedureId),
    ),
  );

  let specialtyRowsToCreate = 0;
  let categoryRowsToCreate = 0;
  let subcategoryRowsToCreate = 0;
  let procedureRowsToCreate = 0;

  for (const doctor of doctors) {
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

  console.table({
    doctors: doctors.length,
    specialtyRowsToCreate,
    categoryRowsToCreate,
    subcategoryRowsToCreate,
    procedureRowsToCreate,
    existingSpecialtyRowsPreserved: state.doctorSpecialties.length,
    existingCategoryRowsPreserved: state.doctorCategories.length,
    existingSubcategoryRowsPreserved: state.doctorSubcategories.length,
    existingProcedureRowsPreserved: state.doctorProcedures.length,
    existingProcedurePricesPreserved: state.doctorProcedures.filter(
      (row) => row.price !== null,
    ).length,
  });
}

function priceSnapshot(rows: DoctorProcedureRow[]) {
  return new Map(
    rows.map((row) => [
      relationKey(row.doctorProfileId, row.procedureId),
      row.price === null ? null : String(row.price),
    ]),
  );
}

async function verify(
  prisma: any,
  doctors: PreparedDoctor[],
  pricesBefore: Map<string, string | null>,
  topRankAssignments: Map<string, number>,
) {
  const state = await loadState(prisma);
  const errors: string[] = [];

  const specialtyKeys = new Set(
    state.doctorSpecialties.map((row: any) =>
      relationKey(row.doctorProfileId, row.specialtyId),
    ),
  );
  const categoryKeys = new Set(
    state.doctorCategories.map((row: any) =>
      relationKey(row.doctorProfileId, row.categoryId),
    ),
  );
  const subcategoryKeys = new Set(
    state.doctorSubcategories.map((row: any) =>
      relationKey(row.doctorProfileId, row.subcategoryId),
    ),
  );
  const procedureMap = new Map(
    state.doctorProcedures.map((row) => [
      relationKey(row.doctorProfileId, row.procedureId),
      row,
    ]),
  );

  for (const doctor of doctors) {
    for (const id of doctor.specialtyIds) {
      if (!specialtyKeys.has(relationKey(doctor.id, id))) {
        errors.push(`${label(doctor)} missing DoctorSpecialty "${id}".`);
      }
    }
    for (const id of doctor.categoryIds) {
      if (!categoryKeys.has(relationKey(doctor.id, id))) {
        errors.push(`${label(doctor)} missing DoctorCategory "${id}".`);
      }
    }
    for (const id of doctor.derivedSubcategoryIds) {
      if (!subcategoryKeys.has(relationKey(doctor.id, id))) {
        errors.push(`${label(doctor)} missing DoctorSubcategory "${id}".`);
      }
    }
    for (const id of doctor.procedureIds) {
      if (!procedureMap.has(relationKey(doctor.id, id))) {
        errors.push(`${label(doctor)} missing DoctorProcedure "${id}".`);
      }
    }
  }

  for (const [key, beforePrice] of pricesBefore) {
    const row = procedureMap.get(key);
    if (!row) {
      errors.push(`Existing DoctorProcedure ${key} disappeared.`);
      continue;
    }

    const afterPrice = row.price === null ? null : String(row.price);
    if (beforePrice !== afterPrice) {
      errors.push(`Existing DoctorProcedure price changed for ${key}.`);
    }
  }

  for (const [key, expectedRank] of topRankAssignments) {
    const row = procedureMap.get(key);
    if (!row || row.topRank !== expectedRank) {
      errors.push(
        `Expected ${key} to have topRank ${expectedRank}, got ${row?.topRank ?? "missing"}.`,
      );
    }
  }

  if (errors.length) {
    throw new Error(
      `Backfill verification failed with ${errors.length} issue(s):\n- ${errors.join("\n- ")}`,
    );
  }
}

async function backfill(
  prisma: any,
  doctors: PreparedDoctor[],
  pricesBefore: Map<string, string | null>,
  topRankAssignments: Map<string, number>,
) {
  await prisma.$transaction(
    async (tx: any) => {
      for (const doctor of doctors) {
        for (const [position, specialtyId] of doctor.specialtyIds.entries()) {
          await tx.doctorSpecialty.upsert({
            where: {
              doctorProfileId_specialtyId: {
                doctorProfileId: doctor.id,
                specialtyId,
              },
            },
            update: { position },
            create: { doctorProfileId: doctor.id, specialtyId, position },
          });
        }

        // Legacy subcategoryIds -> DoctorCategory (intentional).
        for (const [position, categoryId] of doctor.categoryIds.entries()) {
          await tx.doctorCategory.upsert({
            where: {
              doctorProfileId_categoryId: {
                doctorProfileId: doctor.id,
                categoryId,
              },
            },
            update: { position },
            create: { doctorProfileId: doctor.id, categoryId, position },
          });
        }

        for (const [position, subcategoryId] of doctor.derivedSubcategoryIds.entries()) {
          await tx.doctorSubcategory.upsert({
            where: {
              doctorProfileId_subcategoryId: {
                doctorProfileId: doctor.id,
                subcategoryId,
              },
            },
            update: { position },
            create: { doctorProfileId: doctor.id, subcategoryId, position },
          });
        }

        for (const [position, procedureId] of doctor.procedureIds.entries()) {
          await tx.doctorProcedure.upsert({
            where: {
              doctorProfileId_procedureId: {
                doctorProfileId: doctor.id,
                procedureId,
              },
            },
            // Preserve existing price and topRank.
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

        for (const procedureId of doctor.topThree) {
          const desiredRank = topRankAssignments.get(
            relationKey(doctor.id, procedureId),
          );

          if (desiredRank === undefined) continue;

          await tx.doctorProcedure.update({
            where: {
              doctorProfileId_procedureId: {
                doctorProfileId: doctor.id,
                procedureId,
              },
            },
            data: { topRank: desiredRank },
          });
        }
      }

      await verify(tx, doctors, pricesBefore, topRankAssignments);
    },
    { maxWait: 30_000, timeout: 300_000 },
  );
}

async function main() {
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
  const prisma = prismaModule.prisma as any;

  if (!prisma?.$transaction || !prisma?.$disconnect) {
    throw new Error(
      `The Prisma module "${options.prismaModulePath}" must export the configured client as "prisma".`,
    );
  }

  try {
    const state = await loadState(prisma);
    const doctors = prepareDoctors(state);
    const pricesBefore = priceSnapshot(state.doctorProcedures);
    const { assignments, conflicts } = planTopRanks(
      doctors,
      state.doctorProcedures,
    );

    printSummary(doctors, state);

    if (conflicts.length) {
      console.log(
        "Legacy topThree values not applied because newer relational topRank data already exists:",
      );
      console.table(conflicts);
    }

    console.log(`Safe legacy topThree ranks to migrate: ${assignments.size}`);

    if (options.dryRun) {
      console.log("Dry run complete. The database was not changed.");
      return;
    }

    await backfill(prisma, doctors, pricesBefore, assignments);

    console.log(
      `Additive doctor catalogue backfill completed for ${doctors.length} doctor profile(s). Existing relational selections and prices were preserved.`,
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