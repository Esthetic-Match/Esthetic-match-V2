import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(
  process.cwd(),
  process.env.NODE_ENV !== "production",
);

type JsonObject = Record<string, unknown>;

type SpecialtyItem = {
  id: string;
  labelKey: string;
  descriptionKey?: string;
  icon?: string;
};

type SpecialtyGroup = {
  titleKey: string;
  items: SpecialtyItem[];
};

type ProcedureItem = {
  id: string;
  name?: string;
};

type SubcategoryItem = {
  subcategory: string;
  procedures: ProcedureItem[];
};

type CategoryItem = {
  id: string;
  key?: string;
  slug: string;
  href?: string;
  homeImage?: string;
  dashboardImage?: string;
  icon?: string;
  category?: string;
  subcategories: SubcategoryItem[];
};

type DoctorCatalogue = {
  specialties: {
    items: string[];
    groups: SpecialtyGroup[];
  };
  categories: CategoryItem[];
};

type UpsertDelegate = {
  upsert(args: {
    where: Record<string, unknown>;
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }): Promise<unknown>;
};

type CatalogueTransaction = {
  catalogLocale: UpsertDelegate;
  specialtyGroup: UpsertDelegate;
  specialtyGroupTranslation: UpsertDelegate;
  specialty: UpsertDelegate;
  specialtyTranslation: UpsertDelegate;
  category: UpsertDelegate;
  categoryTranslation: UpsertDelegate;
  specialtyCategory: UpsertDelegate;
  subcategory: UpsertDelegate;
  subcategoryTranslation: UpsertDelegate;
  procedure: UpsertDelegate;
  procedureTranslation: UpsertDelegate;
  procedureSubcategory: UpsertDelegate;
};

type PrismaClientLike = CatalogueTransaction & {
  $transaction<T>(
    callback: (transaction: CatalogueTransaction) => Promise<T>,
    options?: { maxWait?: number; timeout?: number },
  ): Promise<T>;
  $disconnect(): Promise<void>;
};

type LocaleInput = {
  code: string;
  displayName: string;
  directory: string;
  names: {
    specialties: Record<string, string>;
    categories: Record<string, string>;
    subcategories: Record<string, string>;
    procedures: Record<string, string>;
  };
};

type PreparedSpecialtyGroup = {
  id: string;
  sortOrder: number;
  translations: Map<string, string>;
};

type PreparedSpecialty = {
  id: string;
  specialtyGroupId: string;
  icon: string | null;
  sortOrder: number;
  translations: Map<
    string,
    {
      name: string;
      description: string | null;
    }
  >;
};

type PreparedCategory = {
  id: string;
  slug: string;
  href: string | null;
  homeImage: string | null;
  dashboardImage: string | null;
  icon: string | null;
  sortOrder: number;
  translations: Map<string, string>;
};

type PreparedSubcategory = {
  id: string;
  categoryId: string;
  sortOrder: number;
  translations: Map<string, string>;
};

type PreparedProcedure = {
  id: string;
  translations: Map<string, string>;
};

type PreparedProcedureLink = {
  procedureId: string;
  subcategoryId: string;
  sortOrder: number;
};

type PreparedSpecialtyCategory = {
  specialtyId: string;
  categoryId: string;
  sortOrder: number;
};

type PreparedCatalogue = {
  specialtyGroups: PreparedSpecialtyGroup[];
  specialties: PreparedSpecialty[];
  categories: PreparedCategory[];
  specialtyCategories: PreparedSpecialtyCategory[];
  subcategories: PreparedSubcategory[];
  procedures: PreparedProcedure[];
  procedureLinks: PreparedProcedureLink[];
};

type CliOptions = {
  cataloguePath?: string;
  specialtyMapPath?: string;
  prismaModulePath?: string;
  messagesDirSpecs: string[];
  dryRun: boolean;
  help: boolean;
};

const TRANSLATION_FILES = {
  specialties: "specialitiesName.json",
  categories: "categoriesName.json",
  subcategories: "subcategoriesName.json",
  procedures: "proceduresName.json",
} as const;

const CATEGORY_ID_ALIASES: Readonly<Record<string, string>> = {
  longevity: "longevity_medicine",
};

const LOCALE_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  en: "English",
  fr: "Français",
};

