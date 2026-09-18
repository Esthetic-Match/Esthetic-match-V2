"use client";

import {
  Check,
  ChevronRight,
  CircleAlert,
  Copy,
  Eye,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import PostOpTemplatePreview, {
  type PostOpTemplateDto,
} from "@/components/dashboard/post-op/PostOpTemplatePreview";

import PostOpTemplateEditor from "@/components/dashboard/post-op/PostOpTemplateEditor";

type Locale =
  | "en"
  | "fr";

type ProcedureState = {
  hasDefault: boolean;
  customTemplateId:
    | string
    | null;
};

export type DoctorPostOpProcedureItem = {
  id: string;

  names: {
    en: string;
    fr: string;
  };

  states: {
    en: ProcedureState;
    fr: ProcedureState;
  };
};

type Props = {
  initialProcedures:
    DoctorPostOpProcedureItem[];

  initialLocale: Locale;
};

type EffectiveTemplateResponse = {
  template:
    | PostOpTemplateDto
    | null;

  source:
    | "DEFAULT"
    | "DOCTOR"
    | null;

  customized: boolean;
};

type ViewMode =
  | "OVERVIEW"
  | "EDIT"
  | "PREVIEW";

async function api<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response =
    await fetch(
      url,
      init,
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ??
        "Something went wrong.",
    );
  }

  return data;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */

