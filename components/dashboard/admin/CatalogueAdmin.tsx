"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Check,
  ChevronRight,
  Database,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type ProcedureEntry = {
  id: string;
  name: string;
};

type SubcategoryEntry = {
  subcategory: string;
  procedures: ProcedureEntry[];
};

type CategoryEntry = {
  key: string;
  id: string;
  slug: string;
  href: string;
  homeImage: string;
  dashboardImage: string;
  icon: string;
  category: string;
  subcategories: SubcategoryEntry[];
};

type SpecialtyItem = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
};

type SpecialtyGroup = {
  titleKey: string;
  items: SpecialtyItem[];
};

type SpecialtySection = {
  id: string;
  label: string;
  items: string[];
  groups: SpecialtyGroup[];
};

type Catalog = {
  specialties: SpecialtySection;
  categories: CategoryEntry[];
};

type TranslationFiles = {
  specialitiesName: Record<string, string>;
  categoriesName: Record<string, string>;
  subcategoriesName: Record<string, string>;
  proceduresName: Record<string, string>;

  specialitiesName_fr: Record<string, string>;
  categoriesName_fr: Record<string, string>;
  subcategoriesName_fr: Record<string, string>;
  proceduresName_fr: Record<string, string>;
};

type SpecialtyCategoryMap =
  Record<string, string[]>;

type CatalogueResponse = {
  success: boolean;
  catalog?: Catalog;
  translations?: TranslationFiles;
  specialtyMap?: SpecialtyCategoryMap;
  error?: string;
  message?: string;
};

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function toSnakeCase(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9\s_]/g,
      "",
    )
    .replace(/\s+/g, "_");
}

function humanizeId(
  value: string,
) {
  return value
    .replace(
      /^groups\./,
      "",
    )
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2",
    )
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function ValidationError({
  msg,
}: {
  msg: string;
}) {
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3" />
      {msg}
    </p>
  );
}

/* ═════════════════════════════════════
   INLINE NAME EDITOR

   IDs are intentionally immutable now.
═════════════════════════════════════ */