function printUsage(): void {
  console.log(`
Import the normalized Esthetic Match doctor catalogue.

Usage:
  npx tsx scripts/import-doctor-catalogue.ts \\
    --catalogue lib/doctorCatalogue.ts \\
    --specialty-map lib/specialityMap.ts \\
    --prisma-module lib/database/prisma.ts \\
    --messages-dir en:messages/en \\
    --messages-dir fr:messages/fr

Options:
  --catalogue       Module exporting DoctorCatalog
  --specialty-map   Module exporting SPECIALTY_CATEGORY_MAP
  --prisma-module   Module exporting the configured prisma client as "prisma"
  --messages-dir    Locale code and directory containing the four translation
                    files; repeat for every locale
  --dry-run         Validate and print counts without connecting to the database
  --help            Show this help

Notes:
  - Each messages directory must contain specialitiesName.json,
    categoriesName.json, subcategoriesName.json, and proceduresName.json.
  - Run this with "tsx" so TypeScript catalogue modules can be imported.
  - Paths may be absolute or relative to the current working directory.
  - The script only upserts catalogue data. It does not modify DoctorProfile.
`.trim());
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    messagesDirSpecs: [],
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

    const [inlineFlag, inlineValue] = argument.split("=", 2);
    const value =
      inlineValue ??
      (index + 1 < argv.length && !argv[index + 1].startsWith("--")
        ? argv[++index]
        : undefined);

    if (!value) {
      throw new Error(`Missing value for ${inlineFlag}.`);
    }

    switch (inlineFlag) {
      case "--catalogue":
        options.cataloguePath = value;
        break;
      case "--specialty-map":
        options.specialtyMapPath = value;
        break;
      case "--prisma-module":
        options.prismaModulePath = value;
        break;
      case "--messages-dir":
        options.messagesDirSpecs.push(value);
        break;
      default:
        throw new Error(`Unknown option: ${inlineFlag}`);
    }
  }

  return options;
}

function absolutePath(path: string): string {
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

async function importModule(path: string): Promise<JsonObject> {
  const moduleUrl = pathToFileURL(absolutePath(path)).href;
  return (await import(moduleUrl)) as JsonObject;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, label: string): JsonObject {
  if (!isObject(value)) {
    throw new Error(`${label} must be an object.`);
  }

  return value;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: "${value}".`);
    }

    seen.add(value);
  }
}

function requireTranslation(
  value: string | undefined,
  localeCode: string,
  entityType: string,
  entityId: string,
  expectedKey: string,
): string {
  if (value) {
    return value;
  }

  throw new Error(
    `Missing ${localeCode} translation for ${entityType} "${entityId}". ` +
      `Expected key "${expectedKey}" in that locale's translation file.`,
  );
}

function parseMessagesDirSpec(
  spec: string,
): { code: string; directory: string } {
  const separatorIndex = spec.indexOf(":");

  if (separatorIndex <= 0 || separatorIndex === spec.length - 1) {
    throw new Error(
      `Invalid --messages-dir value "${spec}". Expected locale:path/to/messages/locale.`,
    );
  }

  return {
    code: spec.slice(0, separatorIndex).trim().toLowerCase(),
    directory: spec.slice(separatorIndex + 1).trim(),
  };
}

async function loadTranslationDictionary(
  path: string,
  label: string,
): Promise<Record<string, string>> {
  const parsed = requireObject(
    JSON.parse(await readFile(path, "utf8")) as unknown,
    label,
  );
  const translations: Record<string, string> = {};

  for (const [key, value] of Object.entries(parsed)) {
    translations[requireString(key, `${label} key`)] = requireString(
      value,
      `${label}["${key}"]`,
    );
  }

  return translations;
}

async function loadLocales(specs: string[]): Promise<LocaleInput[]> {
  if (specs.length === 0) {
    throw new Error(
      "Provide at least one --messages-dir value. English and French are expected.",
    );
  }

  const parsedSpecs = specs.map(parseMessagesDirSpec);
  assertUnique(
    parsedSpecs.map(({ code }) => code),
    "locale code",
  );

  const locales = await Promise.all(
    parsedSpecs.map(async ({ code, directory }) => {
      const absoluteDirectory = absolutePath(directory);
      const entries = await Promise.all(
        Object.entries(TRANSLATION_FILES).map(
          async ([entityType, filename]) => {
            const path = resolve(absoluteDirectory, filename);
            const dictionary = await loadTranslationDictionary(
              path,
              `${code} ${entityType} translations (${path})`,
            );
            return [entityType, dictionary] as const;
          },
        ),
      );

      return {
        code,
        displayName: LOCALE_DISPLAY_NAMES[code] ?? code,
        directory,
        names: Object.fromEntries(entries) as LocaleInput["names"],
      };
    }),
  );

  const localeCodes = new Set(locales.map(({ code }) => code));

  for (const requiredLocale of ["en", "fr"]) {
    if (!localeCodes.has(requiredLocale)) {
      throw new Error(
        `Missing required "${requiredLocale}" locale. Pass --messages-dir ${requiredLocale}:messages/${requiredLocale}.`,
      );
    }
  }

  return locales;
}