export default function DoctorPostOpTemplatesClient({
  initialProcedures,
  initialLocale,
}: Props) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates",
    );

  const [
    procedures,
    setProcedures,
  ] = useState(
    initialProcedures,
  );

  const [
    locale,
    setLocale,
  ] =
    useState<Locale>(
      initialLocale,
    );

  const [
    selectedProcedureId,
    setSelectedProcedureId,
  ] = useState(
    initialProcedures[0]
      ?.id ?? "",
  );

  const [
    template,
    setTemplate,
  ] =
    useState<PostOpTemplateDto | null>(
      null,
    );

  const [
    source,
    setSource,
  ] =
    useState<
      | "DEFAULT"
      | "DOCTOR"
      | null
    >(null);

  const [
    customized,
    setCustomized,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    view,
    setView,
  ] =
    useState<ViewMode>(
      "OVERVIEW",
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const [
    confirmReset,
    setConfirmReset,
  ] =
    useState(false);

  const deferredSearch =
    useDeferredValue(
      search,
    );

  const selectedProcedure =
    useMemo(
      () =>
        procedures.find(
          (procedure) =>
            procedure.id ===
            selectedProcedureId,
        ) ?? null,
      [
        procedures,
        selectedProcedureId,
      ],
    );

  const filteredProcedures =
    useMemo(() => {
      const query =
        deferredSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return procedures;
      }

      return procedures.filter(
        (procedure) =>
          procedure.names[
            locale
          ]
            .toLowerCase()
            .includes(query),
      );
    }, [
      deferredSearch,
      locale,
      procedures,
    ]);

  const customizedCount =
    useMemo(
      () =>
        procedures.filter(
          (procedure) =>
            Boolean(
              procedure.states[
                locale
              ]
                .customTemplateId,
            ),
        ).length,
      [
        procedures,
        locale,
      ],
    );

  const loadTemplate =
    useCallback(
      async (
        preserveView =
          false,
      ) => {
        if (
          !selectedProcedureId
        ) {
          setTemplate(null);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const data =
            await api<EffectiveTemplateResponse>(
              `/api/post-op/doctor/templates/effective?procedureId=${encodeURIComponent(
                selectedProcedureId,
              )}&localeCode=${locale}`,
            );

          setTemplate(
            data.template,
          );

          setSource(
            data.source,
          );

          setCustomized(
            data.customized,
          );

          if (
            !preserveView
          ) {
            setView(
              "OVERVIEW",
            );
          }
        } catch (err) {
          setError(
            err instanceof
              Error
              ? err.message
              : t(
                  "errors.load",
                ),
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        locale,
        selectedProcedureId,
        t,
      ],
    );

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  function flashSuccess(
    message: string,
  ) {
    setSuccess(
      message,
    );

    window.setTimeout(
      () =>
        setSuccess(
          null,
        ),
      2500,
    );
  }

  function updateProcedureState(
    customTemplateId:
      | string
      | null,
  ) {
    setProcedures(
      (current) =>
        current.map(
          (procedure) => {
            if (
              procedure.id !==
              selectedProcedureId
            ) {
              return procedure;
            }

            return {
              ...procedure,

              states: {
                ...procedure.states,

                [locale]: {
                  ...procedure
                    .states[
                    locale
                  ],

                  customTemplateId,
                },
              },
            };
          },
        ),
    );
  }

  async function customize() {
    if (
      !selectedProcedure
    ) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(null);

    try {
      const result =
        await api<{
          template:
            PostOpTemplateDto;

          created: boolean;
        }>(
          "/api/post-op/doctor/templates",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  procedureId:
                    selectedProcedure.id,

                  localeCode:
                    locale,
                },
              ),
          },
        );

      updateProcedureState(
        result.template.id,
      );

      await loadTemplate(
        true,
      );

      setView(
        "EDIT",
      );

      flashSuccess(
        t(
          "messages.customized",
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.customize",
            ),
      );
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  async function saveTemplate() {
    if (
      !template ||
      !customized
    ) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(null);

    try {
      await api(
        `/api/post-op/doctor/templates/${template.id}`,
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              title:
                template.title,

              description:
                template.description,
            }),
        },
      );

      await loadTemplate(
        true,
      );

      flashSuccess(
        t(
          "messages.saved",
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.save",
            ),
      );
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  async function resetTemplate() {
    if (
      !template ||
      !customized
    ) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(null);

    try {
      const result =
        await api<EffectiveTemplateResponse>(
          `/api/post-op/doctor/templates/${template.id}/reset`,
          {
            method:
              "POST",
          },
        );

      updateProcedureState(
        null,
      );

      setTemplate(
        result.template,
      );

      setSource(
        result.source,
      );

      setCustomized(
        false,
      );

      setView(
        "OVERVIEW",
      );

      setConfirmReset(
        false,
      );

      flashSuccess(
        t(
          "messages.reset",
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.reset",
            ),
      );
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  return (
    <>
      <main className="min-h-screen bg-[#FAF9F7] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1550px]">
          {/* HEADER */}

          <header className="mb-7">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-[#D8BD8D]/15 text-[#B4945A]">
                    <Sparkles className="size-4" />
                  </span>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B4945A]">
                    {t(
                      "eyebrow",
                    )}
                  </p>
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#283C5D] md:text-4xl">
                  {t(
                    "title",
                  )}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                  {t(
                    "description",
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[#283C5D]/10 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {t(
                      "customizedCount",
                    )}
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#283C5D]">
                    {
                      customizedCount
                    }
                    <span className="ml-1 text-sm font-normal text-neutral-400">
                      /{" "}
                      {
                        procedures.length
                      }
                    </span>
                  </p>
                </div>

                <LocaleSwitch
                  locale={
                    locale
                  }
                  setLocale={(
                    value,
                  ) => {
                    setLocale(
                      value,
                    );

                    setView(
                      "OVERVIEW",
                    );
                  }}
                />
              </div>
            </div>
          </header>

          {error && (
            <Alert
              type="error"
              onClose={() =>
                setError(
                  null,
                )
              }
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              type="success"
            >
              {success}
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
            {/* PROCEDURES */}

            <aside className="h-fit overflow-hidden rounded-[1.75rem] border border-[#283C5D]/10 bg-white shadow-[0_18px_50px_rgba(40,60,93,0.05)] lg:sticky lg:top-6">
              <div className="border-b border-neutral-100 p-4">
                <h2 className="font-semibold text-[#283C5D]">
                  {t(
                    "procedures",
                  )}
                </h2>

                <div className="relative mt-3">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event,
                    ) =>
                      setSearch(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder={t(
                      "searchPlaceholder",
                    )}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:bg-white"
                  />
                </div>
              </div>

              <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-2">
                {filteredProcedures.map(
                  (
                    procedure,
                  ) => {
                    const state =
                      procedure
                        .states[
                        locale
                      ];

                    const selected =
                      procedure.id ===
                      selectedProcedureId;

                    return (
                      <button
                        key={
                          procedure.id
                        }
                        onClick={() => {
                          setSelectedProcedureId(
                            procedure.id,
                          );

                          setView(
                            "OVERVIEW",
                          );
                        }}
                        className={`group mb-1 flex w-full items-center justify-between rounded-2xl px-3.5 py-3.5 text-left transition ${
                          selected
                            ? "bg-[#283C5D] text-white shadow-sm"
                            : "text-[#283C5D] hover:bg-[#283C5D]/[0.045]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {
                              procedure
                                .names[
                                locale
                              ]
                            }
                          </p>

                          <div className="mt-2">
                            <StateBadge
                              customized={Boolean(
                                state.customTemplateId,
                              )}
                              available={
                                state.hasDefault
                              }
                              inverse={
                                selected
                              }
                              t={t}
                            />
                          </div>
                        </div>

                        <ChevronRight
                          className={`size-4 shrink-0 transition group-hover:translate-x-0.5 ${
                            selected
                              ? "text-white/60"
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    );
                  },
                )}

                {filteredProcedures.length ===
                  0 && (
                  <div className="px-4 py-10 text-center text-sm text-neutral-400">
                    {t(
                      "noSearchResults",
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* WORKSPACE */}

            <section className="min-w-0">
              {loading ? (
                <LoadingPanel />
              ) : !selectedProcedure ? (
                <EmptyPanel
                  text={t(
                    "selectProcedure",
                  )}
                />
              ) : !template ? (
                <NoTemplatePanel
                  procedureName={
                    selectedProcedure
                      .names[
                      locale
                    ]
                  }
                  t={t}
                />
              ) : (
                <div className="space-y-4">
                  <WorkspaceHeader
                    procedureName={
                      selectedProcedure
                        .names[
                        locale
                      ]
                    }
                    source={
                      source
                    }
                    customized={
                      customized
                    }
                    version={
                      template.version
                    }
                    locale={
                      locale
                    }
                    view={
                      view
                    }
                    busy={
                      actionLoading
                    }
                    onCustomize={
                      customize
                    }
                    onEdit={() =>
                      setView(
                        "EDIT",
                      )
                    }
                    onPreview={() =>
                      setView(
                        "PREVIEW",
                      )
                    }
                    onOverview={() =>
                      setView(
                        "OVERVIEW",
                      )
                    }
                    onSave={
                      saveTemplate
                    }
                    onReset={() =>
                      setConfirmReset(
                        true,
                      )
                    }
                    t={t}
                  />

                  {view ===
                    "PREVIEW" && (
                    <div className="overflow-hidden rounded-[1.75rem] border border-[#283C5D]/10 bg-white shadow-[0_18px_60px_rgba(40,60,93,0.05)]">
                      <div className="border-b border-[#283C5D]/10 bg-[#FAF9F7] px-5 py-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#283C5D]">
                          <Eye className="size-4 text-[#B4945A]" />

                          {t(
                            "patientPreview",
                          )}
                        </div>
                      </div>

                      <PostOpTemplatePreview
                        template={
                          template
                        }
                      />
                    </div>
                  )}

                  {view ===
                    "EDIT" &&
                    customized && (
                      <PostOpTemplateEditor
                        template={
                          template
                        }
                        setTemplate={
                          setTemplate
                        }
                        apiBase={`/api/post-op/doctor/templates/${template.id}`}
                        refresh={async () => {
                          await loadTemplate(
                            true,
                          );
                        }}
                        reportError={
                          setError
                        }
                        reportSuccess={
                          flashSuccess
                        }
                      />
                    )}

                  {view ===
                    "OVERVIEW" && (
                    <TemplateOverview
                      template={
                        template
                      }
                      customized={
                        customized
                      }
                      onCustomize={
                        customize
                      }
                      onEdit={() =>
                        setView(
                          "EDIT",
                        )
                      }
                      onPreview={() =>
                        setView(
                          "PREVIEW",
                        )
                      }
                      busy={
                        actionLoading
                      }
                      t={t}
                    />
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {confirmReset &&
        template && (
          <ResetDialog
            procedureName={
              selectedProcedure
                ?.names[
                locale
              ] ?? ""
            }
            busy={
              actionLoading
            }
            onCancel={() =>
              setConfirmReset(
                false,
              )
            }
            onConfirm={
              resetTemplate
            }
            t={t}
          />
        )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════════ */

function WorkspaceHeader({
  procedureName,
  customized,
  version,
  locale,
  view,
  busy,
  onCustomize,
  onEdit,
  onPreview,
  onOverview,
  onSave,
  onReset,
  t,
}: {
  procedureName: string;
  source:
    | "DEFAULT"
    | "DOCTOR"
    | null;
  customized: boolean;
  version: number;
  locale: Locale;
  view: ViewMode;
  busy: boolean;
  onCustomize: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onOverview: () => void;
  onSave: () => void;
  onReset: () => void;
  t: ReturnType<
    typeof useTranslations
  >;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[#283C5D]/10 bg-white p-4 shadow-[0_18px_60px_rgba(40,60,93,0.05)] md:p-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StateBadge
              customized={
                customized
              }
              available
              t={t}
            />

            <span className="rounded-full bg-[#D8BD8D]/15 px-2.5 py-1 text-[11px] font-semibold text-[#9C7B43]">
              {locale.toUpperCase()}
            </span>

            <span className="text-xs text-neutral-400">
              {t(
                "version",
                {
                  version,
                },
              )}
            </span>
          </div>

          <h2 className="mt-2 truncate text-xl font-semibold tracking-[-0.02em] text-[#283C5D]">
            {procedureName}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {view !==
            "OVERVIEW" && (
            <SecondaryButton
              onClick={
                onOverview
              }
            >
              {t(
                "overview",
              )}
            </SecondaryButton>
          )}

          {view !==
            "PREVIEW" && (
            <SecondaryButton
              onClick={
                onPreview
              }
            >
              <Eye className="size-4" />
              {t(
                "preview",
              )}
            </SecondaryButton>
          )}

          {!customized ? (
            <PrimaryButton
              onClick={
                onCustomize
              }
              disabled={
                busy
              }
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Copy className="size-4" />
              )}

              {t(
                "customize",
              )}
            </PrimaryButton>
          ) : (
            <>
              {view !==
                "EDIT" && (
                <PrimaryButton
                  onClick={
                    onEdit
                  }
                >
                  <Pencil className="size-4" />

                  {t(
                    "edit",
                  )}
                </PrimaryButton>
              )}

              {view ===
                "EDIT" && (
                <PrimaryButton
                  onClick={
                    onSave
                  }
                  disabled={
                    busy
                  }
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}

                  {t(
                    "save",
                  )}
                </PrimaryButton>
              )}

              <SecondaryButton
                onClick={
                  onReset
                }
                disabled={
                  busy
                }
                danger
              >
                <RotateCcw className="size-4" />

                {t(
                  "reset",
                )}
              </SecondaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW
═══════════════════════════════════════════════════════════════ */

function TemplateOverview({
  template,
  customized,
  onCustomize,
  onEdit,
  onPreview,
  busy,
  t,
}: {
  template:
    PostOpTemplateDto;
  customized: boolean;
  onCustomize: () => void;
  onEdit: () => void;
  onPreview: () => void;
  busy: boolean;
  t: ReturnType<
    typeof useTranslations
  >;
}) {
  const blocks =
    template.steps.reduce(
      (
        total,
        step,
      ) =>
        total +
        step.blocks.length,
      0,
    );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.75rem] border border-[#283C5D]/10 bg-white shadow-[0_18px_60px_rgba(40,60,93,0.05)]">
        <div className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#283C5D] text-white">
              {customized ? (
                <Pencil className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>

            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-[#283C5D]">
              {customized
                ? t(
                    "customOverviewTitle",
                  )
                : t(
                    "defaultOverviewTitle",
                  )}
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {customized
                ? t(
                    "customOverviewDescription",
                  )
                : t(
                    "defaultOverviewDescription",
                  )}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {!customized ? (
                <PrimaryButton
                  onClick={
                    onCustomize
                  }
                  disabled={
                    busy
                  }
                >
                  <Copy className="size-4" />
                  {t(
                    "customize",
                  )}
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  onClick={
                    onEdit
                  }
                >
                  <Pencil className="size-4" />
                  {t(
                    "editCustomization",
                  )}
                </PrimaryButton>
              )}

              <SecondaryButton
                onClick={
                  onPreview
                }
              >
                <Eye className="size-4" />
                {t(
                  "patientPreview",
                )}
              </SecondaryButton>
            </div>
          </div>
        </div>

        <div className="grid border-t border-neutral-100 sm:grid-cols-3">
          <Stat
            value={
              template.steps
                .length
            }
            label={t(
              "steps",
            )}
          />

          <Stat
            value={blocks}
            label={t(
              "contentBlocks",
            )}
          />

          <Stat
            value={
              template.reminders
                .length
            }
            label={t(
              "globalReminders",
            )}
            last
          />
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[#283C5D]/10 bg-white p-5 md:p-6">
        <h3 className="font-semibold text-[#283C5D]">
          {template.title}
        </h3>

        {template.description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            {
              template.description
            }
          </p>
        )}

        <div className="mt-6 space-y-2">
          {template.steps.map(
            (
              step,
              index,
            ) => (
              <div
                key={
                  step.id
                }
                className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-[#FAF9F7]/70 p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-xs font-semibold text-white">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#283C5D]">
                    {
                      step.title
                    }
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-400">
                    {
                      step.blocks
                        .length
                    }{" "}
                    {t(
                      "blocks"
                    )}
                  </p>
                </div>

                <ChevronRight className="size-4 text-neutral-300" />
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESET DIALOG
═══════════════════════════════════════════════════════════════ */

function ResetDialog({
  procedureName,
  busy,
  onCancel,
  onConfirm,
  t,
}: {
  procedureName: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  t: ReturnType<
    typeof useTranslations
  >;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#142033]/45 p-4 backdrop-blur-sm">
      <button
        aria-label="Close"
        className="absolute inset-0"
        onClick={
          busy
            ? undefined
            : onCancel
        }
      />

      <div className="relative w-full max-w-md rounded-[1.75rem] border border-white/60 bg-white p-6 shadow-2xl">
        <button
          onClick={
            onCancel
          }
          disabled={
            busy
          }
          className="absolute right-4 top-4 rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-[#283C5D]"
        >
          <X className="size-4" />
        </button>

        <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <CircleAlert className="size-5" />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-[#283C5D]">
          {t(
            "resetDialog.title",
          )}
        </h3>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {t(
            "resetDialog.description",
            {
              procedure:
                procedureName,
            },
          )}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton
            onClick={
              onCancel
            }
            disabled={
              busy
            }
          >
            {t(
              "cancel",
            )}
          </SecondaryButton>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              busy
            }
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {busy && (
              <Loader2 className="size-4 animate-spin" />
            )}

            {t(
              "resetDialog.confirm",
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SMALL UI
═══════════════════════════════════════════════════════════════ */

function StateBadge({
  customized,
  available,
  inverse = false,
  t,
}: {
  customized: boolean;
  available: boolean;
  inverse?: boolean;
  t: ReturnType<
    typeof useTranslations
  >;
}) {
  if (
    !available &&
    !customized
  ) {
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        inverse
          ? "bg-white/10 text-white/60"
          : "bg-neutral-100 text-neutral-500"
      }`}>
        {t(
          "unavailable",
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
      customized
        ? inverse
          ? "bg-[#D8BD8D]/20 text-[#F0D8AA]"
          : "bg-[#D8BD8D]/20 text-[#8B6C37]"
        : inverse
          ? "bg-white/10 text-white/70"
          : "bg-[#283C5D]/[0.07] text-[#283C5D]"
    }`}>
      {customized
        ? t(
            "customized",
          )
        : t(
            "default",
          )}
    </span>
  );
}

function LocaleSwitch({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (
    locale: Locale,
  ) => void;
}) {
  return (
    <div className="flex rounded-2xl border border-[#283C5D]/10 bg-white p-1 shadow-sm">
      {(
        [
          "en",
          "fr",
        ] as Locale[]
      ).map(
        (item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setLocale(
                item,
              )
            }
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              item ===
              locale
                ? "bg-[#283C5D] text-white shadow-sm"
                : "text-[#283C5D] hover:bg-[#283C5D]/5"
            }`}
          >
            {item.toUpperCase()}
          </button>
        ),
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  last,
}: {
  value: number;
  label: string;
  last?: boolean;
}) {
  return (
    <div className={`px-6 py-5 ${
      last
        ? ""
        : "border-b border-neutral-100 sm:border-b-0 sm:border-r"
    }`}>
      <p className="text-2xl font-semibold text-[#283C5D]">
        {value}
      </p>

      <p className="mt-1 text-xs text-neutral-400">
        {label}
      </p>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children:
    React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#283C5D] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#21334F] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
  danger = false,
}: {
  children:
    React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-red-100 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-[#283C5D]/10 bg-white text-[#283C5D] hover:bg-[#283C5D]/5"
      }`}
    >
      {children}
    </button>
  );
}

function Alert({
  children,
  type,
  onClose,
}: {
  children:
    React.ReactNode;
  type:
    | "success"
    | "error";
  onClose?: () => void;
}) {
  const success =
    type ===
    "success";

  return (
    <div className={`mb-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
      success
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}>
      <div className="flex items-center gap-2">
        {success && (
          <Check className="size-4" />
        )}

        {children}
      </div>

      {onClose && (
        <button
          onClick={
            onClose
          }
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-[1.75rem] border border-[#283C5D]/10 bg-white">
      <Loader2 className="size-6 animate-spin text-[#283C5D]" />
    </div>
  );
}

function EmptyPanel({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-[1.75rem] border border-[#283C5D]/10 bg-white p-8 text-center text-sm text-neutral-400">
      {text}
    </div>
  );
}

function NoTemplatePanel({
  procedureName,
  t,
}: {
  procedureName: string;
  t: ReturnType<
    typeof useTranslations
  >;
}) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[1.75rem] border border-[#283C5D]/10 bg-white p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#B4945A]">
        <ShieldCheck className="size-5" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-[#283C5D]">
        {t(
          "noTemplateTitle",
        )}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
        {t(
          "noTemplateDescription",
          {
            procedure:
              procedureName,
          },
        )}
      </p>
    </div>
  );
}