function InlineEdit({
  currentId,
  currentEn,
  currentFr,
  onSave,
  onCancel,
  saving,
}: {
  currentId: string;
  currentEn: string;
  currentFr: string;
  onSave: (
    en: string,
    fr: string,
  ) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [en, setEn] =
    useState(currentEn);

  const [fr, setFr] =
    useState(currentFr);

  const [error, setError] =
    useState("");

  async function handleSave() {
    if (!en.trim()) {
      setError(
        "English name is required.",
      );

      return;
    }

    if (!fr.trim()) {
      setError(
        "French translation is required.",
      );

      return;
    }

    setError("");

    await onSave(
      en.trim(),
      fr.trim(),
    );
  }

  return (
    <div className="mt-2 space-y-3 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-3">
      <div className="rounded-lg border border-[#CEB591]/20 bg-white px-3 py-2">
        <p className="text-[10px] font-semibold text-[#283C5D]/50">
          Database ID
        </p>

        <p className="font-mono text-xs text-[#283C5D]">
          {currentId}
        </p>

        <p className="mt-1 text-[10px] text-[#283C5D]/40">
          IDs are immutable after creation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
            English
          </label>

          <input
            value={en}
            onChange={(event) =>
              setEn(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
            French
          </label>

          <input
            value={fr}
            onChange={(event) =>
              setFr(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]"
          />
        </div>
      </div>

      {error ? (
        <ValidationError
          msg={error}
        />
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            void handleSave()
          }
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2f49] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}

          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   ADD PROCEDURE
═════════════════════════════════════ */

function AddProcedureForm({
  onAdd,
  onCancel,
  saving,
}: {
  onAdd: (
    id: string,
    en: string,
    fr: string,
  ) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [en, setEn] =
    useState("");

  const [fr, setFr] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleAdd() {
    if (!en.trim()) {
      setError(
        "English name required.",
      );

      return;
    }

    if (!fr.trim()) {
      setError(
        "French translation required.",
      );

      return;
    }

    await onAdd(
      toSnakeCase(en),
      en.trim(),
      fr.trim(),
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
        New Procedure
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <input
            value={en}
            onChange={(event) =>
              setEn(
                event.target.value,
              )
            }
            placeholder="English name"
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D]"
          />

          <p className="mt-1 font-mono text-[10px] text-[#283C5D]/40">
            ID:{" "}
            {toSnakeCase(en) ||
              "—"}
          </p>
        </div>

        <input
          value={fr}
          onChange={(event) =>
            setFr(
              event.target.value,
            )
          }
          placeholder="French name"
          className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D]"
        />
      </div>

      {error ? (
        <ValidationError
          msg={error}
        />
      ) : null}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() =>
            void handleAdd()
          }
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   ADD SUBCATEGORY
═════════════════════════════════════ */

type NewProcedureInput = {
  id: string;
  en: string;
  fr: string;
};

function AddSubcategoryForm({
  onAdd,
  onCancel,
  saving,
}: {
  onAdd: (
    id: string,
    en: string,
    fr: string,
    procedures: NewProcedureInput[],
  ) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [en, setEn] =
    useState("");

  const [fr, setFr] =
    useState("");

  const [procEn, setProcEn] =
    useState("");

  const [procFr, setProcFr] =
    useState("");

  const [
    procedures,
    setProcedures,
  ] = useState<
    NewProcedureInput[]
  >([]);

  const [error, setError] =
    useState("");

  function addProcedure() {
    if (
      !procEn.trim() ||
      !procFr.trim()
    ) {
      setError(
        "Both procedure translations are required.",
      );

      return;
    }

    const id =
      toSnakeCase(procEn);

    if (
      procedures.some(
        (procedure) =>
          procedure.id === id,
      )
    ) {
      setError(
        "That procedure is already in this list.",
      );

      return;
    }

    setProcedures(
      (previous) => [
        ...previous,
        {
          id,
          en:
            procEn.trim(),
          fr:
            procFr.trim(),
        },
      ],
    );

    setProcEn("");
    setProcFr("");
    setError("");
  }

  async function handleAdd() {
    if (!en.trim()) {
      setError(
        "English name required.",
      );

      return;
    }

    if (!fr.trim()) {
      setError(
        "French translation required.",
      );

      return;
    }

    if (
      procedures.length === 0
    ) {
      setError(
        "Add at least one procedure.",
      );

      return;
    }

    await onAdd(
      toSnakeCase(en),
      en.trim(),
      fr.trim(),
      procedures,
    );
  }

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
        New Subcategory
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <input
            value={en}
            onChange={(event) =>
              setEn(
                event.target.value,
              )
            }
            placeholder="English name"
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
          />

          <p className="mt-1 font-mono text-[10px] text-[#283C5D]/40">
            ID:{" "}
            {toSnakeCase(en) ||
              "—"}
          </p>
        </div>

        <input
          value={fr}
          onChange={(event) =>
            setFr(
              event.target.value,
            )
          }
          placeholder="French name"
          className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
        />
      </div>

      {procedures.map(
        (procedure) => (
          <div
            key={procedure.id}
            className="flex items-center justify-between rounded-lg border border-[#CEB591]/20 bg-white px-3 py-2 text-xs"
          >
            <div>
              <span className="font-medium text-[#283C5D]">
                {procedure.en}
              </span>

              <span className="ml-2 italic text-[#283C5D]/45">
                {procedure.fr}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setProcedures(
                  (previous) =>
                    previous.filter(
                      (item) =>
                        item.id !==
                        procedure.id,
                    ),
                )
              }
              className="text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          value={procEn}
          onChange={(event) =>
            setProcEn(
              event.target.value,
            )
          }
          placeholder="Procedure EN"
          className="rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
        />

        <input
          value={procFr}
          onChange={(event) =>
            setProcFr(
              event.target.value,
            )
          }
          placeholder="Procedure FR"
          className="rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={
          addProcedure
        }
        className="flex items-center gap-1 text-xs font-semibold text-[#CEB591]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add procedure
      </button>

      {error ? (
        <ValidationError
          msg={error}
        />
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            void handleAdd()
          }
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}

          Create
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   ADD SPECIALTY
═════════════════════════════════════ */

function AddSpecialtyForm({
  groups,
  onAdd,
  onCancel,
  saving,
}: {
  groups: {
    id: string;
    label: string;
  }[];
  onAdd: (
    id: string,
    en: string,
    fr: string,
    groupId: string,
  ) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [en, setEn] =
    useState("");

  const [fr, setFr] =
    useState("");

  const [
    groupId,
    setGroupId,
  ] = useState(
    groups[0]?.id ?? "",
  );

  const [error, setError] =
    useState("");

  async function handleAdd() {
    if (!en.trim()) {
      setError(
        "English name required.",
      );
      return;
    }

    if (!fr.trim()) {
      setError(
        "French translation required.",
      );
      return;
    }

    if (!groupId) {
      setError(
        "Select a specialty group.",
      );
      return;
    }

    await onAdd(
      toSnakeCase(en),
      en.trim(),
      fr.trim(),
      groupId,
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

        <p className="text-xs text-amber-800">
          The database entry will be created immediately. A developer may still need to add the specialty SVG/icon asset.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <input
            value={en}
            onChange={(event) =>
              setEn(
                event.target.value,
              )
            }
            placeholder="English name"
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
          />

          <p className="mt-1 font-mono text-[10px] text-[#283C5D]/40">
            ID:{" "}
            {toSnakeCase(en) ||
              "—"}
          </p>
        </div>

        <input
          value={fr}
          onChange={(event) =>
            setFr(
              event.target.value,
            )
          }
          placeholder="French name"
          className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
        />
      </div>

      <select
        value={groupId}
        onChange={(event) =>
          setGroupId(
            event.target.value,
          )
        }
        className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-2 text-sm text-[#283C5D]"
      >
        {groups.map(
          (group) => (
            <option
              key={group.id}
              value={group.id}
            >
              {group.label}
            </option>
          ),
        )}
      </select>

      {error ? (
        <ValidationError
          msg={error}
        />
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            void handleAdd()
          }
          disabled={saving}
          className="rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Create Specialty
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   ADD / ASSIGN CATEGORY
═════════════════════════════════════ */

function AddCategoryForm({
  allCategories,
  alreadyMappedIds,
  translations,
  onAssign,
  onCreate,
  onCancel,
  saving,
}: {
  allCategories: CategoryEntry[];
  alreadyMappedIds: string[];
  translations: TranslationFiles;
  onAssign: (
    categoryId: string,
  ) => Promise<void>;
  onCreate: (
    id: string,
    en: string,
    fr: string,
  ) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [mode, setMode] =
    useState<
      "existing" | "new"
    >("existing");

  const [
    selectedExisting,
    setSelectedExisting,
  ] = useState("");

  const [en, setEn] =
    useState("");

  const [fr, setFr] =
    useState("");

  const [error, setError] =
    useState("");

  const unmapped =
    allCategories.filter(
      (category) =>
        !alreadyMappedIds.includes(
          category.id,
        ),
    );

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-4">
      <div className="flex overflow-hidden rounded-lg border border-[#CEB591]/30 bg-white text-xs font-semibold">
        <button
          type="button"
          onClick={() =>
            setMode("existing")
          }
          className={`flex-1 py-2 ${
            mode === "existing"
              ? "bg-[#283C5D] text-white"
              : "text-[#283C5D]"
          }`}
        >
          Assign Existing
        </button>

        <button
          type="button"
          onClick={() =>
            setMode("new")
          }
          className={`flex-1 py-2 ${
            mode === "new"
              ? "bg-[#283C5D] text-white"
              : "text-[#283C5D]"
          }`}
        >
          Create New
        </button>
      </div>

      {mode === "existing" ? (
        <>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {unmapped.map(
              (category) => (
                <label
                  key={
                    category.id
                  }
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#CEB591]/20 bg-white px-3 py-2"
                >
                  <input
                    type="radio"
                    checked={
                      selectedExisting ===
                      category.id
                    }
                    onChange={() =>
                      setSelectedExisting(
                        category.id,
                      )
                    }
                  />

                  <div>
                    <p className="text-sm font-medium text-[#283C5D]">
                      {translations
                        .categoriesName[
                        category.id
                      ] ??
                        category.id}
                    </p>

                    <p className="text-xs italic text-[#283C5D]/45">
                      {
                        translations
                          .categoriesName_fr[
                          category.id
                        ]
                      }
                    </p>
                  </div>
                </label>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={
              !selectedExisting ||
              saving
            }
            onClick={() =>
              void onAssign(
                selectedExisting,
              )
            }
            className="rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            Assign Category
          </button>
        </>
      ) : (
        <>
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-600" />

            <p className="text-xs text-amber-800">
              The database row will be created now. Homepage/dashboard images can be added later by a developer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                value={en}
                onChange={(event) =>
                  setEn(
                    event.target.value,
                  )
                }
                placeholder="English name"
                className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
              />

              <p className="mt-1 font-mono text-[10px] text-[#283C5D]/40">
                ID:{" "}
                {toSnakeCase(
                  en,
                ) || "—"}
              </p>
            </div>

            <input
              value={fr}
              onChange={(event) =>
                setFr(
                  event.target.value,
                )
              }
              placeholder="French name"
              className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm"
            />
          </div>

          {error ? (
            <ValidationError
              msg={error}
            />
          ) : null}

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (
                !en.trim() ||
                !fr.trim()
              ) {
                setError(
                  "Both translations are required.",
                );

                return;
              }

              void onCreate(
                toSnakeCase(en),
                en.trim(),
                fr.trim(),
              );
            }}
            className="rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Create Category
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="text-xs font-semibold text-[#283C5D]/60"
      >
        Cancel
      </button>
    </div>
  );
}

/* ═════════════════════════════════════
   MAIN
═════════════════════════════════════ */

export default function CatalogueAdmin() {
  const [
    catalog,
    setCatalog,
  ] = useState<Catalog | null>(
    null,
  );

  const [
    translations,
    setTranslations,
  ] =
    useState<TranslationFiles | null>(
      null,
    );

  const [
    specialtyMap,
    setSpecialtyMap,
  ] =
    useState<SpecialtyCategoryMap>(
      {},
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [notice, setNotice] =
    useState<string | null>(
      null,
    );

  const [
    selectedSpecialty,
    setSelectedSpecialty,
  ] = useState<
    string | null
  >(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<
    string | null
  >(null);

  const [
    editingId,
    setEditingId,
  ] = useState<
    string | null
  >(null);

  const [
    addingProcedureTo,
    setAddingProcedureTo,
  ] = useState<
    string | null
  >(null);

  const [
    addingSubcategory,
    setAddingSubcategory,
  ] = useState(false);

  const [
    addingSpecialty,
    setAddingSpecialty,
  ] = useState(false);

  const [
    addingCategory,
    setAddingCategory,
  ] = useState(false);

  /* ─────────────────────────────────
     LOAD
  ───────────────────────────────── */

  const loadCatalogue =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            "/api/admin/catalogue",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        const data =
          (await response.json()) as
            CatalogueResponse;

        if (
          !response.ok ||
          !data.catalog ||
          !data.translations ||
          !data.specialtyMap
        ) {
          throw new Error(
            data.error ||
              data.message ||
              "Could not load catalogue.",
          );
        }

        setCatalog(
          data.catalog,
        );

        setTranslations(
          data.translations,
        );

        setSpecialtyMap(
          data.specialtyMap,
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load catalogue.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadCatalogue();
  }, [loadCatalogue]);

  /* ─────────────────────────────────
     MUTATE
  ───────────────────────────────── */

  async function mutate(
    action: string,
    payload: Record<
      string,
      unknown
    >,
    message: string,
  ) {
    try {
      setSaving(true);
      setError(null);
      setNotice(null);

      const response =
        await fetch(
          "/api/admin/catalogue",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action,
              ...payload,
            }),
          },
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | CatalogueResponse
          | null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Catalogue update failed.",
        );
      }

      await loadCatalogue();

      setNotice(message);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Catalogue update failed.",
      );

      throw mutationError;
    } finally {
      setSaving(false);
    }
  }

  /* ─────────────────────────────────
     TRANSLATION HELPERS
  ───────────────────────────────── */

  function getEn(
    id: string,
    file:
      | "specialitiesName"
      | "categoriesName"
      | "subcategoriesName"
      | "proceduresName",
  ) {
    return (
      translations?.[file][
        id
      ] ?? id
    );
  }

  function getFr(
    id: string,
    file:
      | "specialitiesName_fr"
      | "categoriesName_fr"
      | "subcategoriesName_fr"
      | "proceduresName_fr",
  ) {
    return (
      translations?.[file][
        id
      ] ?? ""
    );
  }

  /* ─────────────────────────────────
     DERIVED
  ───────────────────────────────── */

  const categoriesForSpecialty =
    useMemo(() => {
      if (
        !catalog ||
        !selectedSpecialty
      ) {
        return [];
      }

      const allowed =
        specialtyMap[
          selectedSpecialty
        ] ?? [];

      return catalog.categories.filter(
        (category) =>
          allowed.includes(
            category.id,
          ),
      );
    }, [
      catalog,
      specialtyMap,
      selectedSpecialty,
    ]);

  const selectedCategoryData =
    useMemo(() => {
      if (
        !catalog ||
        !selectedCategory
      ) {
        return null;
      }

      return (
        catalog.categories.find(
          (category) =>
            category.id ===
            selectedCategory,
        ) ?? null
      );
    }, [
      catalog,
      selectedCategory,
    ]);

  const specialtyGroups =
    useMemo(() => {
      if (!catalog) {
        return [];
      }

      return catalog.specialties.groups.map(
        (group) => ({
          id:
            group.titleKey.replace(
              /^groups\./,
              "",
            ),

          label:
            humanizeId(
              group.titleKey,
            ),
        }),
      );
    }, [catalog]);

  /* ═══════════════════════════════════
     STATES
  ═══════════════════════════════════ */

  if (
    loading &&
    !catalog
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#CEB591]" />
      </div>
    );
  }

  if (
    error &&
    !catalog
  ) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

        <p className="mt-3 text-sm font-semibold text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadCatalogue()
          }
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#283C5D] px-4 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (
    !catalog ||
    !translations
  ) {
    return null;
  }

  /* ═══════════════════════════════════
     STYLES
  ═══════════════════════════════════ */

  const TIER_LABEL =
    "text-[10px] font-semibold uppercase tracking-widest text-[#283C5D]/40";

  const ROW_BASE =
    "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#283C5D] transition";

  const ROW_ACTIVE =
    "bg-[#283C5D] text-white";

  const ROW_HOVER =
    "hover:bg-[#F8F3EA]";

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  return (
    <div className="min-h-screen bg-[#F8F3EA]/40 p-6">
      {/* Header */}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#283C5D]">
            Catalogue Admin
          </h1>

          <p className="mt-1 text-sm text-[#283C5D]/50">
            Changes are written directly to the database.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          <Database className="h-4 w-4" />
          Database backed
        </div>
      </div>

      {notice ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[240px_260px_1fr]">
        {/* ═══════════════════════════
            SPECIALTIES
        ═══════════════════════════ */}

        <div className="rounded-2xl border border-[#CEB591]/25 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className={TIER_LABEL}>
              Specialties
            </p>

            <button
              type="button"
              onClick={() =>
                setAddingSpecialty(
                  (previous) =>
                    !previous,
                )
              }
              className="flex items-center gap-1 rounded-lg bg-[#F8F3EA] px-2 py-1 text-[10px] font-semibold text-[#283C5D]"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          </div>

          {addingSpecialty ? (
            <AddSpecialtyForm
              groups={
                specialtyGroups
              }
              saving={saving}
              onCancel={() =>
                setAddingSpecialty(
                  false,
                )
              }
              onAdd={async (
                id,
                en,
                fr,
                groupId,
              ) => {
                await mutate(
                  "createSpecialty",
                  {
                    id,
                    en,
                    fr,
                    groupId,
                  },
                  `Specialty "${en}" created.`,
                );

                setAddingSpecialty(
                  false,
                );

                setSelectedSpecialty(
                  id,
                );
              }}
            />
          ) : null}

          <div className="mt-2 space-y-1">
            {catalog.specialties.items.map(
              (specialtyId) => {
                const active =
                  selectedSpecialty ===
                  specialtyId;

                const editing =
                  editingId ===
                  `specialty:${specialtyId}`;

                return (
                  <div
                    key={
                      specialtyId
                    }
                  >
                    <div
                      onClick={() => {
                        setSelectedSpecialty(
                          specialtyId,
                        );

                        setSelectedCategory(
                          null,
                        );

                        setEditingId(
                          null,
                        );
                      }}
                      className={`group cursor-pointer ${ROW_BASE} ${
                        active
                          ? ROW_ACTIVE
                          : ROW_HOVER
                      }`}
                    >
                      <span className="truncate">
                        {getEn(
                          specialtyId,
                          "specialitiesName",
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            setEditingId(
                              editing
                                ? null
                                : `specialty:${specialtyId}`,
                            );
                          }}
                          className="rounded-lg p-1 opacity-0 transition group-hover:opacity-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      </div>
                    </div>

                    {editing ? (
                      <InlineEdit
                        currentId={
                          specialtyId
                        }
                        currentEn={getEn(
                          specialtyId,
                          "specialitiesName",
                        )}
                        currentFr={getFr(
                          specialtyId,
                          "specialitiesName_fr",
                        )}
                        saving={
                          saving
                        }
                        onCancel={() =>
                          setEditingId(
                            null,
                          )
                        }
                        onSave={async (
                          en,
                          fr,
                        ) => {
                          await mutate(
                            "updateSpecialty",
                            {
                              specialtyId,
                              en,
                              fr,
                            },
                            "Specialty updated.",
                          );

                          setEditingId(
                            null,
                          );
                        }}
                      />
                    ) : null}
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* ═══════════════════════════
            CATEGORIES
        ═══════════════════════════ */}

        <div className="rounded-2xl border border-[#CEB591]/25 bg-white p-4 shadow-sm">
          {selectedSpecialty ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className={TIER_LABEL}>
                  Categories
                  <span className="ml-1 text-[#CEB591]">
                    ·{" "}
                    {getEn(
                      selectedSpecialty,
                      "specialitiesName",
                    )}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setAddingCategory(
                      (previous) =>
                        !previous,
                    )
                  }
                  className="flex items-center gap-1 rounded-lg bg-[#F8F3EA] px-2 py-1 text-[10px] font-semibold text-[#283C5D]"
                >
                  <Plus className="h-3 w-3" />
                  New
                </button>
              </div>

              {addingCategory ? (
                <AddCategoryForm
                  allCategories={
                    catalog.categories
                  }
                  alreadyMappedIds={
                    specialtyMap[
                      selectedSpecialty
                    ] ?? []
                  }
                  translations={
                    translations
                  }
                  saving={
                    saving
                  }
                  onCancel={() =>
                    setAddingCategory(
                      false,
                    )
                  }
                  onAssign={async (
                    categoryId,
                  ) => {
                    await mutate(
                      "assignCategory",
                      {
                        specialtyId:
                          selectedSpecialty,

                        categoryId,
                      },
                      "Category assigned.",
                    );

                    setAddingCategory(
                      false,
                    );
                  }}
                  onCreate={async (
                    id,
                    en,
                    fr,
                  ) => {
                    await mutate(
                      "createCategory",
                      {
                        id,
                        en,
                        fr,

                        specialtyId:
                          selectedSpecialty,
                      },
                      `Category "${en}" created.`,
                    );

                    setAddingCategory(
                      false,
                    );

                    setSelectedCategory(
                      id,
                    );
                  }}
                />
              ) : null}

              <div className="mt-2 space-y-1">
                {categoriesForSpecialty.map(
                  (category) => {
                    const active =
                      selectedCategory ===
                      category.id;

                    const editing =
                      editingId ===
                      `category:${category.id}`;

                    return (
                      <div
                        key={
                          category.id
                        }
                      >
                        <div
                          onClick={() => {
                            setSelectedCategory(
                              category.id,
                            );

                            setEditingId(
                              null,
                            );
                          }}
                          className={`group cursor-pointer ${ROW_BASE} ${
                            active
                              ? ROW_ACTIVE
                              : ROW_HOVER
                          }`}
                        >
                          <span className="truncate">
                            {getEn(
                              category.id,
                              "categoriesName",
                            )}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                setEditingId(
                                  editing
                                    ? null
                                    : `category:${category.id}`,
                                );
                              }}
                              className="rounded p-1 opacity-0 group-hover:opacity-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              title="Unmap from specialty"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                if (
                                  !window.confirm(
                                    "Remove this category from the specialty? The category itself will remain in the database.",
                                  )
                                ) {
                                  return;
                                }

                                void mutate(
                                  "unassignCategory",
                                  {
                                    specialtyId:
                                      selectedSpecialty,

                                    categoryId:
                                      category.id,
                                  },
                                  "Category mapping removed.",
                                ).then(
                                  () => {
                                    if (
                                      selectedCategory ===
                                      category.id
                                    ) {
                                      setSelectedCategory(
                                        null,
                                      );
                                    }
                                  },
                                );
                              }}
                              className="rounded p-1 text-red-300 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                          </div>
                        </div>

                        {editing ? (
                          <InlineEdit
                            currentId={
                              category.id
                            }
                            currentEn={getEn(
                              category.id,
                              "categoriesName",
                            )}
                            currentFr={getFr(
                              category.id,
                              "categoriesName_fr",
                            )}
                            saving={
                              saving
                            }
                            onCancel={() =>
                              setEditingId(
                                null,
                              )
                            }
                            onSave={async (
                              en,
                              fr,
                            ) => {
                              await mutate(
                                "updateCategory",
                                {
                                  categoryId:
                                    category.id,
                                  en,
                                  fr,
                                },
                                "Category updated.",
                              );

                              setEditingId(
                                null,
                              );
                            }}
                          />
                        ) : null}
                      </div>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <p className="mt-8 text-center text-xs italic text-[#283C5D]/30">
              Select a specialty
            </p>
          )}
        </div>

        {/* ═══════════════════════════
            SUBCATEGORIES / PROCEDURES
        ═══════════════════════════ */}

        <div className="rounded-2xl border border-[#CEB591]/25 bg-white p-5 shadow-sm">
          {selectedCategoryData ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className={TIER_LABEL}>
                  {getEn(
                    selectedCategoryData.id,
                    "categoriesName",
                  )}{" "}
                  · Subcategories & Procedures
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setAddingSubcategory(
                      true,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-full bg-[#F8F3EA] px-3 py-1.5 text-xs font-semibold text-[#283C5D]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Subcategory
                </button>
              </div>

              {addingSubcategory ? (
                <AddSubcategoryForm
                  saving={saving}
                  onCancel={() =>
                    setAddingSubcategory(
                      false,
                    )
                  }
                  onAdd={async (
                    id,
                    en,
                    fr,
                    procedures,
                  ) => {
                    await mutate(
                      "createSubcategory",
                      {
                        categoryId:
                          selectedCategoryData.id,

                        id,
                        en,
                        fr,
                        procedures,
                      },
                      `Subcategory "${en}" created.`,
                    );

                    setAddingSubcategory(
                      false,
                    );
                  }}
                />
              ) : null}

              <div className="mt-4 space-y-5">
                {selectedCategoryData.subcategories.map(
                  (subcategory) => {
                    const editing =
                      editingId ===
                      `subcategory:${subcategory.subcategory}`;

                    const addingProcedure =
                      addingProcedureTo ===
                      subcategory.subcategory;

                    return (
                      <div
                        key={
                          subcategory.subcategory
                        }
                        className="rounded-xl border border-[#CEB591]/20 bg-[#FDFAF6] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#283C5D]">
                              {getEn(
                                subcategory.subcategory,
                                "subcategoriesName",
                              )}
                            </p>

                            <p className="text-xs italic text-[#283C5D]/45">
                              {getFr(
                                subcategory.subcategory,
                                "subcategoriesName_fr",
                              )}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingId(
                                  editing
                                    ? null
                                    : `subcategory:${subcategory.subcategory}`,
                                )
                              }
                              className="flex items-center gap-1 text-xs text-[#283C5D]/50"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    "Deactivate this subcategory? Existing doctor records will not be hard-deleted.",
                                  )
                                ) {
                                  return;
                                }

                                void mutate(
                                  "deactivateSubcategory",
                                  {
                                    subcategoryId:
                                      subcategory.subcategory,
                                  },
                                  "Subcategory deactivated.",
                                );
                              }}
                              className="flex items-center gap-1 text-xs text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                              Deactivate
                            </button>
                          </div>
                        </div>

                        {editing ? (
                          <InlineEdit
                            currentId={
                              subcategory.subcategory
                            }
                            currentEn={getEn(
                              subcategory.subcategory,
                              "subcategoriesName",
                            )}
                            currentFr={getFr(
                              subcategory.subcategory,
                              "subcategoriesName_fr",
                            )}
                            saving={
                              saving
                            }
                            onCancel={() =>
                              setEditingId(
                                null,
                              )
                            }
                            onSave={async (
                              en,
                              fr,
                            ) => {
                              await mutate(
                                "updateSubcategory",
                                {
                                  subcategoryId:
                                    subcategory.subcategory,

                                  en,
                                  fr,
                                },
                                "Subcategory updated.",
                              );

                              setEditingId(
                                null,
                              );
                            }}
                          />
                        ) : null}

                        <div className="mt-3 space-y-1.5">
                          {subcategory.procedures.map(
                            (procedure) => {
                              const procedureEditing =
                                editingId ===
                                `procedure:${procedure.id}`;

                              return (
                                <div
                                  key={
                                    procedure.id
                                  }
                                >
                                  <div className="group flex items-center justify-between rounded-lg border border-[#CEB591]/15 bg-white px-3 py-2">
                                    <div className="min-w-0">
                                      <span className="text-xs font-medium text-[#283C5D]">
                                        {getEn(
                                          procedure.id,
                                          "proceduresName",
                                        )}
                                      </span>

                                      <span className="ml-2 text-xs italic text-[#283C5D]/45">
                                        {getFr(
                                          procedure.id,
                                          "proceduresName_fr",
                                        )}
                                      </span>

                                      <span className="ml-2 font-mono text-[10px] text-[#283C5D]/25">
                                        {
                                          procedure.id
                                        }
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingId(
                                            procedureEditing
                                              ? null
                                              : `procedure:${procedure.id}`,
                                          )
                                        }
                                        className="rounded p-1 text-[#283C5D]/40"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>

                                      <button
                                        type="button"
                                        title="Remove from subcategory"
                                        onClick={() => {
                                          if (
                                            !window.confirm(
                                              "Remove this procedure from this subcategory?",
                                            )
                                          ) {
                                            return;
                                          }

                                          void mutate(
                                            "unlinkProcedure",
                                            {
                                              subcategoryId:
                                                subcategory.subcategory,

                                              procedureId:
                                                procedure.id,
                                            },
                                            "Procedure removed from subcategory.",
                                          );
                                        }}
                                        className="rounded p-1 text-red-300"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {procedureEditing ? (
                                    <InlineEdit
                                      currentId={
                                        procedure.id
                                      }
                                      currentEn={getEn(
                                        procedure.id,
                                        "proceduresName",
                                      )}
                                      currentFr={getFr(
                                        procedure.id,
                                        "proceduresName_fr",
                                      )}
                                      saving={
                                        saving
                                      }
                                      onCancel={() =>
                                        setEditingId(
                                          null,
                                        )
                                      }
                                      onSave={async (
                                        en,
                                        fr,
                                      ) => {
                                        await mutate(
                                          "updateProcedure",
                                          {
                                            procedureId:
                                              procedure.id,

                                            en,
                                            fr,
                                          },
                                          "Procedure updated.",
                                        );

                                        setEditingId(
                                          null,
                                        );
                                      }}
                                    />
                                  ) : null}
                                </div>
                              );
                            },
                          )}
                        </div>

                        {addingProcedure ? (
                          <AddProcedureForm
                            saving={
                              saving
                            }
                            onCancel={() =>
                              setAddingProcedureTo(
                                null,
                              )
                            }
                            onAdd={async (
                              id,
                              en,
                              fr,
                            ) => {
                              await mutate(
                                "createProcedure",
                                {
                                  subcategoryId:
                                    subcategory.subcategory,

                                  id,
                                  en,
                                  fr,
                                },
                                `Procedure "${en}" added.`,
                              );

                              setAddingProcedureTo(
                                null,
                              );
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setAddingProcedureTo(
                                subcategory.subcategory,
                              )
                            }
                            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#CEB591]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Procedure
                          </button>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center text-sm italic text-[#283C5D]/30">
              Select a specialty → category to manage procedures
            </div>
          )}
        </div>
      </div>
    </div>
  );
}