"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eye,
  FilePlus2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import PostOpTemplatePreview, {
  type PostOpBlockDto,
  type PostOpReminderDto,
  type PostOpStepDto,
  type PostOpTemplateDto,
} from "@/components/dashboard/post-op/PostOpTemplatePreview";

type Locale = "en" | "fr";

type TemplateSummary = {
  id: string;
  localeCode: string;
  title: string;
  version: number;
  isActive: boolean;
};

type ProcedureItem = {
  id: string;

  names: {
    en: string;
    fr: string;
  };

  templates: {
    en: TemplateSummary | null;
    fr: TemplateSummary | null;
  };
};

type Props = {
  initialProcedures: ProcedureItem[];
};

async function api<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(
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

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?:
    | "primary"
    | "secondary"
    | "danger";
  type?: "button" | "submit";
}) {
  const styles =
    variant === "primary"
      ? "bg-[#283C5D] text-white"
      : variant === "danger"
        ? "border border-red-200 bg-red-50 text-red-700"
        : "border border-[#283C5D]/10 bg-white text-[#283C5D]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

function statusFor(
  procedure: ProcedureItem,
  locale: Locale,
) {
  const template =
    procedure.templates[locale];

  if (!template) {
    return "MISSING" as const;
  }

  return template.isActive
    ? ("CONFIGURED" as const)
    : ("DRAFT" as const);
}

function StatusBadge({
  status,
}: {
  status:
    | "MISSING"
    | "DRAFT"
    | "CONFIGURED";
}) {
  const style =
    status === "CONFIGURED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "DRAFT"
        ? "bg-amber-50 text-amber-700"
        : "bg-neutral-100 text-neutral-500";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      {status === "CONFIGURED"
        ? "Configured"
        : status === "DRAFT"
          ? "Draft"
          : "Missing"}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN
═══════════════════════════════════════════════════════════════ */

export default function PostOpAdminClient({
  initialProcedures,
}: Props) {
  const [
    procedures,
    setProcedures,
  ] = useState(initialProcedures);

  const [
    locale,
    setLocale,
  ] = useState<Locale>("en");

  const [
    selectedProcedureId,
    setSelectedProcedureId,
  ] = useState(
    initialProcedures[0]?.id ?? "",
  );

  const [
    template,
    setTemplate,
  ] =
    useState<PostOpTemplateDto | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [preview, setPreview] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

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

  const loadTemplate =
    useCallback(async () => {
      if (!selectedProcedureId) {
        setTemplate(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api<{
          template:
            | PostOpTemplateDto
            | null;
        }>(
          `/api/admin/post-op/templates?procedureId=${encodeURIComponent(
            selectedProcedureId,
          )}&localeCode=${locale}`,
        );

        setTemplate(
          data.template,
        );

        if (data.template) {
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

                    templates: {
                      ...procedure.templates,

                      [locale]: {
                        id:
                          data.template!
                            .id,

                        localeCode:
                          data
                            .template!
                            .localeCode,

                        title:
                          data.template!
                            .title,

                        version:
                          data.template!
                            .version,

                        isActive:
                          data.template!
                            .isActive,
                      },
                    },
                  };
                },
              ),
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load template.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      locale,
      selectedProcedureId,
    ]);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  function flashSuccess(
    message: string,
  ) {
    setSuccess(message);

    window.setTimeout(
      () => setSuccess(null),
      2500,
    );
  }

  async function createTemplate() {
    if (!selectedProcedure) return;

    setSaving(true);
    setError(null);

    try {
      await api(
        "/api/admin/post-op/templates",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            procedureId:
              selectedProcedure.id,

            localeCode: locale,

            title: `${
              selectedProcedure.names[
                locale
              ]
            } Recovery`,

            description: "",
          }),
        },
      );

      await loadTemplate();

      flashSuccess(
        "Draft template created.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create template.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveTemplate() {
    if (!template) return;

    setSaving(true);
    setError(null);

    try {
      await api(
        `/api/admin/post-op/templates/${template.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title:
              template.title,

            description:
              template.description,
          }),
        },
      );

      await loadTemplate();

      flashSuccess(
        "Template saved.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save template.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishTemplate() {
    if (!template) return;

    setSaving(true);
    setError(null);

    try {
      await api(
        `/api/admin/post-op/templates/${template.id}/publish`,
        {
          method: "POST",
        },
      );

      await loadTemplate();

      flashSuccess(
        "Template published.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish template.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4945A]">
              Admin
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#283C5D]">
              PostOp Templates
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Configure the default
              recovery experience for
              each procedure.
            </p>
          </div>

          <div className="flex rounded-xl border border-[#283C5D]/10 bg-white p-1">
            {(
              [
                "en",
                "fr",
              ] as Locale[]
            ).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setLocale(item);
                  setPreview(false);
                }}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  locale === item
                    ? "bg-[#283C5D] text-white"
                    : "text-[#283C5D]"
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={() =>
                setError(null)
              }
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <Check className="size-4" />
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* PROCEDURES */}

          <aside className="overflow-hidden rounded-[1.5rem] border border-[#283C5D]/10 bg-white">
            <div className="border-b border-neutral-100 p-4">
              <p className="font-semibold text-[#283C5D]">
                Procedures
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                {procedures.length}{" "}
                available
              </p>
            </div>

            <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-2">
              {procedures.map(
                (procedure) => {
                  const status =
                    statusFor(
                      procedure,
                      locale,
                    );

                  const selected =
                    procedure.id ===
                    selectedProcedureId;

                  return (
                    <button
                      key={procedure.id}
                      onClick={() =>
                        setSelectedProcedureId(
                          procedure.id,
                        )
                      }
                      className={`mb-1 w-full rounded-xl p-3 text-left transition ${
                        selected
                          ? "bg-[#283C5D]/5"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      <p className="text-sm font-medium text-[#283C5D]">
                        {
                          procedure
                            .names[
                            locale
                          ]
                        }
                      </p>

                      <div className="mt-2">
                        <StatusBadge
                          status={
                            status
                          }
                        />
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </aside>

          {/* EDITOR */}

          <section className="min-w-0">
            {loading ? (
              <div className="flex min-h-96 items-center justify-center rounded-[1.5rem] border border-[#283C5D]/10 bg-white">
                <Loader2 className="size-6 animate-spin text-[#283C5D]" />
              </div>
            ) : !template ? (
              <div className="flex min-h-96 flex-col items-center justify-center rounded-[1.5rem] border border-[#283C5D]/10 bg-white p-8 text-center">
                <FilePlus2 className="size-10 text-[#D8BD8D]" />

                <h2 className="mt-5 text-xl font-semibold text-[#283C5D]">
                  No{" "}
                  {locale.toUpperCase()}{" "}
                  template
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  Create an independent
                  template for this
                  procedure and locale.
                </p>

                <div className="mt-6">
                  <Button
                    disabled={saving}
                    onClick={
                      createTemplate
                    }
                  >
                    <Plus className="size-4" />
                    Create template
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[#283C5D]/10 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={
                        template.isActive
                          ? "CONFIGURED"
                          : "DRAFT"
                      }
                    />

                    <span className="text-xs text-neutral-400">
                      Version{" "}
                      {template.version}
                    </span>

                    <span className="text-xs font-semibold text-[#B4945A]">
                      {locale.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setPreview(
                          (value) =>
                            !value,
                        )
                      }
                    >
                      {preview ? (
                        <>
                          <ArrowLeft className="size-4" />
                          Editor
                        </>
                      ) : (
                        <>
                          <Eye className="size-4" />
                          Patient preview
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={
                        saveTemplate
                      }
                      disabled={saving}
                    >
                      <Save className="size-4" />
                      Save
                    </Button>

                    <Button
                      onClick={
                        publishTemplate
                      }
                      disabled={saving}
                    >
                      Publish
                    </Button>
                  </div>
                </div>

                {preview ? (
                  <PostOpTemplatePreview
                    template={
                      template
                    }
                  />
                ) : (
                  <TemplateEditor
                    template={
                      template
                    }
                    setTemplate={
                      setTemplate
                    }
                    refresh={
                      loadTemplate
                    }
                    reportError={
                      setError
                    }
                    reportSuccess={
                      flashSuccess
                    }
                  />
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE EDITOR
═══════════════════════════════════════════════════════════════ */

function TemplateEditor({
  template,
  setTemplate,
  refresh,
  reportError,
  reportSuccess,
}: {
  template: PostOpTemplateDto;

  setTemplate: React.Dispatch<
    React.SetStateAction<PostOpTemplateDto | null>
  >;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;

  reportSuccess: (
    message: string,
  ) => void;
}) {
  async function addStep() {
    try {
      await api(
        `/api/admin/post-op/templates/${template.id}/steps`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: `Step ${
              template.steps.length + 1
            }`,

            description: "",

            startsAfterHours: 0,

            /*
             * New steps default to MANUAL so
             * they can be created before timing
             * has been configured.
             */
            completesAfterHours:
              null,

            completionMode:
              "MANUAL",
          }),
        },
      );

      await refresh();

      reportSuccess(
        "Step added.",
      );
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to add step.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-[#283C5D]/10 bg-white p-5 md:p-6">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Template title
        </label>

        <input
          value={template.title}
          onChange={(event) =>
            setTemplate(
              (current) =>
                current
                  ? {
                      ...current,

                      title:
                        event.target
                          .value,
                    }
                  : current,
            )
          }
          className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-[#283C5D] outline-none focus:border-[#D8BD8D]"
        />

        <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Description
        </label>

        <textarea
          value={
            template.description ??
            ""
          }
          onChange={(event) =>
            setTemplate(
              (current) =>
                current
                  ? {
                      ...current,

                      description:
                        event.target
                          .value,
                    }
                  : current,
            )
          }
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#D8BD8D]"
        />
      </div>

      {/* GLOBAL REMINDERS */}

      <ReminderSection
        templateId={template.id}
        reminders={
          template.reminders
        }
        stepId={null}
        refresh={refresh}
        reportError={
          reportError
        }
      />

      {/* STEPS */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[#283C5D]">
            Recovery steps
          </h2>

          <p className="mt-1 text-xs text-neutral-400">
            {template.steps.length}{" "}
            steps
          </p>
        </div>

        <Button onClick={addStep}>
          <Plus className="size-4" />
          Add step
        </Button>
      </div>

      {template.steps.map(
        (step, index) => (
          <StepEditor
            key={step.id}
            templateId={
              template.id
            }
            step={step}
            index={index}
            total={
              template.steps.length
            }
            previous={
              template.steps[
                index - 1
              ] ?? null
            }
            next={
              template.steps[
                index + 1
              ] ?? null
            }
            refresh={refresh}
            reportError={
              reportError
            }
          />
        ),
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP
═══════════════════════════════════════════════════════════════ */

function StepEditor({
  templateId,
  step,
  index,
  total,
  previous,
  next,
  refresh,
  reportError,
}: {
  templateId: string;
  step: PostOpStepDto;
  index: number;
  total: number;

  previous: PostOpStepDto | null;
  next: PostOpStepDto | null;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;
}) {
  const [form, setForm] =
    useState(step);

  useEffect(() => {
    setForm(step);
  }, [step]);

  async function save() {
    try {
      await api(
        `/api/admin/post-op/templates/${templateId}/steps/${step.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: form.title,

            description:
              form.description,

            startsAfterHours:
              Number(
                form.startsAfterHours,
              ),

            completesAfterHours:
              form.completionMode ===
                "TIME_BASED"
                ? Number(
                    form.completesAfterHours,
                  )
                : form.completesAfterHours,

            completionMode:
              form.completionMode,

            sortOrder:
              form.sortOrder,
          }),
        },
      );

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to save step.",
      );
    }
  }

  async function remove() {
    if (
      !window.confirm(
        "Delete this recovery step?",
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/admin/post-op/templates/${templateId}/steps/${step.id}`,
        {
          method: "DELETE",
        },
      );

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to delete step.",
      );
    }
  }

  async function swap(
    other: PostOpStepDto | null,
  ) {
    if (!other) return;

    try {
      await Promise.all([
        api(
          `/api/admin/post-op/templates/${templateId}/steps/${step.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sortOrder:
                other.sortOrder,
            }),
          },
        ),

        api(
          `/api/admin/post-op/templates/${templateId}/steps/${other.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sortOrder:
                step.sortOrder,
            }),
          },
        ),
      ]);

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to reorder steps.",
      );
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-[#283C5D]/10 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 p-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#283C5D] text-xs font-semibold text-white">
            {index + 1}
          </div>

          <div>
            <p className="font-semibold text-[#283C5D]">
              {form.title}
            </p>

            <p className="text-xs text-neutral-400">
              {form.completionMode}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            disabled={index === 0}
            onClick={() =>
              swap(previous)
            }
            className="rounded-lg p-2 hover:bg-neutral-100 disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </button>

          <button
            disabled={
              index === total - 1
            }
            onClick={() =>
              swap(next)
            }
            className="rounded-lg p-2 hover:bg-neutral-100 disabled:opacity-30"
          >
            <ArrowDown className="size-4" />
          </button>

          <button
            onClick={remove}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,

                title:
                  event.target.value,
              })
            }
            placeholder="Step title"
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
          />

          <select
            value={
              form.completionMode
            }
            onChange={(event) =>
              setForm({
                ...form,

                completionMode:
                  event.target
                    .value as
                    | "TIME_BASED"
                    | "MANUAL",
              })
            }
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
          >
            <option value="TIME_BASED">
              Time based
            </option>

            <option value="MANUAL">
              Manual
            </option>
          </select>
        </div>

        <textarea
          value={
            form.description ?? ""
          }
          onChange={(event) =>
            setForm({
              ...form,

              description:
                event.target.value,
            })
          }
          placeholder="Step description"
          rows={3}
          className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-medium text-neutral-500">
            Starts after hours

            <input
              type="number"
              min={0}
              value={
                form.startsAfterHours
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  startsAfterHours:
                    Number(
                      event.target
                        .value,
                    ),
                })
              }
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            />
          </label>

          <label className="text-xs font-medium text-neutral-500">
            Completes after hours

            <input
              type="number"
              min={0}
              disabled={
                form.completionMode ===
                "MANUAL"
              }
              value={
                form.completesAfterHours ??
                ""
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  completesAfterHours:
                    event.target.value
                      ? Number(
                          event.target
                            .value,
                        )
                      : null,
                })
              }
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm disabled:bg-neutral-50"
            />
          </label>
        </div>

        <Button
          variant="secondary"
          onClick={save}
        >
          <Save className="size-4" />
          Save step
        </Button>

        <BlockSection
          templateId={templateId}
          step={step}
          refresh={refresh}
          reportError={
            reportError
          }
        />

        <ReminderSection
          templateId={templateId}
          stepId={step.id}
          reminders={
            step.reminders
          }
          refresh={refresh}
          reportError={
            reportError
          }
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCKS
═══════════════════════════════════════════════════════════════ */

function BlockSection({
  templateId,
  step,
  refresh,
  reportError,
}: {
  templateId: string;
  step: PostOpStepDto;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;
}) {
  const [
    newType,
    setNewType,
  ] =
    useState<PostOpBlockDto["type"]>(
      "TEXT",
    );

  async function addBlock() {
    try {
      const body: Record<
        string,
        unknown
      > = {
        type: newType,
      };

      if (newType === "TEXT") {
        body.text =
          "New recovery instruction";
      }

      if (newType === "VIDEO") {
        body.externalUrl =
          "https://www.youtube.com/watch?v=";

        body.mediaAlt =
          "Recovery video";
      }

      if (newType === "BOOKING") {
        body.bookingType =
          "EITHER";

        body.buttonLabel =
          "Book your follow-up";
      }

      /*
       * IMAGE blocks are created through
       * the upload UI below instead.
       */
      if (newType === "IMAGE") {
        return;
      }

      await api(
        `/api/admin/post-op/templates/${templateId}/steps/${step.id}/blocks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        },
      );

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to add block.",
      );
    }
  }

  return (
    <div className="border-t border-neutral-100 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-[#283C5D]">
            Content
          </p>

          <p className="text-xs text-neutral-400">
            Text, images, videos
            and booking actions
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={newType}
            onChange={(event) =>
              setNewType(
                event.target
                  .value as PostOpBlockDto["type"],
              )
            }
            className="rounded-xl border border-neutral-200 bg-white px-3 text-sm"
          >
            <option value="TEXT">
              Text
            </option>

            <option value="IMAGE">
              Image
            </option>

            <option value="VIDEO">
              Video
            </option>

            <option value="BOOKING">
              Booking
            </option>
          </select>

          {newType === "IMAGE" ? (
            <ImageUploadButton
              templateId={
                templateId
              }
              stepId={step.id}
              refresh={refresh}
              reportError={
                reportError
              }
            />
          ) : (
            <Button
              variant="secondary"
              onClick={addBlock}
            >
              <Plus className="size-4" />
              Add
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {step.blocks.map(
          (block, index) => (
            <BlockEditor
              key={block.id}
              templateId={
                templateId
              }
              stepId={step.id}
              block={block}
              previous={
                step.blocks[
                  index - 1
                ] ?? null
              }
              next={
                step.blocks[
                  index + 1
                ] ?? null
              }
              refresh={refresh}
              reportError={
                reportError
              }
            />
          ),
        )}
      </div>
    </div>
  );
}

function BlockEditor({
  templateId,
  stepId,
  block,
  previous,
  next,
  refresh,
  reportError,
}: {
  templateId: string;
  stepId: string;

  block: PostOpBlockDto;

  previous:
    | PostOpBlockDto
    | null;

  next:
    | PostOpBlockDto
    | null;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;
}) {
  const [form, setForm] =
    useState(block);

  useEffect(() => {
    setForm(block);
  }, [block]);

  const endpoint =
    `/api/admin/post-op/templates/${templateId}/steps/${stepId}/blocks/${block.id}`;

  async function save() {
    try {
      await api(endpoint, {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          type: form.type,

          text: form.text,

          objectPath:
            form.objectPath,

          externalUrl:
            form.externalUrl,

          mediaAlt:
            form.mediaAlt,

          bookingType:
            form.bookingType,

          bookingUrl:
            form.bookingUrl,

          buttonLabel:
            form.buttonLabel,

          sortOrder:
            form.sortOrder,
        }),
      });

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to save block.",
      );
    }
  }

  async function remove() {
    try {
      await api(endpoint, {
        method: "DELETE",
      });

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to delete block.",
      );
    }
  }

  async function swap(
    other: PostOpBlockDto | null,
  ) {
    if (!other) return;

    try {
      await Promise.all([
        api(endpoint, {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            sortOrder:
              other.sortOrder,
          }),
        }),

        api(
          `/api/admin/post-op/templates/${templateId}/steps/${stepId}/blocks/${other.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sortOrder:
                block.sortOrder,
            }),
          },
        ),
      ]);

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to reorder block.",
      );
    }
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="mb-3 flex justify-between">
        <span className="text-xs font-semibold text-[#B4945A]">
          {block.type}
        </span>

        <div className="flex">
          <button
            onClick={() =>
              swap(previous)
            }
            disabled={!previous}
            className="p-1.5 disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </button>

          <button
            onClick={() =>
              swap(next)
            }
            disabled={!next}
            className="p-1.5 disabled:opacity-30"
          >
            <ArrowDown className="size-4" />
          </button>

          <button
            onClick={remove}
            className="p-1.5 text-red-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {block.type === "TEXT" && (
        <textarea
          value={form.text ?? ""}
          onChange={(event) =>
            setForm({
              ...form,

              text:
                event.target.value,
            })
          }
          rows={4}
          className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
        />
      )}

      {block.type === "IMAGE" && (
        <>
          <input
            value={
              form.mediaAlt ?? ""
            }
            onChange={(event) =>
              setForm({
                ...form,

                mediaAlt:
                  event.target.value,
              })
            }
            placeholder="Image description"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />

          <p className="mt-2 truncate text-xs text-neutral-400">
            {form.objectPath}
          </p>
        </>
      )}

      {block.type === "VIDEO" && (
        <div className="space-y-2">
          <input
            value={
              form.externalUrl ??
              ""
            }
            onChange={(event) =>
              setForm({
                ...form,

                externalUrl:
                  event.target.value,
              })
            }
            placeholder="Video URL"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />

          <input
            value={
              form.mediaAlt ?? ""
            }
            onChange={(event) =>
              setForm({
                ...form,

                mediaAlt:
                  event.target.value,
              })
            }
            placeholder="Video title"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
        </div>
      )}

      {block.type ===
        "BOOKING" && (
        <div className="grid gap-2 md:grid-cols-2">
          <select
            value={
              form.bookingType ??
              "EITHER"
            }
            onChange={(event) =>
              setForm({
                ...form,

                bookingType:
                  event.target
                    .value as
                    | "IN_CLINIC"
                    | "ONLINE"
                    | "EITHER",
              })
            }
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          >
            <option value="IN_CLINIC">
              In clinic
            </option>

            <option value="ONLINE">
              Online
            </option>

            <option value="EITHER">
              Either
            </option>
          </select>

          <input
            value={
              form.buttonLabel ??
              ""
            }
            onChange={(event) =>
              setForm({
                ...form,

                buttonLabel:
                  event.target.value,
              })
            }
            placeholder="Button label"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />

          <input
            value={
              form.bookingUrl ?? ""
            }
            onChange={(event) =>
              setForm({
                ...form,

                bookingUrl:
                  event.target.value,
              })
            }
            placeholder="Optional booking URL"
            className="md:col-span-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
        </div>
      )}

      <div className="mt-3">
        <Button
          variant="secondary"
          onClick={save}
        >
          <Save className="size-4" />
          Save block
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE UPLOAD
═══════════════════════════════════════════════════════════════ */

function ImageUploadButton({
  templateId,
  stepId,
  refresh,
  reportError,
}: {
  templateId: string;
  stepId: string;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;
}) {
  const [uploading, setUploading] =
    useState(false);

  async function upload(
    file: File,
  ) {
    setUploading(true);

    try {
      const signed = await api<{
        uploadUrl: string;
        objectPath: string;
        publicUrl: string | null;
      }>("/images/upload-url", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          contentType:
            file.type,

          access: "public",

          folder: `post-op/templates/${templateId}`,
        }),
      });

      const uploadResponse =
        await fetch(
          signed.uploadUrl,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                file.type,
            },

            body: file,
          },
        );

      if (!uploadResponse.ok) {
        throw new Error(
          "Image upload failed.",
        );
      }

      await api(
        `/api/admin/post-op/templates/${templateId}/steps/${stepId}/blocks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            type: "IMAGE",

            objectPath:
              signed.objectPath,

            /*
             * Store the public instruction
             * asset URL for rendering.
             */
            externalUrl:
              signed.publicUrl,

            mediaAlt:
              file.name,
          }),
        },
      );

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Image upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#283C5D]/10 bg-white px-3.5 py-2.5 text-sm font-medium text-[#283C5D]">
      {uploading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ImageIcon className="size-4" />
      )}

      Add image

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        className="hidden"
        onChange={(event) => {
          const file =
            event.target.files?.[0];

          if (file) {
            void upload(file);
          }

          event.target.value = "";
        }}
      />
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REMINDERS
═══════════════════════════════════════════════════════════════ */

function ReminderSection({
  templateId,
  stepId,
  reminders,
  refresh,
  reportError,
}: {
  templateId: string;

  stepId: string | null;

  reminders: PostOpReminderDto[];

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;
}) {
  async function addReminder() {
    try {
      await api(
        `/api/admin/post-op/templates/${templateId}/reminders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            stepId,

            type: "GENERAL",

            text:
              "New reminder",

            startsAfterHours: 0,

            endsAfterHours:
              null,

            notificationsEnabled:
              false,

            repeatEveryHours:
              null,

            isPinned: true,
          }),
        },
      );

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to add reminder.",
      );
    }
  }

  return (
    <div className="border-t border-neutral-100 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[#283C5D]">
            {stepId
              ? "Step reminders"
              : "Global reminders"}
          </p>

          <p className="text-xs text-neutral-400">
            {stepId
              ? "Only shown during this recovery step"
              : "Applies across the PostOp"}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={addReminder}
        >
          <Plus className="size-4" />
          Reminder
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {reminders.map(
          (reminder, index) => (
            <ReminderEditor
              key={reminder.id}
              templateId={
                templateId
              }
              reminder={
                reminder
              }
              previous={
                reminders[
                  index - 1
                ] ?? null
              }
              next={
                reminders[
                  index + 1
                ] ?? null
              }
              refresh={refresh}
              reportError={
                reportError
              }
            />
          ),
        )}
      </div>
    </div>
  );
}

