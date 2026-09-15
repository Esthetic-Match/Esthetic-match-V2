"use client";

import {
  Check,
  CircleDollarSign,
  FileText,
  Loader2,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

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

type ProcedureQuickEditModalProps = {
  open: boolean;
  procedureId: string;
  onClose: () => void;
  onSaved?: () => void;
};

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

export default function ProcedureQuickEditModal({
  open,
  procedureId,
  onClose,
  onSaved,
}: ProcedureQuickEditModalProps) {
  const locale = useLocale();

  const t = useTranslations(
    "procedureEdit"
  );

  const [procedure, setProcedure] =
    useState<ProcedureItem | null>(
      null
    );

  const [currency, setCurrency] =
    useState("eur");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      setError(null);
      setSaved(false);

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

        const foundProcedure =
          data.procedures?.find(
            (item) =>
              item.procedureId ===
              procedureId
          );

        if (!foundProcedure) {
          throw new Error(
            t("modal.notFound")
          );
        }

        setProcedure(
          foundProcedure
        );

        setCurrency(
          data.currency ?? "eur"
        );
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
  }, [
    open,
    procedureId,
    t,
  ]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const translation = procedure
    ? getTranslation(
        procedure,
        locale
      )
    : null;

  const defaultDescription =
    translation?.description ?? null;

  const isUsingDefaultPrice =
    procedure?.doctorPrice === null &&
    procedure?.defaultPrice !== null;

  const hasPriceOverride =
    procedure?.doctorPrice !== null;

  const isUsingDefaultDescription =
    procedure?.customDescription ===
      null &&
    defaultDescription !== null;

  const hasDescriptionOverride =
    procedure?.customDescription !==
    null;

  function updateDoctorPrice(
    value: string
  ) {
    if (!procedure) return;

    const doctorPrice =
      value.trim() === ""
        ? null
        : value;

    setProcedure({
      ...procedure,

      doctorPrice,

      effectivePrice:
        doctorPrice ??
        procedure.defaultPrice,
    });

    setSaved(false);
  }

  function updateDescription(
    value: string
  ) {
    if (!procedure) return;

    setProcedure({
      ...procedure,
      customDescription: value,
    });

    setSaved(false);
  }

  function resetPrice() {
    if (!procedure) return;

    setProcedure({
      ...procedure,

      doctorPrice: null,

      effectivePrice:
        procedure.defaultPrice,
    });

    setSaved(false);
  }

  function resetDescription() {
    if (!procedure) return;

    setProcedure({
      ...procedure,
      customDescription: null,
    });

    setSaved(false);
  }

  async function save() {
    if (!procedure) return;

    setSaving(true);
    setSaved(false);
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

      const doctorPrice =
        data.procedure.price ??
        null;

      setProcedure(
        (current) =>
          current
            ? {
                ...current,

                doctorPrice,

                effectivePrice:
                  doctorPrice ??
                  current.defaultPrice,

                customDescription:
                  data.procedure
                    .description ??
                  null,
              }
            : current
      );

      setSaved(true);

      onSaved?.();

      window.setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t("states.saveError")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17243A]/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_30px_100px_rgba(20,31,50,0.28)]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t(
            "modal.close"
          )}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-[#283C5D]/60 shadow-sm transition hover:border-[#D8BD8D] hover:text-[#283C5D]"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#283C5D]/60">
              <Loader2 className="h-5 w-5 animate-spin" />

              {t("states.loading")}
            </div>
          </div>
        ) : error && !procedure ? (
          <div className="flex min-h-[300px] items-center justify-center p-8">
            <div className="text-center">
              <p className="font-semibold text-[#283C5D]">
                {t(
                  "modal.loadErrorTitle"
                )}
              </p>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        ) : procedure ? (
          <>
            <div className="border-b border-[#283C5D]/10 px-6 py-6 pr-16 md:px-8 md:py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8BD8D]">
                {t(
                  "modal.eyebrow"
                )}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#283C5D]">
                {translation?.name ??
                  procedure.procedureId}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#283C5D]/55">
                {t(
                  "editor.subtitle"
                )}
              </p>
            </div>

            <div className="space-y-8 p-6 md:p-8">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

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
                        procedure.doctorPrice ??
                        procedure.defaultPrice ??
                        ""
                      }
                      onChange={(
                        event
                      ) =>
                        updateDoctorPrice(
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

                      <p className="mt-1 text-xs leading-5 text-[#283C5D]/50">
                        {t(
                          "pricing.usingDefaultDescription"
                        )}
                      </p>
                    </div>
                  )}

                  {hasPriceOverride && (
                    <button
                      type="button"
                      onClick={
                        resetPrice
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
                  rows={7}
                  value={
                    procedure.customDescription ??
                    defaultDescription ??
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    updateDescription(
                      event.target.value
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

                    <p className="mt-1 text-xs leading-5 text-[#283C5D]/50">
                      {t(
                        "description.usingDefaultDescription"
                      )}
                    </p>
                  </div>
                )}

                {hasDescriptionOverride && (
                  <button
                    type="button"
                    onClick={
                      resetDescription
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

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#283C5D]/10 bg-white/95 px-6 py-5 backdrop-blur md:px-8">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl px-5 text-sm font-semibold text-[#283C5D]/60 transition hover:bg-[#283C5D]/5 hover:text-[#283C5D]"
              >
                {t(
                  "modal.close"
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  void save()
                }
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-5 text-sm font-semibold text-white transition hover:bg-[#1f304d] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? t(
                      "editor.saving"
                    )
                  : saved
                    ? t(
                        "editor.saved"
                      )
                    : t(
                        "editor.save"
                      )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}