function humanizeIdentifier(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function specialtyGroupId(titleKey: string): string {
  const segments = titleKey.split(".");
  return requireString(
    segments.at(-1),
    `Specialty group ID derived from "${titleKey}"`,
  );
}

function prepareCatalogue(
  catalogue: DoctorCatalogue,
  specialtyCategoryMap: Record<string, string[]>,
  locales: LocaleInput[],
): PreparedCatalogue {
  if (
    !catalogue.specialties ||
    !Array.isArray(catalogue.specialties.items) ||
    !Array.isArray(catalogue.specialties.groups) ||
    !Array.isArray(catalogue.categories)
  ) {
    throw new Error("DoctorCatalog does not have the expected structure.");
  }

  const specialtyIds = catalogue.specialties.items.map((id, index) =>
    requireString(id, `DoctorCatalog.specialties.items[${index}]`),
  );
  const categoryIds = catalogue.categories.map((category, index) =>
    requireString(category.id, `DoctorCatalog.categories[${index}].id`),
  );

  assertUnique(specialtyIds, "specialty ID");
  assertUnique(categoryIds, "category ID");

  const specialtyIdSet = new Set(specialtyIds);
  const categoryIdSet = new Set(categoryIds);
  const specialtyOccurrences = new Map<string, number>();

  const specialtyGroups: PreparedSpecialtyGroup[] =
    catalogue.specialties.groups.map((group, groupIndex) => {
      const id = specialtyGroupId(group.titleKey);
      const translations = new Map<string, string>();

      for (const locale of locales) {
        translations.set(locale.code, humanizeIdentifier(id));
      }

      for (const item of group.items) {
        specialtyOccurrences.set(
          item.id,
          (specialtyOccurrences.get(item.id) ?? 0) + 1,
        );
      }

      return {
        id,
        sortOrder: groupIndex,
        translations,
      };
    });

  assertUnique(
    specialtyGroups.map(({ id }) => id),
    "specialty group ID",
  );

  for (const specialtyId of specialtyIds) {
    const occurrenceCount = specialtyOccurrences.get(specialtyId) ?? 0;

    if (occurrenceCount !== 1) {
      throw new Error(
        `Specialty "${specialtyId}" must appear in exactly one specialty group; found ${occurrenceCount}.`,
      );
    }
  }

  for (const groupedSpecialtyId of specialtyOccurrences.keys()) {
    if (!specialtyIdSet.has(groupedSpecialtyId)) {
      throw new Error(
        `Specialty group contains "${groupedSpecialtyId}", but it is missing from specialties.items.`,
      );
    }
  }

  let specialtySortOrder = 0;
  const specialties: PreparedSpecialty[] = [];

  for (const group of catalogue.specialties.groups) {
    const groupId = specialtyGroupId(group.titleKey);

    for (const item of group.items) {
      const translations = new Map<
        string,
        { name: string; description: string | null }
      >();

      for (const locale of locales) {
        translations.set(locale.code, {
          name: requireTranslation(
            locale.names.specialties[item.id],
            locale.code,
            "specialty",
            item.id,
            `${TRANSLATION_FILES.specialties} -> ${item.id}`,
          ),
          description: null,
        });
      }

      specialties.push({
        id: item.id,
        specialtyGroupId: groupId,
        icon: item.icon ?? null,
        sortOrder: specialtySortOrder,
        translations,
      });
      specialtySortOrder += 1;
    }
  }

  const categories: PreparedCategory[] = [];
  const subcategories: PreparedSubcategory[] = [];
  const proceduresById = new Map<string, PreparedProcedure>();
  const procedureLinks: PreparedProcedureLink[] = [];
  const subcategoryParent = new Map<string, string>();

  for (const [categoryIndex, category] of catalogue.categories.entries()) {
    const categoryId = requireString(
      category.id,
      `DoctorCatalog.categories[${categoryIndex}].id`,
    );

    if (category.category && category.category !== categoryId) {
      throw new Error(
        `Category "${categoryId}" has mismatched category value "${category.category}".`,
      );
    }

    const categoryTranslations = new Map<string, string>();

    for (const locale of locales) {
      categoryTranslations.set(
        locale.code,
        requireTranslation(
          locale.names.categories[categoryId],
          locale.code,
          "category",
          categoryId,
          `${TRANSLATION_FILES.categories} -> ${categoryId}`,
        ),
      );
    }

    categories.push({
      id: categoryId,
      slug: requireString(
        category.slug,
        `Category "${categoryId}" slug`,
      ),
      href: category.href ?? null,
      homeImage: category.homeImage ?? null,
      dashboardImage: category.dashboardImage ?? null,
      icon: category.icon ?? null,
      sortOrder: categoryIndex,
      translations: categoryTranslations,
    });

    for (const [
      subcategoryIndex,
      subcategory,
    ] of category.subcategories.entries()) {
      const subcategoryId = requireString(
        subcategory.subcategory,
        `Category "${categoryId}" subcategory ${subcategoryIndex}`,
      );
      const existingParent = subcategoryParent.get(subcategoryId);

      if (existingParent && existingParent !== categoryId) {
        throw new Error(
          `Subcategory "${subcategoryId}" appears under both "${existingParent}" and "${categoryId}". ` +
            "The current schema requires each subcategory to have one category.",
        );
      }

      if (existingParent === categoryId) {
        throw new Error(
          `Subcategory "${subcategoryId}" is duplicated within category "${categoryId}".`,
        );
      }

      subcategoryParent.set(subcategoryId, categoryId);

      const subcategoryTranslations = new Map<string, string>();

      for (const locale of locales) {
        subcategoryTranslations.set(
          locale.code,
          requireTranslation(
            locale.names.subcategories[subcategoryId],
            locale.code,
            "subcategory",
            subcategoryId,
            `${TRANSLATION_FILES.subcategories} -> ${subcategoryId}`,
          ),
        );
      }

      subcategories.push({
        id: subcategoryId,
        categoryId,
        sortOrder: subcategoryIndex,
        translations: subcategoryTranslations,
      });

      const procedureIdsInSubcategory = subcategory.procedures.map(
        (procedure, procedureIndex) =>
          requireString(
            procedure.id,
            `Procedure ${procedureIndex} in subcategory "${subcategoryId}"`,
          ),
      );
      assertUnique(
        procedureIdsInSubcategory,
        `procedure ID in subcategory "${subcategoryId}"`,
      );

      for (const [
        procedureIndex,
        procedure,
      ] of subcategory.procedures.entries()) {
        const procedureId = requireString(
          procedure.id,
          `Procedure ${procedureIndex} in subcategory "${subcategoryId}"`,
        );
        const translations = new Map<string, string>();

        for (const locale of locales) {
          const englishCatalogueFallback =
            locale.code === "en" &&
            typeof procedure.name === "string" &&
            procedure.name.trim() !== ""
              ? procedure.name.trim()
              : undefined;

          translations.set(
            locale.code,
            requireTranslation(
              locale.names.procedures[procedureId] ??
                englishCatalogueFallback,
              locale.code,
              "procedure",
              procedureId,
              `${TRANSLATION_FILES.procedures} -> ${procedureId}`,
            ),
          );
        }

        const existingProcedure = proceduresById.get(procedureId);

        if (existingProcedure) {
          for (const locale of locales) {
            const existingName = existingProcedure.translations.get(
              locale.code,
            );
            const currentName = translations.get(locale.code);

            if (existingName !== currentName) {
              throw new Error(
                `Procedure "${procedureId}" has conflicting ${locale.code} names: ` +
                  `${JSON.stringify(existingName)} and ${JSON.stringify(currentName)}.`,
              );
            }
          }
        } else {
          proceduresById.set(procedureId, {
            id: procedureId,
            translations,
          });
        }

        procedureLinks.push({
          procedureId,
          subcategoryId,
          sortOrder: procedureIndex,
        });
      }
    }
  }

  const specialtyCategories: PreparedSpecialtyCategory[] = [];

  for (const [specialtyId, mappedCategoryIds] of Object.entries(
    specialtyCategoryMap,
  )) {
    if (!specialtyIdSet.has(specialtyId)) {
      throw new Error(
        `SPECIALTY_CATEGORY_MAP contains unknown specialty "${specialtyId}".`,
      );
    }

    const normalizedCategoryIds = mappedCategoryIds.map(
      (categoryId) => CATEGORY_ID_ALIASES[categoryId] ?? categoryId,
    );
    assertUnique(
      normalizedCategoryIds,
      `category mapping for specialty "${specialtyId}"`,
    );

    normalizedCategoryIds.forEach((categoryId, sortOrder) => {
      if (!categoryIdSet.has(categoryId)) {
        throw new Error(
          `Specialty "${specialtyId}" maps to unknown category "${categoryId}".`,
        );
      }

      specialtyCategories.push({
        specialtyId,
        categoryId,
        sortOrder,
      });
    });
  }

  for (const specialtyId of specialtyIds) {
    if (!(specialtyId in specialtyCategoryMap)) {
      throw new Error(
        `Specialty "${specialtyId}" is missing from SPECIALTY_CATEGORY_MAP.`,
      );
    }
  }

  return {
    specialtyGroups,
    specialties,
    categories,
    specialtyCategories,
    subcategories,
    procedures: [...proceduresById.values()],
    procedureLinks,
  };
}

function printSummary(
  prepared: PreparedCatalogue,
  locales: LocaleInput[],
  prefix: string,
): void {
  console.log(prefix);
  console.table({
    locales: locales.length,
    specialtyGroups: prepared.specialtyGroups.length,
    specialties: prepared.specialties.length,
    categories: prepared.categories.length,
    specialtyCategoryLinks: prepared.specialtyCategories.length,
    subcategories: prepared.subcategories.length,
    procedures: prepared.procedures.length,
    procedureSubcategoryLinks: prepared.procedureLinks.length,
  });
}

async function importCatalogue(
  prisma: PrismaClientLike,
  prepared: PreparedCatalogue,
  locales: LocaleInput[],
): Promise<void> {
  await prisma.$transaction(
    async (transaction) => {
      for (const [sortOrder, locale] of locales.entries()) {
        await transaction.catalogLocale.upsert({
          where: { code: locale.code },
          update: {
            displayName: locale.displayName,
            isDefault: locale.code === "en",
            isActive: true,
            sortOrder,
          },
          create: {
            code: locale.code,
            displayName: locale.displayName,
            isDefault: locale.code === "en",
            isActive: true,
            sortOrder,
          },
        });
      }

      for (const group of prepared.specialtyGroups) {
        await transaction.specialtyGroup.upsert({
          where: { id: group.id },
          update: {
            sortOrder: group.sortOrder,
            isActive: true,
          },
          create: {
            id: group.id,
            sortOrder: group.sortOrder,
            isActive: true,
          },
        });

        for (const [localeCode, name] of group.translations) {
          await transaction.specialtyGroupTranslation.upsert({
            where: {
              specialtyGroupId_localeCode: {
                specialtyGroupId: group.id,
                localeCode,
              },
            },
            update: { name },
            create: {
              specialtyGroupId: group.id,
              localeCode,
              name,
            },
          });
        }
      }

      for (const specialty of prepared.specialties) {
        await transaction.specialty.upsert({
          where: { id: specialty.id },
          update: {
            specialtyGroupId: specialty.specialtyGroupId,
            icon: specialty.icon,
            sortOrder: specialty.sortOrder,
            isActive: true,
          },
          create: {
            id: specialty.id,
            specialtyGroupId: specialty.specialtyGroupId,
            icon: specialty.icon,
            sortOrder: specialty.sortOrder,
            isActive: true,
          },
        });

        for (const [
          localeCode,
          translation,
        ] of specialty.translations) {
          await transaction.specialtyTranslation.upsert({
            where: {
              specialtyId_localeCode: {
                specialtyId: specialty.id,
                localeCode,
              },
            },
            update: {
              name: translation.name,
              description: translation.description,
            },
            create: {
              specialtyId: specialty.id,
              localeCode,
              name: translation.name,
              description: translation.description,
            },
          });
        }
      }

      for (const category of prepared.categories) {
        await transaction.category.upsert({
          where: { id: category.id },
          update: {
            slug: category.slug,
            href: category.href,
            homeImage: category.homeImage,
            dashboardImage: category.dashboardImage,
            icon: category.icon,
            sortOrder: category.sortOrder,
            isActive: true,
          },
          create: {
            id: category.id,
            slug: category.slug,
            href: category.href,
            homeImage: category.homeImage,
            dashboardImage: category.dashboardImage,
            icon: category.icon,
            sortOrder: category.sortOrder,
            isActive: true,
          },
        });

        for (const [localeCode, name] of category.translations) {
          await transaction.categoryTranslation.upsert({
            where: {
              categoryId_localeCode: {
                categoryId: category.id,
                localeCode,
              },
            },
            update: { name },
            create: {
              categoryId: category.id,
              localeCode,
              name,
            },
          });
        }
      }

      for (const link of prepared.specialtyCategories) {
        await transaction.specialtyCategory.upsert({
          where: {
            specialtyId_categoryId: {
              specialtyId: link.specialtyId,
              categoryId: link.categoryId,
            },
          },
          update: {
            sortOrder: link.sortOrder,
            isActive: true,
          },
          create: {
            specialtyId: link.specialtyId,
            categoryId: link.categoryId,
            sortOrder: link.sortOrder,
            isActive: true,
          },
        });
      }

      for (const subcategory of prepared.subcategories) {
        await transaction.subcategory.upsert({
          where: { id: subcategory.id },
          update: {
            categoryId: subcategory.categoryId,
            sortOrder: subcategory.sortOrder,
            isActive: true,
          },
          create: {
            id: subcategory.id,
            categoryId: subcategory.categoryId,
            sortOrder: subcategory.sortOrder,
            isActive: true,
          },
        });

        for (const [localeCode, name] of subcategory.translations) {
          await transaction.subcategoryTranslation.upsert({
            where: {
              subcategoryId_localeCode: {
                subcategoryId: subcategory.id,
                localeCode,
              },
            },
            update: { name },
            create: {
              subcategoryId: subcategory.id,
              localeCode,
              name,
            },
          });
        }
      }

      for (const procedure of prepared.procedures) {
        await transaction.procedure.upsert({
          where: { id: procedure.id },
          update: { isActive: true },
          create: {
            id: procedure.id,
            isActive: true,
          },
        });

        for (const [localeCode, name] of procedure.translations) {
          await transaction.procedureTranslation.upsert({
            where: {
              procedureId_localeCode: {
                procedureId: procedure.id,
                localeCode,
              },
            },
            update: { name },
            create: {
              procedureId: procedure.id,
              localeCode,
              name,
            },
          });
        }
      }

      for (const link of prepared.procedureLinks) {
        await transaction.procedureSubcategory.upsert({
          where: {
            subcategoryId_procedureId: {
              subcategoryId: link.subcategoryId,
              procedureId: link.procedureId,
            },
          },
          update: {
            sortOrder: link.sortOrder,
            isActive: true,
          },
          create: {
            subcategoryId: link.subcategoryId,
            procedureId: link.procedureId,
            sortOrder: link.sortOrder,
            isActive: true,
          },
        });
      }
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

  if (!options.cataloguePath) {
    throw new Error("Missing required --catalogue path.");
  }

  if (!options.specialtyMapPath) {
    throw new Error("Missing required --specialty-map path.");
  }

  if (!options.dryRun && !options.prismaModulePath) {
    throw new Error(
      "Missing required --prisma-module path. It is optional only with --dry-run.",
    );
  }

  const [catalogueModule, specialtyMapModule, locales] = await Promise.all([
    importModule(options.cataloguePath),
    importModule(options.specialtyMapPath),
    loadLocales(options.messagesDirSpecs),
  ]);

  const catalogue = requireObject(
    catalogueModule.DoctorCatalog,
    'The "DoctorCatalog" export',
  ) as DoctorCatalogue;
  const specialtyCategoryMap = requireObject(
    specialtyMapModule.SPECIALTY_CATEGORY_MAP,
    'The "SPECIALTY_CATEGORY_MAP" export',
  ) as Record<string, string[]>;
  const prepared = prepareCatalogue(
    catalogue,
    specialtyCategoryMap,
    locales,
  );

  printSummary(prepared, locales, "Catalogue validation passed.");

  if (options.dryRun) {
    console.log("Dry run complete. The database was not changed.");
    return;
  }

  const prismaModule = await importModule(options.prismaModulePath!);
  const prisma = prismaModule.prisma as PrismaClientLike | undefined;

  if (!prisma || typeof prisma.$transaction !== "function") {
    throw new Error(
      `The Prisma module "${options.prismaModulePath}" must export the configured client as "prisma".`,
    );
  }

  try {
    await importCatalogue(prisma, prepared, locales);
    printSummary(prepared, locales, "Catalogue import completed.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Catalogue import failed: ${message}`);
  process.exitCode = 1;
});