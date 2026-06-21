"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  AlertCircle,
  Save,
  TriangleAlert,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProcedureEntry = { id: string; name: string };

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

export type Catalog = {
  specialties: SpecialtySection;
  categories: CategoryEntry[];
};

export type TranslationFiles = {
  specialitiesName: Record<string, string>;
  categoriesName: Record<string, string>;
  subcategoriesName: Record<string, string>;
  proceduresName: Record<string, string>;
  specialitiesName_fr: Record<string, string>;
  categoriesName_fr: Record<string, string>;
  subcategoriesName_fr: Record<string, string>;
  proceduresName_fr: Record<string, string>;
};

export type SpecialtyCategoryMap = Record<string, string[]>;

// A change entry is only used for the UI log — the source of truth is always
// the live `catalog` + `translations` state.
type ChangeLogEntry = {
  id: string; // unique per logical item so we can deduplicate
  description: string;
  timestamp: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_");
}

function toSlug(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function ValidationError({ msg }: { msg: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3" /> {msg}
    </p>
  );
}

// ─── InlineEdit ───────────────────────────────────────────────────────────────
// Shows both the current EN and FR values so the admin can review and correct.
// If the admin changes the EN name the ID preview updates live.
// The key stays the same if the admin explicitly opts to keep it.

type InlineEditProps = {
  currentId: string;
  currentEn: string;
  currentFr: string;
  onSave: (newId: string, sameKey: boolean, en: string, fr: string) => void;
  onCancel: () => void;
};

function InlineEdit({ currentId, currentEn, currentFr, onSave, onCancel }: InlineEditProps) {
  const [en, setEn] = useState(currentEn);
  const [fr, setFr] = useState(currentFr);
  const [keepKey, setKeepKey] = useState(true);
  const [error, setError] = useState("");

  const derivedId = keepKey ? currentId : toSnakeCase(en);

  function handleSave() {
    if (!en.trim()) { setError("English name is required."); return; }
    if (!fr.trim()) { setError("French translation is required."); return; }
    setError("");
    onSave(derivedId, keepKey, en.trim(), fr.trim());
  }

  return (
    <div className="mt-2 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
            English
          </label>
          <input
            value={en}
            onChange={(e) => setEn(e.target.value)}
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591] focus:ring-1 focus:ring-[#CEB591]/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
            French
          </label>
          <input
            value={fr}
            onChange={(e) => setFr(e.target.value)}
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591] focus:ring-1 focus:ring-[#CEB591]/30"
          />
        </div>
      </div>

      {/* Key control */}
      <div className="rounded-lg border border-[#CEB591]/20 bg-white px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-[#283C5D]/50">
            ID: <span className="font-mono text-[#283C5D]">{derivedId}</span>
          </p>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={keepKey}
              onChange={(e) => setKeepKey(e.target.checked)}
              className="accent-[#CEB591]"
            />
            <span className="text-[10px] text-[#283C5D]/60">Keep existing key</span>
          </label>
        </div>
        {!keepKey && (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-600">
            <TriangleAlert className="h-3 w-3" />
            A new key will be created. The old key will be removed from all i18n files.
          </p>
        )}
      </div>

      {error && <ValidationError msg={error} />}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2f49]"
        >
          <Check className="h-3.5 w-3.5" /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]"
        >
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── AddProcedureForm ─────────────────────────────────────────────────────────

function AddProcedureForm({
  onAdd,
  onCancel,
}: {
  onAdd: (id: string, en: string, fr: string) => void;
  onCancel: () => void;
}) {
  const [en, setEn] = useState("");
  const [fr, setFr] = useState("");
  const [error, setError] = useState("");

  function handleAdd() {
    if (!en.trim()) { setError("English name required."); return; }
    if (!fr.trim()) { setError("French translation required."); return; }
    onAdd(toSnakeCase(en), en.trim(), fr.trim());
  }

  return (
    <div className="mt-2 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
        New Procedure
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] text-[#283C5D]/50">English name</label>
          <input
            value={en}
            onChange={(e) => setEn(e.target.value)}
            placeholder="e.g. Lip Filler"
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]"
          />
          <p className="mt-0.5 text-[10px] text-[#283C5D]/40">ID: {toSnakeCase(en) || "—"}</p>
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#283C5D]/50">French name</label>
          <input
            value={fr}
            onChange={(e) => setFr(e.target.value)}
            placeholder="Traduction…"
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]"
          />
        </div>
      </div>
      {error && <ValidationError msg={error} />}
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2f49]"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]"
        >
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── AddSubcategoryForm ───────────────────────────────────────────────────────