function ReminderEditor({
  templateId,
  reminder,
  previous,
  next,
  refresh,
  reportError,
}: {
  templateId: string;

  reminder: PostOpReminderDto;

  previous:
    | PostOpReminderDto
    | null;

  next:
    | PostOpReminderDto
    | null;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;
}) {
  const [form, setForm] =
    useState(reminder);

  useEffect(() => {
    setForm(reminder);
  }, [reminder]);

  const endpoint =
    `/api/admin/post-op/templates/${templateId}/reminders/${reminder.id}`;

  async function save() {
    try {
      await api(endpoint, {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          form,
        ),
      });

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to save reminder.",
      );
    }
  }

  async function remove() {
    try {
      await api(endpoint, {
        method: "DELETE",
      });

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to remove reminder.",
      );
    }
  }

  async function swap(
    other:
      | PostOpReminderDto
      | null,
  ) {
    if (!other) return;

    try {
      await Promise.all([
        api(endpoint, {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            sortOrder:
              other.sortOrder,
          }),
        }),

        api(
          `/api/admin/post-op/templates/${templateId}/reminders/${other.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sortOrder:
                reminder.sortOrder,
            }),
          },
        ),
      ]);

      await refresh();
    } catch (err) {
      reportError(
        err instanceof Error
          ? err.message
          : "Failed to reorder reminders.",
      );
    }
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="grid gap-3 md:grid-cols-[130px_minmax(0,1fr)_auto]">
        <select
          value={form.type}
          onChange={(event) =>
            setForm({
              ...form,

              type:
                event.target
                  .value as PostOpReminderDto["type"],
            })
          }
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="DO">
            Do
          </option>

          <option value="DONT">
            Don't
          </option>

          <option value="GENERAL">
            General
          </option>
        </select>

        <input
          value={form.text}
          onChange={(event) =>
            setForm({
              ...form,

              text:
                event.target.value,
            })
          }
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm"
        />

        <div className="flex">
          <button
            disabled={!previous}
            onClick={() =>
              swap(previous)
            }
            className="p-2 disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </button>

          <button
            disabled={!next}
            onClick={() =>
              swap(next)
            }
            className="p-2 disabled:opacity-30"
          >
            <ArrowDown className="size-4" />
          </button>

          <button
            onClick={remove}
            className="p-2 text-red-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-xs text-neutral-500">
          Starts after hours

          <input
            type="number"
            min={0}
            value={
              form.startsAfterHours
            }
            onChange={(event) =>
              setForm({
                ...form,

                startsAfterHours:
                  Number(
                    event.target
                      .value,
                  ),
              })
            }
            className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
          />
        </label>

        <label className="text-xs text-neutral-500">
          Ends after hours

          <input
            type="number"
            min={0}
            value={
              form.endsAfterHours ??
              ""
            }
            onChange={(event) =>
              setForm({
                ...form,

                endsAfterHours:
                  event.target.value
                    ? Number(
                        event.target
                          .value,
                      )
                    : null,
              })
            }
            className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
          />
        </label>

        <label className="text-xs text-neutral-500">
          Repeat every hours

          <input
            type="number"
            min={1}
            disabled={
              !form.notificationsEnabled
            }
            value={
              form.repeatEveryHours ??
              ""
            }
            onChange={(event) =>
              setForm({
                ...form,

                repeatEveryHours:
                  event.target.value
                    ? Number(
                        event.target
                          .value,
                      )
                    : null,
              })
            }
            className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 disabled:bg-neutral-100"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={
              form.isPinned
            }
            onChange={(event) =>
              setForm({
                ...form,

                isPinned:
                  event.target
                    .checked,
              })
            }
          />

          Pinned
        </label>

        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={
              form.notificationsEnabled
            }
            onChange={(event) =>
              setForm({
                ...form,

                notificationsEnabled:
                  event.target
                    .checked,

                repeatEveryHours:
                  event.target
                    .checked
                    ? form.repeatEveryHours
                    : null,
              })
            }
          />

          Notifications
        </label>

        <Button
          variant="secondary"
          onClick={save}
        >
          <Save className="size-4" />
          Save reminder
        </Button>
      </div>
    </div>
  );
}