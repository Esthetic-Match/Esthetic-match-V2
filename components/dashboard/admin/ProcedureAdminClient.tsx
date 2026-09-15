"use client";

import {
  Check,
  Loader2,
  Search,
  Save,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

type ProcedureTranslation = {
  localeCode: string;
  name: string;
  description: string | null;
};

export type AdminProcedure = {
  id: string;
  isActive: boolean;
  defaultPrice: string;
  translations: ProcedureTranslation[];
};

type Props = {
  initialProcedures: AdminProcedure[];
};

function getProcedureName(procedure: AdminProcedure) {
  return (
    procedure.translations.find(
      (translation) => translation.localeCode === "en",
    )?.name ??
    procedure.translations[0]?.name ??
    procedure.id
  );
}

export default function ProcedureAdminClient({
  initialProcedures,
}: Props) {
  const [procedures, setProcedures] =
    useState(initialProcedures);

  const [selectedId, setSelectedId] = useState(
    initialProcedures[0]?.id ?? "",
  );

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const filteredProcedures = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return procedures;
    }

    return procedures.filter((procedure) => {
      const names = procedure.translations
        .map((translation) => translation.name)
        .join(" ")
        .toLowerCase();

      return (
        procedure.id.toLowerCase().includes(value) ||
        names.includes(value)
      );
    });
  }, [procedures, search]);

  const selectedProcedure =
    procedures.find(
      (procedure) => procedure.id === selectedId,
    ) ?? null;

  function updateSelectedProcedure(
    updater: (procedure: AdminProcedure) => AdminProcedure,
  ) {
    setProcedures((current) =>
      current.map((procedure) =>
        procedure.id === selectedId
          ? updater(procedure)
          : procedure,
      ),
    );

    setSaved(false);
    setError(null);
  }

  function updatePrice(value: string) {
    updateSelectedProcedure((procedure) => ({
      ...procedure,
      defaultPrice: value,
    }));
  }

  function updateDescription(
    localeCode: string,
    description: string,
  ) {
    updateSelectedProcedure((procedure) => ({
      ...procedure,
      translations: procedure.translations.map(
        (translation) =>
          translation.localeCode === localeCode
            ? {
                ...translation,
                description,
              }
            : translation,
      ),
    }));
  }

  async function saveProcedure() {
    if (!selectedProcedure) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/procedures/${selectedProcedure.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            defaultPrice:
              selectedProcedure.defaultPrice.trim() === ""
                ? null
                : selectedProcedure.defaultPrice,
            translations:
              selectedProcedure.translations.map(
                (translation) => ({
                  localeCode: translation.localeCode,
                  description:
                    translation.description?.trim() ||
                    null,
                }),
              ),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save procedure.",
        );
      }

      setProcedures((current) =>
        current.map((procedure) =>
          procedure.id === selectedProcedure.id
            ? {
                ...procedure,
                defaultPrice:
                  data.procedure.defaultPrice ?? "",
                translations:
                  data.procedure.translations,
              }
            : procedure,
        ),
      );

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save procedure.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="overflow-hidden rounded-[28px] border border-[#283C5D]/10 bg-white shadow-[0_20px_60px_rgba(40,60,93,0.06)]">
        <div className="border-b border-[#283C5D]/10 p-5">
          <h2 className="text-lg font-semibold text-[#283C5D]">
            Procedures
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {procedures.length} procedures
          </p>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search procedures..."
              className="w-full rounded-xl border border-neutral-200 bg-[#FAF9F7] py-2.5 pl-10 pr-3 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D]"
            />
          </div>
        </div>

        <div className="max-h-[700px] overflow-y-auto p-2">
          {filteredProcedures.map((procedure) => {
            const selected =
              procedure.id === selectedId;

            return (
              <button
                key={procedure.id}
                type="button"
                onClick={() => {
                  setSelectedId(procedure.id);
                  setSaved(false);
                  setError(null);
                }}
                className={`mb-1 w-full rounded-2xl px-4 py-3 text-left transition ${
                  selected
                    ? "bg-[#283C5D] text-white"
                    : "text-[#283C5D] hover:bg-[#FAF9F7]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {getProcedureName(procedure)}
                    </p>

                    <p
                      className={`mt-1 truncate text-xs ${
                        selected
                          ? "text-white/60"
                          : "text-neutral-400"
                      }`}
                    >
                      {procedure.id}
                    </p>
                  </div>

                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      procedure.isActive
                        ? "bg-emerald-400"
                        : "bg-neutral-300"
                    }`}
                  />
                </div>
              </button>
            );
          })}

          {filteredProcedures.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-neutral-500">
              No procedures found.
            </div>
          )}
        </div>
      </aside>

      <section className="rounded-[28px] border border-[#283C5D]/10 bg-white p-6 shadow-[0_20px_60px_rgba(40,60,93,0.06)] md:p-8">
        {!selectedProcedure ? (
          <div className="flex min-h-[400px] items-center justify-center text-sm text-neutral-500">
            Select a procedure.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5 border-b border-[#283C5D]/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      selectedProcedure.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {selectedProcedure.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <h2 className="text-2xl font-semibold text-[#283C5D]">
                  {getProcedureName(
                    selectedProcedure,
                  )}
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  {selectedProcedure.id}
                </p>
              </div>

              <button
                type="button"
                onClick={saveProcedure}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 text-sm font-medium text-white transition hover:bg-[#1f304d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? "Saving..."
                  : saved
                    ? "Saved"
                    : "Save changes"}
              </button>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8">
              <label className="mb-2 block text-sm font-medium text-[#283C5D]">
                Default price
              </label>

              <div className="max-w-xs">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    selectedProcedure.defaultPrice
                  }
                  onChange={(event) =>
                    updatePrice(event.target.value)
                  }
                  placeholder="0.00"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-2 focus:ring-[#D8BD8D]/20"
                />
              </div>

              <p className="mt-2 text-xs text-neutral-400">
                Leave empty if the procedure does not
                have a platform default price.
              </p>
            </div>

            <div className="mt-10 space-y-8">
              {selectedProcedure.translations.map(
                (translation) => (
                  <div
                    key={translation.localeCode}
                    className="rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#283C5D]">
                          {translation.name}
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-400">
                          {translation.localeCode}
                        </p>
                      </div>

                      <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#D8BD8D] shadow-sm">
                        {
                          translation.localeCode
                        }
                      </div>
                    </div>

                    <label className="mb-2 block text-sm font-medium text-[#283C5D]">
                      Description / details
                    </label>

                    <textarea
                      rows={8}
                      value={
                        translation.description ?? ""
                      }
                      onChange={(event) =>
                        updateDescription(
                          translation.localeCode,
                          event.target.value,
                        )
                      }
                      placeholder={`Add ${translation.localeCode} description...`}
                      className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-2 focus:ring-[#D8BD8D]/20"
                    />
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}