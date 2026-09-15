"use client";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Translation = {
  localeCode: string;
  name: string;
  description: string | null;
};

type ProcedureItem = {
  procedureId: string;
  doctorPrice: string | null;
  defaultPrice: string | null;
  effectivePrice: string | null;
  customDescription: string | null;
  topRank: number | null;
  translations: Translation[];
};

type ProceduresResponse = {
  success?: boolean;
  currency?: string;
  procedures?: ProcedureItem[];
  error?: string;
};

type FilterType =
  | "all"
  | "customPrice"
  | "defaultPrice"
  | "customDescription";

function getTranslation(
  procedure: ProcedureItem,
  locale: string
) {
  return (
    procedure.translations.find(
      (translation) =>
        translation.localeCode === locale
    ) ??
    procedure.translations.find(
      (translation) =>
        translation.localeCode === "en"
    ) ??
    procedure.translations[0]
  );
}

export default function DoctorProceduresManager() {
  const locale = useLocale();

  const t = useTranslations(
    "procedureEdit"
  );

  const [procedures, setProcedures] =
    useState<ProcedureItem[]>([]);

  const [currency, setCurrency] =
    useState("eur");

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [savedId, setSavedId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/doctor-profile/procedures",
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as ProceduresResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              t("states.loadError")
          );
        }

        const loadedProcedures =
          data.procedures ?? [];

        setProcedures(
          loadedProcedures
        );

        setCurrency(
          data.currency ?? "eur"
        );

        if (
          loadedProcedures.length > 0
        ) {
          setSelectedId(
            loadedProcedures[0]
              .procedureId
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : t("states.loadError")
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [t]);

  const filteredProcedures =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return procedures.filter(
        (procedure) => {
          const translation =
            getTranslation(
              procedure,
              locale
            );

          const matchesSearch =
            !value ||
            translation?.name
              .toLowerCase()
              .includes(value) ||
            procedure.procedureId
              .toLowerCase()
              .includes(value);

          if (!matchesSearch) {
            return false;
          }

          if (filter === "all") {
            return true;
          }

          if (
            filter === "customPrice"
          ) {
            return (
              procedure.doctorPrice !==
              null
            );
          }

          if (
            filter === "defaultPrice"
          ) {
            return (
              procedure.doctorPrice ===
                null &&
              procedure.defaultPrice !==
                null
            );
          }

          if (
            filter ===
            "customDescription"
          ) {
            return (
              procedure.customDescription !==
              null
            );
          }

          return true;
        }
      );
    }, [
      procedures,
      search,
      filter,
      locale,
    ]);

  const selectedProcedure =
    procedures.find(
      (procedure) =>
        procedure.procedureId ===
        selectedId
    ) ?? null;

  function updateProcedure(
    procedureId: string,
    update: Partial<ProcedureItem>
  ) {
    setProcedures((current) =>
      current.map((procedure) =>
        procedure.procedureId ===
        procedureId
          ? {
              ...procedure,
              ...update,
            }
          : procedure
      )
    );

    setSavedId(null);
  }

  function updateDoctorPrice(
    procedure: ProcedureItem,
    value: string
  ) {
    const doctorPrice =
      value.trim() === ""
        ? null
        : value;

    updateProcedure(
      procedure.procedureId,
      {
        doctorPrice,
        effectivePrice:
          doctorPrice ??
          procedure.defaultPrice,
      }
    );
  }

  function resetPriceToDefault(
    procedure: ProcedureItem
  ) {
    updateProcedure(
      procedure.procedureId,
      {
        doctorPrice: null,
        effectivePrice:
          procedure.defaultPrice,
      }
    );
  }

  function resetDescriptionToDefault(
    procedure: ProcedureItem
  ) {
    updateProcedure(
      procedure.procedureId,
      {
        customDescription: null,
      }
    );
  }

  async function save(
    procedure: ProcedureItem
  ) {
    setSavingId(
      procedure.procedureId
    );

    setSavedId(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/doctor-profile/procedures/${procedure.procedureId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            price:
              procedure.doctorPrice?.trim() ||
              null,

            description:
              procedure.customDescription?.trim() ||
              null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            t("states.saveError")
        );
      }

      const savedDoctorPrice =
        data.procedure.price ??
        null;

      updateProcedure(
        procedure.procedureId,
        {
          doctorPrice:
            savedDoctorPrice,

          effectivePrice:
            savedDoctorPrice ??
            procedure.defaultPrice,

          customDescription:
            data.procedure.description ??
            null,
        }
      );

      setSavedId(
        procedure.procedureId
      );

      window.setTimeout(() => {
        setSavedId(null);
      }, 2000);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t("states.saveError")
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-[#283C5D]/10 bg-white">
        <div className="flex items-center gap-3 text-sm text-[#283C5D]/60">
          <Loader2 className="h-6 w-6 animate-spin text-[#283C5D]" />
          {t("states.loading")}
        </div>
      </div>
    );
  }

  const selectedTranslation =
    selectedProcedure
      ? getTranslation(
          selectedProcedure,
          locale
        )
      : null;

  const defaultDescription =
    selectedTranslation?.description ??
    null;

  const isUsingDefaultPrice =
    selectedProcedure?.doctorPrice ===
      null &&
    selectedProcedure?.defaultPrice !==
      null;

  const hasPriceOverride =
    selectedProcedure?.doctorPrice !==
    null;

  const isUsingDefaultDescription =
    selectedProcedure?.customDescription ===
      null &&
    defaultDescription !== null;

  const hasDescriptionOverride =
    selectedProcedure?.customDescription !==
    null;

  const saving =
    savingId ===
    selectedProcedure?.procedureId;

  const saved =
    savedId ===
    selectedProcedure?.procedureId;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#283C5D]/60 transition hover:text-[#283C5D]"
        >
          <ArrowLeft className="h-4 w-4" />

          {t("backToDashboard")}
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid min-h-[620px] overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_20px_60px_rgba(40,60,93,0.06)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-[#283C5D]/10 bg-[#FAF9F7] lg:border-b-0 lg:border-r">
          <div className="border-b border-[#283C5D]/10 p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#283C5D]/40" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={t(
                  "search.placeholder"
                )}
                className="w-full rounded-xl border border-[#283C5D]/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D]"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <FilterButton
                active={
                  filter === "all"
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                {t("filters.all")}
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "customPrice"
                }
                onClick={() =>
                  setFilter(
                    "customPrice"
                  )
                }
              >
                {t(
                  "filters.customPrice"
                )}
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "defaultPrice"
                }
                onClick={() =>
                  setFilter(
                    "defaultPrice"
                  )
                }
              >
                {t(
                  "filters.defaultPrice"
                )}
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "customDescription"
                }
                onClick={() =>
                  setFilter(
                    "customDescription"
                  )
                }
              >
                {t(
                  "filters.customDescription"
                )}
              </FilterButton>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto p-2 lg:max-h-[620px]">
            {filteredProcedures.map(
              (procedure) => {
                const translation =
                  getTranslation(
                    procedure,
                    locale
                  );

                const selected =
                  procedure.procedureId ===
                  selectedId;

                return (
                  <button
                    key={
                      procedure.procedureId
                    }
                    type="button"
                    onClick={() =>
                      setSelectedId(
                        procedure.procedureId
                      )
                    }
                    className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      selected
                        ? "bg-[#283C5D] text-white shadow-sm"
                        : "text-[#283C5D] hover:bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-white/10"
                          : "bg-white"
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-[#D8BD8D]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {translation?.name ??
                          procedure.procedureId}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        {procedure.effectivePrice && (
                          <span
                            className={`text-xs ${
                              selected
                                ? "text-white/60"
                                : "text-[#283C5D]/45"
                            }`}
                          >
                            {
                              procedure.effectivePrice
                            }{" "}
                            {currency.toUpperCase()}
                          </span>
                        )}

                        {procedure.topRank !==
                          null && (
                          <span className="text-[10px] font-semibold text-[#D8BD8D]">
                            {t(
                              "editor.top",
                              {
                                rank: procedure.topRank,
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${
                        selected
                          ? "text-white/60"
                          : "text-[#283C5D]/25"
                      }`}
                    />
                  </button>
                );
              }
            )}

            {filteredProcedures.length ===
              0 && (
              <div className="px-4 py-10 text-center text-sm text-[#283C5D]/50">
                {t(
                  "states.noProcedures"
                )}
              </div>
            )}
          </div>
        </aside>

        <section className="p-6 md:p-8">
          {!selectedProcedure ? (
            <div className="flex min-h-[450px] items-center justify-center text-sm text-[#283C5D]/50">
              {t(
                "states.selectProcedure"
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 border-b border-[#283C5D]/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-[#283C5D]">
                      {selectedTranslation?.name ??
                        selectedProcedure.procedureId}
                    </h2>

                    {selectedProcedure.topRank !==
                      null && (
                      <span className="rounded-full bg-[#D8BD8D]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9B7C45]">
                        {t(
                          "editor.top",
                          {
                            rank: selectedProcedure.topRank,
                          }
                        )}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-[#283C5D]/50">
                    {t(
                      "editor.subtitle"
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void save(
                      selectedProcedure
                    )
                  }
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 text-sm font-semibold text-white transition hover:bg-[#1f304d] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving
                    ? t("editor.saving")
                    : saved
                      ? t(
                          "editor.saved"
                        )
                      : t(
                          "editor.save"
                        )}
                </button>
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8BD8D]/15 text-[#9B7C45]">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#283C5D]">
                        {t(
                          "pricing.title"
                        )}
                      </h3>

                      <p className="text-xs text-[#283C5D]/50">
                        {t(
                          "pricing.description"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="max-w-sm">
                    <label className="mb-2 block text-sm font-semibold text-[#283C5D]">
                      {t(
                        "pricing.label"
                      )}
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          selectedProcedure.doctorPrice ??
                          selectedProcedure.defaultPrice ??
                          ""
                        }
                        onChange={(event) =>
                          updateDoctorPrice(
                            selectedProcedure,
                            event.target.value
                          )
                        }
                        placeholder={t(
                          "pricing.placeholder"
                        )}
                        className="w-full rounded-xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-3 pr-20 text-sm font-medium text-[#283C5D] outline-none transition focus:border-[#D8BD8D]"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-[#283C5D]/40">
                        {currency}
                      </span>
                    </div>

                    {isUsingDefaultPrice && (
                      <div className="mt-3 rounded-xl bg-[#D8BD8D]/10 px-4 py-3">
                        <p className="text-xs font-semibold text-[#9B7C45]">
                          {t(
                            "pricing.usingDefault"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#283C5D]/50">
                          {t(
                            "pricing.usingDefaultDescription"
                          )}
                        </p>
                      </div>
                    )}

                    {hasPriceOverride && (
                      <button
                        type="button"
                        onClick={() =>
                          resetPriceToDefault(
                            selectedProcedure
                          )
                        }
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#283C5D] transition hover:text-[#D8BD8D]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />

                        {t(
                          "pricing.reset"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#283C5D]/10 pt-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8BD8D]/15 text-[#9B7C45]">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#283C5D]">
                        {t(
                          "description.title"
                        )}
                      </h3>

                      <p className="text-xs text-[#283C5D]/50">
                        {t(
                          "description.subtitle"
                        )}
                      </p>
                    </div>
                  </div>

                  <label className="mb-2 block text-sm font-semibold text-[#283C5D]">
                    {t(
                      "description.label"
                    )}
                  </label>

                  <textarea
                    rows={8}
                    value={
                      selectedProcedure.customDescription ??
                      defaultDescription ??
                      ""
                    }
                    onChange={(event) =>
                      updateProcedure(
                        selectedProcedure.procedureId,
                        {
                          customDescription:
                            event.target.value,
                        }
                      )
                    }
                    placeholder={t(
                      "description.placeholder"
                    )}
                    className="w-full resize-y rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-4 text-sm leading-7 text-[#283C5D] outline-none transition focus:border-[#D8BD8D]"
                  />

                  {isUsingDefaultDescription && (
                    <div className="mt-3 rounded-xl bg-[#D8BD8D]/10 px-4 py-3">
                      <p className="text-xs font-semibold text-[#9B7C45]">
                        {t(
                          "description.usingDefault"
                        )}
                      </p>

                      <p className="mt-1 text-xs text-[#283C5D]/50">
                        {t(
                          "description.usingDefaultDescription"
                        )}
                      </p>
                    </div>
                  )}

                  {hasDescriptionOverride && (
                    <button
                      type="button"
                      onClick={() =>
                        resetDescriptionToDefault(
                          selectedProcedure
                        )
                      }
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#283C5D] transition hover:text-[#D8BD8D]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />

                      {t(
                        "description.reset"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
        active
          ? "bg-[#283C5D] text-white"
          : "bg-white text-[#283C5D]/55 hover:text-[#283C5D]"
      }`}
    >
      {children}
    </button>
  );
}