function AddSubcategoryForm({
  onAdd,
  onCancel,
}: {
  onAdd: (id: string, en: string, fr: string, procs: { id: string; en: string; fr: string }[]) => void;
  onCancel: () => void;
}) {
  const [en, setEn] = useState("");
  const [fr, setFr] = useState("");
  const [procEn, setProcEn] = useState("");
  const [procFr, setProcFr] = useState("");
  const [procedures, setProcedures] = useState<{ id: string; en: string; fr: string }[]>([]);
  const [error, setError] = useState("");

  function addProc() {
    if (!procEn.trim() || !procFr.trim()) { setError("Both procedure translations required."); return; }
    setProcedures((p) => [...p, { id: toSnakeCase(procEn), en: procEn.trim(), fr: procFr.trim() }]);
    setProcEn(""); setProcFr(""); setError("");
  }

  function handleAdd() {
    if (!en.trim()) { setError("English name required."); return; }
    if (!fr.trim()) { setError("French translation required."); return; }
    if (procedures.length === 0) { setError("At least one procedure is required."); return; }
    onAdd(toSnakeCase(en), en.trim(), fr.trim(), procedures);
  }

  return (
    <div className="mt-3 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-4 space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">
        New Subcategory
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] text-[#283C5D]/50">English name</label>
          <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="e.g. Eye Treatments"
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
          <p className="mt-0.5 text-[10px] text-[#283C5D]/40">ID: {toSnakeCase(en) || "—"}</p>
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#283C5D]/50">French name</label>
          <input value={fr} onChange={(e) => setFr(e.target.value)} placeholder="Traduction…"
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold text-[#283C5D]/60">
          Procedures <span className="text-red-500">*</span> (min. 1)
        </p>
        {procedures.map((p) => (
          <div key={p.id} className="mb-1 flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs border border-[#CEB591]/20">
            <span className="font-medium text-[#283C5D]">{p.en}</span>
            <span className="text-[#283C5D]/50 mx-2">/ {p.fr}</span>
            <span className="font-mono text-[#283C5D]/30 mr-auto">{p.id}</span>
            <button onClick={() => setProcedures((prev) => prev.filter((x) => x.id !== p.id))} className="text-red-400 hover:text-red-600">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={procEn} onChange={(e) => setProcEn(e.target.value)} placeholder="Procedure (EN)"
            className="rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
          <input value={procFr} onChange={(e) => setProcFr(e.target.value)} placeholder="Procédure (FR)"
            className="rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
        </div>
        <button onClick={addProc} className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#CEB591] hover:text-[#b89870]">
          <Plus className="h-3.5 w-3.5" /> Add procedure
        </button>
      </div>

      {error && <ValidationError msg={error} />}
      <div className="flex gap-2">
        <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2f49]">
          <Check className="h-3.5 w-3.5" /> Create Subcategory
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── DevWarningModal ──────────────────────────────────────────────────────────
// Full-screen modal for the developer notice — shown before creating a new
// specialty or category. Keeps the inline forms uncluttered.

function DevWarningModal({
  type,
  onConfirm,
  onCancel,
}: {
  type: "specialty" | "category";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  const items =
    type === "specialty"
      ? [
          "A public icon SVG for the specialty card",
          "A doctor onboarding SVG (dashboard image)",
          "An entry in SPECIALTY_CATEGORY_MAP defining which categories apply",
          "The exported files from this tool must be sent to the dev team",
        ]
      : [
          "A public home image displayed on the homepage",
          "A public icon SVG (category chip icon)",
          "A dashboard image SVG used in doctor onboarding",
          "The category must be mapped in SPECIALTY_CATEGORY_MAP for at least one specialty",
          "The exported files from this tool must be sent to the dev team",
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <TriangleAlert className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Developer action required</p>
            <p className="text-xs text-amber-700">
              Before this {type} can go live, a developer must prepare:
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                  {i + 1}
                </span>
                <span className="text-sm text-[#283C5D]/80 leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 accent-amber-600"
            />
            <span className="text-sm font-semibold text-amber-900 leading-snug">
              I understand — I will notify the developers with the exported files
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#CEB591]/20 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-full border border-[#CEB591]/40 px-4 py-2 text-sm font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className="rounded-full bg-[#283C5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2f49] disabled:opacity-40"
          >
            I understand, proceed
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AddSpecialtyForm ─────────────────────────────────────────────────────────

function AddSpecialtyForm({
  onAdd,
  onCancel,
}: {
  onAdd: (id: string, en: string, fr: string, groupKey: string) => void;
  onCancel: () => void;
}) {
  const [en, setEn] = useState("");
  const [fr, setFr] = useState("");
  const [groupKey, setGroupKey] = useState("groups.other");
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState("");

  const groups = [
    { key: "groups.aesthetic", label: "Aesthetic" },
    { key: "groups.surgery", label: "Surgery" },
    { key: "groups.associatedSpecialties", label: "Associated Specialties" },
    { key: "groups.other", label: "Other" },
  ];

  function handleProceed() {
    if (!en.trim()) { setError("English name required."); return; }
    if (!fr.trim()) { setError("French translation required."); return; }
    // Show the warning modal before committing
    setShowWarning(true);
  }

  function handleConfirmed() {
    setShowWarning(false);
    onAdd(toSnakeCase(en), en.trim(), fr.trim(), groupKey);
  }

  return (
    <>
      {showWarning && (
        <DevWarningModal
          type="specialty"
          onConfirm={handleConfirmed}
          onCancel={() => setShowWarning(false)}
        />
      )}

      <div className="mt-3 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#283C5D]/50">New Specialty</p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-[#283C5D]/50">English name</label>
            <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="e.g. Nutritionist"
              className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
            <p className="mt-0.5 text-[10px] text-[#283C5D]/40">ID: {toSnakeCase(en) || "—"}</p>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-[#283C5D]/50">French name</label>
            <input value={fr} onChange={(e) => setFr(e.target.value)} placeholder="Traduction…"
              className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-[#283C5D]/50">Group</label>
          <select value={groupKey} onChange={(e) => setGroupKey(e.target.value)}
            className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]">
            {groups.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
        </div>

        {error && <ValidationError msg={error} />}

        <div className="flex gap-2">
          <button onClick={handleProceed} className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2f49]">
            <Check className="h-3.5 w-3.5" /> Create Specialty
          </button>
          <button onClick={onCancel} className="flex items-center gap-1 rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]">
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ─── AddCategoryForm ──────────────────────────────────────────────────────────
// Two modes:
//   "existing" — pick a category already in the catalog and map it to this specialty
//   "new"      — create a brand-new category (triggers dev warning modal)

function AddCategoryForm({
  specialtyId,
  allCategories,
  alreadyMappedIds,
  translations,
  onAssignExisting,
  onCreateNew,
  onCancel,
}: {
  specialtyId: string;
  allCategories: CategoryEntry[];
  alreadyMappedIds: string[];
  translations: TranslationFiles;
  onAssignExisting: (categoryId: string) => void;
  onCreateNew: (id: string, en: string, fr: string) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedExisting, setSelectedExisting] = useState<string>("");

  // New category fields
  const [en, setEn] = useState("");
  const [fr, setFr] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState("");

  const unmappedCategories = allCategories.filter((c) => !alreadyMappedIds.includes(c.id));

  function handleAssign() {
    if (!selectedExisting) { setError("Select a category."); return; }
    onAssignExisting(selectedExisting);
  }

  function handleProceedNew() {
    if (!en.trim()) { setError("English name required."); return; }
    if (!fr.trim()) { setError("French translation required."); return; }
    setError("");
    setShowWarning(true);
  }

  function handleConfirmedNew() {
    setShowWarning(false);
    onCreateNew(toSnakeCase(en), en.trim(), fr.trim());
  }

  return (
    <>
      {showWarning && (
        <DevWarningModal
          type="category"
          onConfirm={handleConfirmedNew}
          onCancel={() => setShowWarning(false)}
        />
      )}

      <div className="mt-3 rounded-xl border border-[#CEB591]/30 bg-[#FDFAF6] p-4 space-y-3">
        {/* Mode tabs */}
        <div className="flex rounded-lg border border-[#CEB591]/30 bg-white overflow-hidden text-xs font-semibold">
          <button
            onClick={() => { setMode("existing"); setError(""); }}
            className={`flex-1 py-2 transition ${mode === "existing" ? "bg-[#283C5D] text-white" : "text-[#283C5D]/60 hover:text-[#283C5D]"}`}
          >
            Assign Existing
          </button>
          <button
            onClick={() => { setMode("new"); setError(""); }}
            className={`flex-1 py-2 transition ${mode === "new" ? "bg-[#283C5D] text-white" : "text-[#283C5D]/60 hover:text-[#283C5D]"}`}
          >
            Create New
          </button>
        </div>

        {mode === "existing" ? (
          <>
            <p className="text-[10px] text-[#283C5D]/50">
              Select a category already in the catalog to map it to this specialty. Its subcategories and procedures are included automatically.
            </p>
            {unmappedCategories.length === 0 ? (
              <p className="text-xs italic text-[#283C5D]/40">All existing categories are already mapped to this specialty.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {unmappedCategories.map((cat) => {
                  const label = translations.categoriesName[cat.id] ?? cat.id;
                  const labelFr = translations.categoriesName_fr[cat.id] ?? "";
                  return (
                    <label
                      key={cat.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                        selectedExisting === cat.id
                          ? "border-[#283C5D] bg-[#283C5D]/5"
                          : "border-[#CEB591]/20 bg-white hover:border-[#CEB591]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="existing_cat"
                        value={cat.id}
                        checked={selectedExisting === cat.id}
                        onChange={() => setSelectedExisting(cat.id)}
                        className="accent-[#283C5D]"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#283C5D] truncate">{label}</p>
                        {labelFr && <p className="text-xs italic text-[#283C5D]/45 truncate">{labelFr}</p>}
                        <p className="font-mono text-[10px] text-[#283C5D]/30">{cat.id}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {error && <ValidationError msg={error} />}

            <div className="flex gap-2">
              <button
                onClick={handleAssign}
                disabled={unmappedCategories.length === 0}
                className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2f49] disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" /> Assign to Specialty
              </button>
              <button onClick={onCancel} className="flex items-center gap-1 rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] text-[#283C5D]/50">
              Creates a brand-new category. A developer will need to provide images and update the system.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-[#283C5D]/50">English name</label>
                <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="e.g. Hair Surgery"
                  className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
                <p className="mt-0.5 text-[10px] text-[#283C5D]/40">ID: {toSnakeCase(en) || "—"}</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-[#283C5D]/50">French name</label>
                <input value={fr} onChange={(e) => setFr(e.target.value)} placeholder="Traduction…"
                  className="w-full rounded-lg border border-[#CEB591]/40 bg-white px-3 py-1.5 text-sm text-[#283C5D] outline-none focus:border-[#CEB591]" />
              </div>
            </div>

            {error && <ValidationError msg={error} />}

            <div className="flex gap-2">
              <button onClick={handleProceedNew} className="flex items-center gap-1 rounded-lg bg-[#283C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2f49]">
                <Check className="h-3.5 w-3.5" /> Create Category
              </button>
              <button onClick={onCancel} className="flex items-center gap-1 rounded-lg border border-[#CEB591]/40 px-3 py-1.5 text-xs font-semibold text-[#283C5D]/70 hover:bg-[#F8F3EA]">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── ChangeLog panel ──────────────────────────────────────────────────────────

function ChangeLogPanel({
  changes,
  onDiscard,
}: {
  changes: ChangeLogEntry[];
  onDiscard: (id: string) => void;
}) {
  if (changes.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-700">
        {changes.length} Pending Change{changes.length !== 1 ? "s" : ""}
      </p>
      <ul className="space-y-1.5">
        {changes.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs border border-amber-100">
            <span className="text-[#283C5D]">{c.description}</span>
            <button onClick={() => onDiscard(c.id)} className="shrink-0 text-red-400 hover:text-red-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
// Reads directly from live catalog + translations state — always up to date.

function ExportModal({
  catalog,
  translations,
  specialtyMap,
  onClose,
}: {
  catalog: Catalog;
  translations: TranslationFiles;
  specialtyMap: SpecialtyCategoryMap;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"catalog" | "map" | "i18n_en" | "i18n_fr">("catalog");

  const tabs = [
    { id: "catalog" as const, label: "DoctorCatalog.ts" },
    { id: "map"     as const, label: "SpecialtyMap.ts" },
    { id: "i18n_en" as const, label: "i18n (EN)" },
    { id: "i18n_fr" as const, label: "i18n (FR)" },
  ];

  const contentMap: Record<string, string> = {
    catalog: `export const DoctorCatalog = ${JSON.stringify(catalog, null, 2)};`,
    map:     `export const SPECIALTY_CATEGORY_MAP: Record<string, string[]> = ${JSON.stringify(specialtyMap, null, 2)};`,
    i18n_en: JSON.stringify(
      {
        specialitiesName:  translations.specialitiesName,
        categoriesName:    translations.categoriesName,
        subcategoriesName: translations.subcategoriesName,
        proceduresName:    translations.proceduresName,
      },
      null,
      2
    ),
    i18n_fr: JSON.stringify(
      {
        specialitiesName:  translations.specialitiesName_fr,
        categoriesName:    translations.categoriesName_fr,
        subcategoriesName: translations.subcategoriesName_fr,
        proceduresName:    translations.proceduresName_fr,
      },
      null,
      2
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#CEB591]/20 px-6 py-4">
          <h2 className="text-base font-bold text-[#283C5D]">Export Updated Files</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[#F8F3EA]">
            <X className="h-5 w-5 text-[#283C5D]/60" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-[#CEB591]/20 px-6 pt-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-t-lg px-4 py-2 text-xs font-semibold transition ${
                tab === t.id ? "bg-[#283C5D] text-white" : "text-[#283C5D]/60 hover:text-[#283C5D]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <pre className="flex-1 overflow-auto p-6 text-xs leading-relaxed text-[#283C5D] bg-[#FDFAF6] whitespace-pre-wrap">
          {contentMap[tab]}
        </pre>

        <div className="flex justify-end gap-3 border-t border-[#CEB591]/20 px-6 py-4">
          <button
            onClick={() => navigator.clipboard.writeText(contentMap[tab])}
            className="flex items-center gap-2 rounded-full bg-[#CEB591]/20 px-4 py-2 text-xs font-semibold text-[#283C5D] hover:bg-[#CEB591]/30"
          >
            Copy to clipboard
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-[#283C5D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f2f49]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = {
  initialCatalog: Catalog;
  initialTranslations: TranslationFiles;
  initialSpecialtyMap: SpecialtyCategoryMap;
};

export default function CatalogueAdmin({
  initialCatalog,
  initialTranslations,
  initialSpecialtyMap,
}: Props) {
  // The catalog, translations and specialtyMap are the single source of truth.
  // The export always reads these directly — no diff/log is used for output.
  const [catalog, setCatalog]           = useState<Catalog>(initialCatalog);
  const [translations, setTranslations] = useState<TranslationFiles>(initialTranslations);
  const [specialtyMap, setSpecialtyMap] = useState<SpecialtyCategoryMap>(initialSpecialtyMap);

  // Change log is only for the UI "what happened" panel — not used in export.
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);

  const [showExport, setShowExport] = useState(false);

  // Navigation
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedCategory,  setSelectedCategory]  = useState<string | null>(null);

  // Edit / add state
  const [editingId,           setEditingId]           = useState<string | null>(null);
  const [addingProcedureTo,   setAddingProcedureTo]   = useState<string | null>(null);
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [addingSpecialty,     setAddingSpecialty]     = useState(false);
  const [addingCategory,      setAddingCategory]      = useState(false);

  // ── Changelog helpers ──────────────────────────────────────────────────────

  function logChange(key: string, description: string) {
    setChangeLog((prev) => {
      // Replace any existing entry with the same key so edits update in-place
      const filtered = prev.filter((c) => c.id !== key);
      return [...filtered, { id: key, description, timestamp: Date.now() }];
    });
  }

  function discardLog(id: string) {
    setChangeLog((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Translation helpers ────────────────────────────────────────────────────

  function getEn(
    id: string,
    file: keyof Pick<TranslationFiles, "specialitiesName" | "categoriesName" | "subcategoriesName" | "proceduresName">
  ): string {
    return translations[file][id] ?? id;
  }

  function getFr(
    id: string,
    file: keyof Pick<TranslationFiles, "specialitiesName_fr" | "categoriesName_fr" | "subcategoriesName_fr" | "proceduresName_fr">
  ): string {
    return translations[file][id] ?? "";
  }

  // ── Specialty rename ───────────────────────────────────────────────────────

  function handleRenameSpecialty(oldId: string, newId: string, sameKey: boolean, en: string, fr: string) {
    const finalId = sameKey ? oldId : newId;

    setCatalog((prev) => {
      const s = prev.specialties;
      return {
        ...prev,
        specialties: {
          ...s,
          items: s.items.map((i) => (i === oldId ? finalId : i)),
          groups: s.groups.map((g) => ({
            ...g,
            items: g.items.map((it) =>
              it.id === oldId
                ? { ...it, id: finalId, labelKey: `items.${finalId}.label`, descriptionKey: `items.${finalId}.description` }
                : it
            ),
          })),
        },
      };
    });

    if (!sameKey) {
      setSpecialtyMap((prev) => {
        const next = { ...prev };
        next[finalId] = next[oldId];
        delete next[oldId];
        return next;
      });
    }

    setTranslations((prev) => {
      const enMap = { ...prev.specialitiesName, [finalId]: en };
      const frMap = { ...prev.specialitiesName_fr, [finalId]: fr };
      if (!sameKey) { delete enMap[oldId]; delete frMap[oldId]; }
      return { ...prev, specialitiesName: enMap, specialitiesName_fr: frMap };
    });

    logChange(`specialty:${oldId}`, `Specialty "${oldId}" → "${finalId}" (EN: ${en} / FR: ${fr})`);
    setEditingId(null);
  }

  // ── Specialty add ──────────────────────────────────────────────────────────

  function handleAddSpecialty(id: string, en: string, fr: string, groupKey: string) {
    setCatalog((prev) => {
      const s = prev.specialties;
      return {
        ...prev,
        specialties: {
          ...s,
          items: [...s.items, id],
          groups: s.groups.map((g) =>
            g.titleKey === groupKey
              ? { ...g, items: [...g.items, { id, labelKey: `items.${id}.label`, descriptionKey: `items.${id}.description`, icon: `${id}.svg` }] }
              : g
          ),
        },
      };
    });

    // New specialty gets empty category list — devs must add to SPECIALTY_CATEGORY_MAP
    setSpecialtyMap((prev) => ({ ...prev, [id]: [] }));

    setTranslations((prev) => ({
      ...prev,
      specialitiesName:    { ...prev.specialitiesName, [id]: en },
      specialitiesName_fr: { ...prev.specialitiesName_fr, [id]: fr },
    }));

    logChange(`add_specialty:${id}`, `Added specialty "${id}" (EN: ${en} / FR: ${fr}) — ⚠️ dev assets required`);
    setAddingSpecialty(false);
  }

  // ── Category rename ────────────────────────────────────────────────────────

  function handleRenameCategory(oldId: string, newId: string, sameKey: boolean, en: string, fr: string) {
    const finalId = sameKey ? oldId : newId;

    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === oldId
          ? { ...c, id: finalId, category: finalId, key: en.toUpperCase(), slug: toSlug(en), href: `/categories/${toSlug(en)}` }
          : c
      ),
    }));

    if (!sameKey) {
      setSpecialtyMap((prev) => {
        const next: SpecialtyCategoryMap = {};
        for (const [sp, cats] of Object.entries(prev)) {
          next[sp] = cats.map((c) => (c === oldId ? finalId : c));
        }
        return next;
      });
    }

    setTranslations((prev) => {
      const enMap = { ...prev.categoriesName, [finalId]: en };
      const frMap = { ...prev.categoriesName_fr, [finalId]: fr };
      if (!sameKey) { delete enMap[oldId]; delete frMap[oldId]; }
      return { ...prev, categoriesName: enMap, categoriesName_fr: frMap };
    });

    logChange(`category:${oldId}`, `Category "${oldId}" → "${finalId}" (EN: ${en} / FR: ${fr})`);
    setEditingId(null);
  }

  // ── Category add ───────────────────────────────────────────────────────────

  function handleAddCategory(id: string, en: string, fr: string) {
    const newCat: CategoryEntry = {
      key: en.toUpperCase(),
      id,
      slug: toSlug(en),
      href: `/categories/${toSlug(en)}`,
      homeImage: `/images/home/categories/${toSlug(en)}.png`,
      dashboardImage: `/images/dashboard/categories/${toSlug(en)}.svg`,
      icon: `/images/home/categories/icons/${toSlug(en)}.svg`,
      category: id,
      subcategories: [],
    };

    setCatalog((prev) => ({ ...prev, categories: [...prev.categories, newCat] }));

    // Add to selected specialty's category list
    if (selectedSpecialty) {
      setSpecialtyMap((prev) => ({
        ...prev,
        [selectedSpecialty]: [...(prev[selectedSpecialty] ?? []), id],
      }));
    }

    setTranslations((prev) => ({
      ...prev,
      categoriesName:    { ...prev.categoriesName, [id]: en },
      categoriesName_fr: { ...prev.categoriesName_fr, [id]: fr },
    }));

    logChange(`add_category:${id}`, `Added category "${id}" (EN: ${en} / FR: ${fr}) — ⚠️ dev assets required`);
    setAddingCategory(false);
  }

  // ── Subcategory rename ─────────────────────────────────────────────────────

  function handleRenameSubcategory(categoryId: string, oldId: string, newId: string, sameKey: boolean, en: string, fr: string) {
    const finalId = sameKey ? oldId : newId;

    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.map((s) => s.subcategory === oldId ? { ...s, subcategory: finalId } : s) }
          : c
      ),
    }));

    setTranslations((prev) => {
      const enMap = { ...prev.subcategoriesName, [finalId]: en };
      const frMap = { ...prev.subcategoriesName_fr, [finalId]: fr };
      if (!sameKey) { delete enMap[oldId]; delete frMap[oldId]; }
      return { ...prev, subcategoriesName: enMap, subcategoriesName_fr: frMap };
    });

    logChange(`subcategory:${categoryId}:${oldId}`, `Subcategory "${oldId}" → "${finalId}" (EN: ${en} / FR: ${fr})`);
    setEditingId(null);
  }

  // ── Subcategory add ────────────────────────────────────────────────────────

  function handleAddSubcategory(
    categoryId: string,
    subId: string,
    en: string,
    fr: string,
    procs: { id: string; en: string; fr: string }[]
  ) {
    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: [...c.subcategories, { subcategory: subId, procedures: procs.map((p) => ({ id: p.id, name: p.en })) }] }
          : c
      ),
    }));

    setTranslations((prev) => {
      const procEn = Object.fromEntries(procs.map((p) => [p.id, p.en]));
      const procFr = Object.fromEntries(procs.map((p) => [p.id, p.fr]));
      return {
        ...prev,
        subcategoriesName:    { ...prev.subcategoriesName, [subId]: en },
        subcategoriesName_fr: { ...prev.subcategoriesName_fr, [subId]: fr },
        proceduresName:       { ...prev.proceduresName, ...procEn },
        proceduresName_fr:    { ...prev.proceduresName_fr, ...procFr },
      };
    });

    logChange(`add_subcategory:${categoryId}:${subId}`, `Added subcategory "${subId}" to ${categoryId}`);
    setAddingSubcategoryTo(null);
  }

  // ── Subcategory delete ─────────────────────────────────────────────────────

  function handleDeleteSubcategory(categoryId: string, subId: string) {
    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId ? { ...c, subcategories: c.subcategories.filter((s) => s.subcategory !== subId) } : c
      ),
    }));
    logChange(`del_subcategory:${categoryId}:${subId}`, `Deleted subcategory "${subId}" from ${categoryId}`);
  }

  // ── Procedure rename ───────────────────────────────────────────────────────

  function handleRenameProcedure(
    categoryId: string,
    subcategoryId: string,
    oldId: string,
    newId: string,
    sameKey: boolean,
    en: string,
    fr: string
  ) {
    const finalId = sameKey ? oldId : newId;

    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.map((s) =>
                s.subcategory === subcategoryId
                  ? { ...s, procedures: s.procedures.map((p) => p.id === oldId ? { id: finalId, name: en } : p) }
                  : s
              ),
            }
          : c
      ),
    }));

    setTranslations((prev) => {
      const enMap = { ...prev.proceduresName, [finalId]: en };
      const frMap = { ...prev.proceduresName_fr, [finalId]: fr };
      if (!sameKey) { delete enMap[oldId]; delete frMap[oldId]; }
      return { ...prev, proceduresName: enMap, proceduresName_fr: frMap };
    });

    logChange(`procedure:${categoryId}:${subcategoryId}:${oldId}`, `Procedure "${oldId}" → "${finalId}" (EN: ${en} / FR: ${fr})`);
    setEditingId(null);
  }

  // ── Procedure add ──────────────────────────────────────────────────────────

  function handleAddProcedure(categoryId: string, subcategoryId: string, procId: string, en: string, fr: string) {
    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.map((s) =>
                s.subcategory === subcategoryId
                  ? { ...s, procedures: [...s.procedures, { id: procId, name: en }] }
                  : s
              ),
            }
          : c
      ),
    }));

    setTranslations((prev) => ({
      ...prev,
      proceduresName:    { ...prev.proceduresName, [procId]: en },
      proceduresName_fr: { ...prev.proceduresName_fr, [procId]: fr },
    }));

    logChange(`add_procedure:${subcategoryId}:${procId}`, `Added procedure "${procId}" to ${subcategoryId}`);
    setAddingProcedureTo(null);
  }

  // ── Procedure delete ───────────────────────────────────────────────────────

  function handleDeleteProcedure(categoryId: string, subcategoryId: string, procId: string) {
    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.map((s) =>
                s.subcategory === subcategoryId
                  ? { ...s, procedures: s.procedures.filter((p) => p.id !== procId) }
                  : s
              ),
            }
          : c
      ),
    }));
    logChange(`del_procedure:${categoryId}:${subcategoryId}:${procId}`, `Deleted procedure "${procId}" from ${subcategoryId}`);
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const allSpecialtyIds = catalog.specialties.items;

  const categoriesForSpecialty = useMemo(() => {
    if (!selectedSpecialty) return [];
    const allowed = specialtyMap[selectedSpecialty] ?? [];
    return catalog.categories.filter((c) => allowed.includes(c.id));
  }, [selectedSpecialty, catalog, specialtyMap]);

  const selectedCategoryData = useMemo(
    () => (selectedCategory ? catalog.categories.find((c) => c.id === selectedCategory) ?? null : null),
    [selectedCategory, catalog]
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const TIER_LABEL = "text-[10px] font-semibold uppercase tracking-widest text-[#283C5D]/40";
  const ROW_BASE   = "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#283C5D] transition";
  const ROW_ACTIVE = "bg-[#283C5D] text-white";
  const ROW_HOVER  = "hover:bg-[#F8F3EA]";
  const ICON_BTN   = "rounded-lg p-1 transition";

  return (
    <div className="min-h-screen bg-[#F8F3EA]/40 p-6">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#283C5D]">Catalogue Admin</h1>
          <p className="mt-0.5 text-sm text-[#283C5D]/50">
            Edit specialties, categories, subcategories and procedures
          </p>
        </div>
        <div className="flex items-center gap-3">
          {changeLog.length > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              {changeLog.length} change{changeLog.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setShowExport(true)}
            disabled={changeLog.length === 0}
            className="flex items-center gap-2 rounded-full bg-[#283C5D] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1f2f49] disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> Export Changes
          </button>
        </div>
      </div>

      {/* ── Change log ── */}
      {changeLog.length > 0 && (
        <div className="mb-6">
          <ChangeLogPanel changes={changeLog} onDiscard={discardLog} />
        </div>
      )}

      {/* ── Three-column layout ── */}
      <div className="grid grid-cols-[240px_240px_1fr] gap-4 items-start">

        {/* ── Col 1: Specialties ── */}
        <div className="rounded-2xl border border-[#CEB591]/25 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className={TIER_LABEL}>Specialties</p>
            <button
              onClick={() => { setAddingSpecialty((v) => !v); setAddingCategory(false); }}
              className="flex items-center gap-1 rounded-lg bg-[#F8F3EA] px-2 py-1 text-[10px] font-semibold text-[#283C5D] hover:bg-[#F1E1C6]/60"
            >
              <Plus className="h-3 w-3" /> New
            </button>
          </div>

          {addingSpecialty && (
            <AddSpecialtyForm
              onAdd={handleAddSpecialty}
              onCancel={() => setAddingSpecialty(false)}
            />
          )}

          <div className="space-y-1 mt-2">
            {allSpecialtyIds.map((spId) => {
              const en = getEn(spId, "specialitiesName");
              const fr = getFr(spId, "specialitiesName_fr");
              const isActive  = selectedSpecialty === spId;
              const isEditing = editingId === spId;
              return (
                <div key={spId}>
                  <div
                    className={`group cursor-pointer ${ROW_BASE} ${isActive ? ROW_ACTIVE : ROW_HOVER}`}
                    onClick={() => {
                      setSelectedSpecialty(spId);
                      setSelectedCategory(null);
                      setEditingId(null);
                    }}
                  >
                    <span className="truncate">{en}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(isEditing ? null : spId); }}
                        className={`${ICON_BTN} opacity-0 group-hover:opacity-100 ${isActive ? "text-white/70 hover:text-white" : "text-[#283C5D]/40 hover:text-[#283C5D]"}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white/60" : "text-[#283C5D]/25"}`} />
                    </div>
                  </div>

                  {isEditing && (
                    <InlineEdit
                      currentId={spId}
                      currentEn={en}
                      currentFr={fr}
                      onSave={(newId, sameKey, newEn, newFr) =>
                        handleRenameSpecialty(spId, newId, sameKey, newEn, newFr)
                      }
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Col 2: Categories ── */}
        <div className="rounded-2xl border border-[#CEB591]/25 bg-white p-4 shadow-sm">
          {selectedSpecialty ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className={TIER_LABEL}>
                  Categories
                  <span className="ml-1 text-[#CEB591]">· {getEn(selectedSpecialty, "specialitiesName")}</span>
                </p>
                <button
                  onClick={() => { setAddingCategory((v) => !v); setAddingSpecialty(false); }}
                  className="flex items-center gap-1 rounded-lg bg-[#F8F3EA] px-2 py-1 text-[10px] font-semibold text-[#283C5D] hover:bg-[#F1E1C6]/60"
                >
                  <Plus className="h-3 w-3" /> New
                </button>
              </div>

              {addingCategory && (
                <AddCategoryForm
                  specialtyId={selectedSpecialty}
                  allCategories={catalog.categories}
                  alreadyMappedIds={specialtyMap[selectedSpecialty] ?? []}
                  translations={translations}
                  onAssignExisting={(catId) => {
                    setSpecialtyMap((prev) => ({
                      ...prev,
                      [selectedSpecialty]: [...(prev[selectedSpecialty] ?? []), catId],
                    }));
                    const catEn = translations.categoriesName[catId] ?? catId;
                    logChange(
                      `assign_category:${selectedSpecialty}:${catId}`,
                      `Mapped existing category "${catId}" (${catEn}) to ${selectedSpecialty}`
                    );
                    setAddingCategory(false);
                  }}
                  onCreateNew={handleAddCategory}
                  onCancel={() => setAddingCategory(false)}
                />
              )}

              {categoriesForSpecialty.length === 0 && !addingCategory ? (
                <p className="mt-4 text-xs italic text-[#283C5D]/40">No categories mapped to this specialty.</p>
              ) : (
                <div className="space-y-1 mt-2">
                  {categoriesForSpecialty.map((cat) => {
                    const en = getEn(cat.id, "categoriesName");
                    const fr = getFr(cat.id, "categoriesName_fr");
                    const isActive  = selectedCategory === cat.id;
                    const isEditing = editingId === cat.id;
                    return (
                      <div key={cat.id}>
                        <div
                          className={`group cursor-pointer ${ROW_BASE} ${isActive ? ROW_ACTIVE : ROW_HOVER}`}
                          onClick={() => { setSelectedCategory(cat.id); setEditingId(null); }}
                        >
                          <span className="truncate">{en}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingId(isEditing ? null : cat.id); }}
                              className={`${ICON_BTN} opacity-0 group-hover:opacity-100 ${isActive ? "text-white/70 hover:text-white" : "text-[#283C5D]/40 hover:text-[#283C5D]"}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white/60" : "text-[#283C5D]/25"}`} />
                          </div>
                        </div>

                        {isEditing && (
                          <InlineEdit
                            currentId={cat.id}
                            currentEn={en}
                            currentFr={fr}
                            onSave={(newId, sameKey, newEn, newFr) =>
                              handleRenameCategory(cat.id, newId, sameKey, newEn, newFr)
                            }
                            onCancel={() => setEditingId(null)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="mt-8 text-center text-xs italic text-[#283C5D]/30">Select a specialty</p>
          )}
        </div>

        {/* ── Col 3: Subcategories & Procedures ── */}
        <div className="rounded-2xl border border-[#CEB591]/25 bg-white p-5 shadow-sm">
          {selectedCategoryData ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className={TIER_LABEL}>
                  {getEn(selectedCategoryData.id, "categoriesName")} · Subcategories & Procedures
                </p>
                <button
                  onClick={() => setAddingSubcategoryTo(selectedCategoryData.id)}
                  className="flex items-center gap-1.5 rounded-full bg-[#F8F3EA] px-3 py-1.5 text-xs font-semibold text-[#283C5D] hover:bg-[#F1E1C6]/60"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Subcategory
                </button>
              </div>

              {addingSubcategoryTo === selectedCategoryData.id && (
                <AddSubcategoryForm
                  onAdd={(id, en, fr, procs) =>
                    handleAddSubcategory(selectedCategoryData.id, id, en, fr, procs)
                  }
                  onCancel={() => setAddingSubcategoryTo(null)}
                />
              )}

              <div className="mt-4 space-y-5">
                {selectedCategoryData.subcategories.map((sub) => {
                  const subEn     = getEn(sub.subcategory, "subcategoriesName");
                  const subFr     = getFr(sub.subcategory, "subcategoriesName_fr");
                  const isEditing = editingId === sub.subcategory;
                  const isAdding  = addingProcedureTo === sub.subcategory;

                  return (
                    <div key={sub.subcategory} className="rounded-xl border border-[#CEB591]/20 bg-[#FDFAF6] p-4">
                      {/* Subcategory header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#283C5D]">{subEn}</p>
                          {subFr && <p className="text-xs text-[#283C5D]/45 italic">{subFr}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingId(isEditing ? null : sub.subcategory)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#283C5D]/50 hover:bg-[#F1E1C6]/50 hover:text-[#283C5D]"
                          >
                            <Pencil className="h-3 w-3" /> Rename
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(selectedCategoryData.id, sub.subcategory)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <InlineEdit
                          currentId={sub.subcategory}
                          currentEn={subEn}
                          currentFr={subFr}
                          onSave={(newId, sameKey, en, fr) =>
                            handleRenameSubcategory(selectedCategoryData.id, sub.subcategory, newId, sameKey, en, fr)
                          }
                          onCancel={() => setEditingId(null)}
                        />
                      )}

                      {/* Procedures */}
                      <div className="mt-3 space-y-1.5">
                        {sub.procedures.map((proc) => {
                          const procEn    = getEn(proc.id, "proceduresName");
                          const procFr    = getFr(proc.id, "proceduresName_fr");
                          const isEditingP = editingId === `proc:${proc.id}`;
                          return (
                            <div key={proc.id}>
                              <div className="group flex items-center justify-between rounded-lg border border-[#CEB591]/15 bg-white px-3 py-2">
                                <div className="min-w-0">
                                  <span className="text-xs font-medium text-[#283C5D]">{procEn}</span>
                                  {procFr && (
                                    <span className="ml-2 text-xs italic text-[#283C5D]/45">{procFr}</span>
                                  )}
                                  <span className="ml-2 font-mono text-[10px] text-[#283C5D]/25">{proc.id}</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() => setEditingId(isEditingP ? null : `proc:${proc.id}`)}
                                    className="rounded-lg p-1 text-[#283C5D]/40 hover:bg-[#F8F3EA] hover:text-[#283C5D]"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProcedure(selectedCategoryData.id, sub.subcategory, proc.id)}
                                    className="rounded-lg p-1 text-red-300 hover:bg-red-50 hover:text-red-500"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {isEditingP && (
                                <InlineEdit
                                  currentId={proc.id}
                                  currentEn={procEn}
                                  currentFr={procFr}
                                  onSave={(newId, sameKey, en, fr) =>
                                    handleRenameProcedure(
                                      selectedCategoryData.id,
                                      sub.subcategory,
                                      proc.id,
                                      newId,
                                      sameKey,
                                      en,
                                      fr
                                    )
                                  }
                                  onCancel={() => setEditingId(null)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add procedure */}
                      {isAdding ? (
                        <AddProcedureForm
                          onAdd={(id, en, fr) =>
                            handleAddProcedure(selectedCategoryData.id, sub.subcategory, id, en, fr)
                          }
                          onCancel={() => setAddingProcedureTo(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setAddingProcedureTo(sub.subcategory)}
                          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#CEB591] hover:text-[#b89870]"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Procedure
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center text-sm italic text-[#283C5D]/30">
              Select a specialty → category to manage procedures
            </div>
          )}
        </div>
      </div>

      {/* ── Export modal ── */}
      {showExport && (
        <ExportModal
          catalog={catalog}
          translations={translations}
          specialtyMap={specialtyMap}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
