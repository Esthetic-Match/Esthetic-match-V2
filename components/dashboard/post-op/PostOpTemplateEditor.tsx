/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Bell,
  BellRing,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  Clock3,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Pencil,
  Pin,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useTranslations } from "next-intl";

import PostOpMediaUploader from "@/components/dashboard/post-op/PostOpMediaUploader";

import {
  type PostOpBlockDto,
  type PostOpReminderDto,
  type PostOpStepDto,
  type PostOpTemplateDto,
} from "@/components/dashboard/post-op/PostOpTemplatePreview";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

type Props = {
  template: PostOpTemplateDto;

  setTemplate: Dispatch<
    SetStateAction<PostOpTemplateDto | null>
  >;

  apiBase: string;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;

  reportSuccess: (
    message: string,
  ) => void;
};

type EditorSection =
  | "DETAILS"
  | "GLOBAL_REMINDERS"
  | string;

type ContentType =
  PostOpBlockDto["type"];

type BookingType =
  | "IN_CLINIC"
  | "ONLINE"
  | "EITHER";

type ReminderType =
  | "DO"
  | "DONT"
  | "GENERAL";

/* ═══════════════════════════════════════════════════════════════
   API
═══════════════════════════════════════════════════════════════ */

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
   MAIN EDITOR
═══════════════════════════════════════════════════════════════ */

export default function PostOpTemplateEditor({
  template,
  setTemplate,
  apiBase,
  refresh,
  reportError,
  reportSuccess,
}: Props) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<EditorSection>(
      template.steps[0]?.id ??
        "DETAILS",
    );

  const [addingStep, setAddingStep] =
    useState(false);

  const sortedSteps =
    useMemo(
      () =>
        [...template.steps].sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder,
        ),
      [template.steps],
    );

  const activeStep =
    useMemo(
      () =>
        sortedSteps.find(
          (step) =>
            step.id ===
            activeSection,
        ) ?? null,
      [
        activeSection,
        sortedSteps,
      ],
    );

  useEffect(() => {
    if (
      activeSection ===
        "DETAILS" ||
      activeSection ===
        "GLOBAL_REMINDERS"
    ) {
      return;
    }

    const exists =
      template.steps.some(
        (step) =>
          step.id ===
          activeSection,
      );

    if (!exists) {
      setActiveSection(
        template.steps[0]?.id ??
          "DETAILS",
      );
    }
  }, [
    activeSection,
    template.steps,
  ]);

  async function addStep() {
    setAddingStep(true);
    reportError(null);

    try {
      const result =
        await api<{
          step: PostOpStepDto;
        }>(
          `${apiBase}/steps`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title: t(
                  "newStepTitle",
                  {
                    number:
                      template.steps
                        .length +
                      1,
                  },
                ),

                description: "",

                startsAfterHours:
                  0,

                completesAfterHours:
                  null,

                completionMode:
                  "MANUAL",
              }),
          },
        );

      await refresh();

      setActiveSection(
        result.step.id,
      );

      reportSuccess(
        t(
          "messages.stepAdded",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.addStep",
            ),
      );
    } finally {
      setAddingStep(false);
    }
  }

  return (
    <div className="grid min-h-[680px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ═══════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════ */}

      <aside className="min-w-0">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#283C5D]/10 bg-white shadow-[0_18px_55px_rgba(40,60,93,0.05)] lg:sticky lg:top-6">
          <div className="border-b border-[#283C5D]/[0.07] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#283C5D] text-white">
                <Sparkles className="size-4" />
              </div>

              <div>
                <p className="font-semibold text-[#283C5D]">
                  {t(
                    "journeyTitle",
                  )}
                </p>

                <p className="mt-0.5 text-xs text-neutral-400">
                  {t(
                    "journeySubtitle",
                    {
                      count:
                        sortedSteps.length,
                    },
                  )}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible">
            <NavigationButton
              active={
                activeSection ===
                "DETAILS"
              }
              icon={
                <Settings2 className="size-4" />
              }
              title={t(
                "details",
              )}
              subtitle={t(
                "detailsSubtitle",
              )}
              onClick={() =>
                setActiveSection(
                  "DETAILS",
                )
              }
            />

            <NavigationButton
              active={
                activeSection ===
                "GLOBAL_REMINDERS"
              }
              icon={
                <BellRing className="size-4" />
              }
              title={t(
                "globalReminders",
              )}
              subtitle={t(
                "reminderCount",
                {
                  count:
                    template
                      .reminders
                      .length,
                },
              )}
              onClick={() =>
                setActiveSection(
                  "GLOBAL_REMINDERS",
                )
              }
            />

            <div className="hidden px-3 pb-2 pt-4 lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {t(
                  "recoverySteps",
                )}
              </p>
            </div>

            {sortedSteps.map(
              (
                step,
                index,
              ) => (
                <StepNavigationButton
                  key={step.id}
                  step={
                    step
                  }
                  index={
                    index
                  }
                  active={
                    activeSection ===
                    step.id
                  }
                  onClick={() =>
                    setActiveSection(
                      step.id,
                    )
                  }
                />
              ),
            )}

            <button
              type="button"
              onClick={addStep}
              disabled={
                addingStep
              }
              className="mt-2 flex min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D8BD8D] px-4 py-3 text-sm font-medium text-[#9B7944] transition hover:border-[#B4945A] hover:bg-[#D8BD8D]/10 disabled:opacity-50 lg:w-full"
            >
              {addingStep ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}

              {t(
                "addStep",
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* ═══════════════════════════════════
          EDITOR WORKSPACE
      ═══════════════════════════════════ */}

      <section className="min-w-0">
        {activeSection ===
          "DETAILS" && (
          <TemplateDetailsPanel
            template={
              template
            }
            setTemplate={
              setTemplate
            }
            apiBase={
              apiBase
            }
            refresh={
              refresh
            }
            reportError={
              reportError
            }
            reportSuccess={
              reportSuccess
            }
          />
        )}

        {activeSection ===
          "GLOBAL_REMINDERS" && (
          <ReminderPanel
            apiBase={
              apiBase
            }
            stepId={
              null
            }
            reminders={
              template.reminders
            }
            global
            refresh={
              refresh
            }
            reportError={
              reportError
            }
            reportSuccess={
              reportSuccess
            }
          />
        )}

        {activeStep && (
          <StepWorkspace
            key={
              activeStep.id
            }
            templateId={template.id}
            apiBase={
              apiBase
            }
            step={
              activeStep
            }
            steps={
              sortedSteps
            }
            refresh={
              refresh
            }
            reportError={
              reportError
            }
            reportSuccess={
              reportSuccess
            }
            onDeleted={() => {
              const currentIndex =
                sortedSteps.findIndex(
                  (item) =>
                    item.id ===
                    activeStep.id,
                );

              const fallback =
                sortedSteps[
                  currentIndex +
                    1
                ] ??
                sortedSteps[
                  currentIndex -
                    1
                ];

              setActiveSection(
                fallback?.id ??
                  "DETAILS",
              );
            }}
          />
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */

function NavigationButton({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[180px] items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition lg:w-full ${
        active
          ? "bg-[#283C5D] text-white shadow-[0_10px_25px_rgba(40,60,93,0.15)]"
          : "text-[#283C5D] hover:bg-[#283C5D]/[0.045]"
      }`}
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
        active
          ? "bg-white/10"
          : "bg-[#283C5D]/[0.06]"
      }`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {title}
        </p>

        <p className={`mt-0.5 truncate text-[11px] ${
          active
            ? "text-white/55"
            : "text-neutral-400"
        }`}>
          {subtitle}
        </p>
      </div>

      <ChevronRight
        className={`hidden size-4 shrink-0 lg:block ${
          active
            ? "text-white/50"
            : "text-neutral-300"
        }`}
      />
    </button>
  );
}

function StepNavigationButton({
  step,
  index,
  active,
  onClick,
}: {
  step: PostOpStepDto;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex min-w-[200px] items-center gap-3 rounded-2xl px-3 py-3 text-left transition lg:w-full ${
        active
          ? "bg-[#F5F0E7]"
          : "hover:bg-[#FAF9F7]"
      }`}
    >
      <div className="relative shrink-0">
        <div className={`flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition ${
          active
            ? "border-[#D8BD8D] bg-[#283C5D] text-white"
            : "border-[#283C5D]/10 bg-white text-[#283C5D]"
        }`}>
          {index + 1}
        </div>

        <div className="absolute bottom-[-15px] left-1/2 hidden h-4 w-px -translate-x-1/2 bg-[#283C5D]/10 lg:block" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#283C5D]">
          {step.title}
        </p>

        <p className="mt-1 truncate text-[11px] text-neutral-400">
          {t(
            "stepSummary",
            {
              blocks:
                step.blocks.length,
              reminders:
                step.reminders
                  .length,
            },
          )}
        </p>
      </div>

      {active && (
        <div className="size-2 rounded-full bg-[#B4945A]" />
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE DETAILS
═══════════════════════════════════════════════════════════════ */

function TemplateDetailsPanel({
  template,
  setTemplate,
  apiBase,
  refresh,
  reportError,
  reportSuccess,
}: {
  template: PostOpTemplateDto;

  setTemplate: Dispatch<
    SetStateAction<PostOpTemplateDto | null>
  >;

  apiBase: string;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;

  reportSuccess: (
    message: string,
  ) => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  const [saving, setSaving] =
    useState(false);

  async function save() {
    setSaving(true);
    reportError(null);

    try {
      await api(
        apiBase,
        {
          method: "PATCH",

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

      await refresh();

      reportSuccess(
        t(
          "messages.detailsSaved",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.saveDetails",
            ),
      );
    } finally {
      setSaving(false);
    }
  }

  const contentBlocks =
    template.steps.reduce(
      (
        count,
        step,
      ) =>
        count +
        step.blocks.length,
      0,
    );

  return (
    <div className="space-y-5">
      <EditorHero
        icon={
          <Settings2 className="size-5" />
        }
        eyebrow={t(
          "planDetails",
        )}
        title={t(
          "planDetailsTitle",
        )}
        description={t(
          "planDetailsDescription",
        )}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          value={
            template.steps
              .length
          }
          label={t(
            "steps",
          )}
        />

        <MetricCard
          value={
            contentBlocks
          }
          label={t(
            "contentBlocks",
          )}
        />

        <MetricCard
          value={
            template.reminders
              .length
          }
          label={t(
            "globalReminders",
          )}
        />
      </div>

      <Card>
        <div className="grid gap-6">
          <Field>
            <FieldLabel>
              {t(
                "templateTitle",
              )}
            </FieldLabel>

            <input
              value={
                template.title
              }
              onChange={(
                event,
              ) =>
                setTemplate(
                  (
                    current,
                  ) =>
                    current
                      ? {
                          ...current,

                          title:
                            event
                              .target
                              .value,
                        }
                      : current,
                )
              }
              className={inputClass}
            />

            <FieldHelp>
              {t(
                "templateTitleHelp",
              )}
            </FieldHelp>
          </Field>

          <Field>
            <FieldLabel>
              {t(
                "description",
              )}
            </FieldLabel>

            <textarea
              value={
                template.description ??
                ""
              }
              onChange={(
                event,
              ) =>
                setTemplate(
                  (
                    current,
                  ) =>
                    current
                      ? {
                          ...current,

                          description:
                            event
                              .target
                              .value,
                        }
                      : current,
                )
              }
              rows={5}
              className={`${inputClass} resize-none`}
            />

            <FieldHelp>
              {t(
                "descriptionHelp",
              )}
            </FieldHelp>
          </Field>

          <div className="flex justify-end">
            <PrimaryButton
              onClick={
                save
              }
              disabled={
                saving
              }
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}

              {t(
                "saveChanges",
              )}
            </PrimaryButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP WORKSPACE
═══════════════════════════════════════════════════════════════ */

function StepWorkspace({
    templateId,
  apiBase,
  step,
  steps,
  refresh,
  reportError,
  reportSuccess,
  onDeleted,
}: {
    templateId: string;
  apiBase: string;

  step: PostOpStepDto;

  steps: PostOpStepDto[];

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;

  reportSuccess: (
    message: string,
  ) => void;

  onDeleted: () => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  const [form, setForm] =
    useState(step);

  const [saving, setSaving] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] =
    useState(false);

  useEffect(() => {
    setForm(step);
  }, [step]);

  const index =
    steps.findIndex(
      (item) =>
        item.id ===
        step.id,
    );

  const previous =
    steps[index - 1] ??
    null;

  const next =
    steps[index + 1] ??
    null;

  async function saveStep() {
    setSaving(true);
    reportError(null);

    try {
      await api(
        `${apiBase}/steps/${step.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              title:
                form.title,

              description:
                form.description,

              startsAfterHours:
                Number(
                  form.startsAfterHours,
                ),

              completesAfterHours:
                form.completionMode ===
                "TIME_BASED"
                  ? form.completesAfterHours ===
                    null
                    ? null
                    : Number(
                        form.completesAfterHours,
                      )
                  : null,

              completionMode:
                form.completionMode,

              sortOrder:
                form.sortOrder,
            }),
        },
      );

      await refresh();

      reportSuccess(
        t(
          "messages.stepSaved",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.saveStep",
            ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function move(
    other:
      | PostOpStepDto
      | null,
  ) {
    if (!other) {
      return;
    }

    reportError(null);

    try {
      await Promise.all([
        api(
          `${apiBase}/steps/${step.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sortOrder:
                  other.sortOrder,
              }),
          },
        ),

        api(
          `${apiBase}/steps/${other.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sortOrder:
                  step.sortOrder,
              }),
          },
        ),
      ]);

      await refresh();
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.reorderStep",
            ),
      );
    }
  }

  async function remove() {
    setDeleting(true);
    reportError(null);

    try {
      await api(
        `${apiBase}/steps/${step.id}`,
        {
          method:
            "DELETE",
        },
      );

      onDeleted();

      await refresh();

      reportSuccess(
        t(
          "messages.stepDeleted",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.deleteStep",
            ),
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(
        false,
      );
    }
  }

  return (
    <div className="space-y-5">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-[1.75rem] border border-[#283C5D]/10 bg-white p-5 shadow-[0_18px_55px_rgba(40,60,93,0.05)] md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-lg font-semibold text-white shadow-sm">
              {index + 1}
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#B4945A]">
                {t(
                  "recoveryStep",
                  {
                    number:
                      index +
                      1,
                  },
                )}
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#283C5D]">
                {step.title}
              </h2>

              <div className="mt-2 flex flex-wrap gap-2">
                <SmallBadge>
                  <Clock3 className="size-3.5" />
                  {formatHourOffset(
                    step.startsAfterHours,
                    t,
                  )}
                </SmallBadge>

                <SmallBadge>
                  {
                    step.blocks
                      .length
                  }{" "}
                  {t(
                    "blocks",
                  )}
                </SmallBadge>

                <SmallBadge>
                  {
                    step.reminders
                      .length
                  }{" "}
                  {t(
                    "reminders",
                  )}
                </SmallBadge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              title={t(
                "moveUp",
              )}
              disabled={
                !previous
              }
              onClick={() =>
                void move(
                  previous,
                )
              }
            >
              <ChevronUp className="size-4" />
            </IconButton>

            <IconButton
              title={t(
                "moveDown",
              )}
              disabled={
                !next
              }
              onClick={() =>
                void move(
                  next,
                )
              }
            >
              <ChevronDown className="size-4" />
            </IconButton>

            {!confirmDelete ? (
              <DangerIconButton
                title={t(
                  "deleteStep",
                )}
                onClick={() =>
                  setConfirmDelete(
                    true,
                  )
                }
              >
                <Trash2 className="size-4" />
              </DangerIconButton>
            ) : (
              <div className="flex items-center gap-1 rounded-xl border border-red-100 bg-red-50 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmDelete(
                      false,
                    )
                  }
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:bg-white"
                >
                  {t(
                    "cancel",
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void remove()
                  }
                  disabled={
                    deleting
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {deleting && (
                    <Loader2 className="size-3 animate-spin" />
                  )}

                  {t(
                    "delete",
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STEP SETTINGS */}

      <Card>
        <SectionHeader
          icon={
            <Pencil className="size-4" />
          }
          title={t(
            "stepDetails",
          )}
          description={t(
            "stepDetailsDescription",
          )}
        />

        <div className="mt-6 grid gap-5">
          <Field>
            <FieldLabel>
              {t(
                "stepTitle",
              )}
            </FieldLabel>

            <input
              value={
                form.title
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    title:
                      event.target
                        .value,
                  }),
                )
              }
              className={
                inputClass
              }
            />
          </Field>

          <Field>
            <FieldLabel>
              {t(
                "patientInstructions",
              )}
            </FieldLabel>

            <textarea
              value={
                form.description ??
                ""
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    description:
                      event.target
                        .value,
                  }),
                )
              }
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* COMPLETION TYPE */}

          <Field>
            <FieldLabel>
              {t(
                "progression",
              )}
            </FieldLabel>

            <div className="grid gap-2 sm:grid-cols-2">
              <ChoiceCard
                selected={
                  form.completionMode ===
                  "TIME_BASED"
                }
                icon={
                  <Clock3 className="size-5" />
                }
                title={t(
                  "automatic",
                )}
                description={t(
                  "automaticDescription",
                )}
                onClick={() =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      completionMode:
                        "TIME_BASED",
                    }),
                  )
                }
              />

              <ChoiceCard
                selected={
                  form.completionMode ===
                  "MANUAL"
                }
                icon={
                  <Check className="size-5" />
                }
                title={t(
                  "manual",
                )}
                description={t(
                  "manualDescription",
                )}
                onClick={() =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      completionMode:
                        "MANUAL",

                      completesAfterHours:
                        null,
                    }),
                  )
                }
              />
            </div>
          </Field>

          {/* TIMING */}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>
                {t(
                  "startsAfter",
                )}
              </FieldLabel>

              <div className="relative">
                <Clock3 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                <input
                  type="number"
                  min={0}
                  value={
                    form.startsAfterHours
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        startsAfterHours:
                          Number(
                            event
                              .target
                              .value,
                          ),
                      }),
                    )
                  }
                  className={`${inputClass} pl-10 pr-16`}
                />

                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                  {t(
                    "hours",
                  )}
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel>
                {t(
                  "completesAfter",
                )}
              </FieldLabel>

              <div className="relative">
                <Clock3 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

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
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        completesAfterHours:
                          event
                            .target
                            .value
                            ? Number(
                                event
                                  .target
                                  .value,
                              )
                            : null,
                      }),
                    )
                  }
                  placeholder={
                    form.completionMode ===
                    "MANUAL"
                      ? t(
                          "manualCompletion",
                        )
                      : ""
                  }
                  className={`${inputClass} pl-10 pr-16 disabled:bg-neutral-50 disabled:text-neutral-400`}
                />

                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                  {t(
                    "hours",
                  )}
                </span>
              </div>
            </Field>
          </div>

          <div className="flex justify-end">
            <PrimaryButton
              onClick={() =>
                void saveStep()
              }
              disabled={
                saving
              }
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}

              {t(
                "saveStep",
              )}
            </PrimaryButton>
          </div>
        </div>
      </Card>

      {/* CONTENT */}

      <ContentPanel
        templateId={templateId}
        apiBase={
          apiBase
        }
        step={
          step
        }
        refresh={
          refresh
        }
        reportError={
          reportError
        }
        reportSuccess={
          reportSuccess
        }
      />

      {/* REMINDERS */}

      <ReminderPanel
        apiBase={
          apiBase
        }
        stepId={
          step.id
        }
        reminders={
          step.reminders
        }
        refresh={
          refresh
        }
        reportError={
          reportError
        }
        reportSuccess={
          reportSuccess
        }
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTENT
═══════════════════════════════════════════════════════════════ */

function ContentPanel({
    apiBase,
    templateId,
  step,
  refresh,
  reportError,
  reportSuccess,
}: {
  apiBase: string;

  templateId: string;

  step: PostOpStepDto;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;

  reportSuccess: (
    message: string,
  ) => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  const [
    addingType,
    setAddingType,
  ] =
    useState<ContentType | null>(
      null,
    );

  const [
    externalVideo,
    setExternalVideo,
  ] =
    useState("");

  const [
    adding,
    setAdding,
  ] =
    useState(false);

  async function createSimpleBlock(
    type: ContentType,
  ) {
    setAdding(true);
    reportError(null);

    try {
      const body:
        Record<
          string,
          unknown
        > = {
        type,
      };

      if (type === "TEXT") {
        body.text = t(
          "newInstruction",
        );
      }

      if (
        type === "BOOKING"
      ) {
        body.bookingType =
          "EITHER";

        body.buttonLabel =
          t(
            "defaultBookingButton",
          );
      }

      await api(
        `${apiBase}/steps/${step.id}/blocks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              body,
            ),
        },
      );

      await refresh();

      setAddingType(null);

      reportSuccess(
        t(
          "messages.contentAdded",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.addContent",
            ),
      );
    } finally {
      setAdding(false);
    }
  }

  async function addExternalVideo() {
    if (
      !externalVideo.trim()
    ) {
      return;
    }

    setAdding(true);
    reportError(null);

    try {
      await api(
        `${apiBase}/steps/${step.id}/blocks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              type: "VIDEO",

              objectPath: null,

              externalUrl:
                externalVideo.trim(),

              mediaAlt:
                t(
                  "recoveryVideo",
                ),
            }),
        },
      );

      setExternalVideo("");

      setAddingType(null);

      await refresh();

      reportSuccess(
        t(
          "messages.contentAdded",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.addContent",
            ),
      );
    } finally {
      setAdding(false);
    }
  }

  async function uploadedMedia(
    type:
      | "IMAGE"
      | "VIDEO",
    media: {
      objectPath: string;
      publicUrl:
        | string
        | null;
      contentType: string;
      sizeBytes: number;
    },
  ) {
    setAdding(true);
    reportError(null);

    try {
      await api(
        `${apiBase}/steps/${step.id}/blocks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              type,

              objectPath:
                media.objectPath,

              externalUrl:
                media.publicUrl,

              mediaAlt:
                type ===
                "IMAGE"
                  ? t(
                      "recoveryImage",
                    )
                  : t(
                      "recoveryVideo",
                    ),
            }),
        },
      );

      setAddingType(null);

      await refresh();

      reportSuccess(
        t(
          "messages.mediaAdded",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.addContent",
            ),
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card>
      <SectionHeader
        icon={
          <FileText className="size-4" />
        }
        title={t(
          "patientContent",
        )}
        description={t(
          "patientContentDescription",
        )}
        right={
          <span className="rounded-full bg-[#283C5D]/[0.06] px-3 py-1 text-xs font-medium text-[#283C5D]">
            {
              step.blocks
                .length
            }{" "}
            {t(
              "items",
            )}
          </span>
        }
      />

      {/* ADD TYPES */}

      <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        <AddContentButton
          icon={
            <FileText className="size-5" />
          }
          title={t(
            "text",
          )}
          active={
            addingType ===
            "TEXT"
          }
          onClick={() =>
            void createSimpleBlock(
              "TEXT",
            )
          }
        />

        <AddContentButton
          icon={
            <ImageIcon className="size-5" />
          }
          title={t(
            "image",
          )}
          active={
            addingType ===
            "IMAGE"
          }
          onClick={() =>
            setAddingType(
              addingType ===
                "IMAGE"
                ? null
                : "IMAGE",
            )
          }
        />

        <AddContentButton
          icon={
            <Video className="size-5" />
          }
          title={t(
            "video",
          )}
          active={
            addingType ===
            "VIDEO"
          }
          onClick={() =>
            setAddingType(
              addingType ===
                "VIDEO"
                ? null
                : "VIDEO",
            )
          }
        />

        <AddContentButton
          icon={
            <CalendarDays className="size-5" />
          }
          title={t(
            "booking",
          )}
          active={
            addingType ===
            "BOOKING"
          }
          onClick={() =>
            void createSimpleBlock(
              "BOOKING",
            )
          }
        />
      </div>

      {/* IMAGE UPLOAD */}

      {addingType ===
        "IMAGE" && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#D8BD8D] bg-[#D8BD8D]/[0.07] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#B4945A] shadow-sm">
              <UploadCloud className="size-4" />
            </div>

            <div>
              <p className="text-sm font-medium text-[#283C5D]">
                {t(
                  "uploadImage",
                )}
              </p>

              <p className="text-xs text-neutral-400">
                {t(
                  "uploadImageHelp",
                )}
              </p>
            </div>
          </div>

          <PostOpMediaUploader
            purpose="TEMPLATE"
            templateId={templateId}
            accept="image"
            onUploaded={(
              media,
            ) =>
              void uploadedMedia(
                "IMAGE",
                media,
              )
            }
          />
        </div>
      )}

      {/* VIDEO */}

      {addingType ===
        "VIDEO" && (
        <div className="mt-4 space-y-4 rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-4">
          <div>
            <p className="text-sm font-medium text-[#283C5D]">
              {t(
                "uploadVideo",
              )}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              {t(
                "uploadVideoHelp",
              )}
            </p>
          </div>

          <PostOpMediaUploader
            purpose="TEMPLATE"
            templateId={templateId}
            accept="video"
            onUploaded={(
              media,
            ) =>
              void uploadedMedia(
                "VIDEO",
                media,
              )
            }
          />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {t(
                "or",
              )}
            </span>

            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

              <input
                value={
                  externalVideo
                }
                onChange={(
                  event,
                ) =>
                  setExternalVideo(
                    event
                      .target
                      .value,
                  )
                }
                placeholder={t(
                  "videoUrlPlaceholder",
                )}
                className={`${inputClass} pl-10`}
              />
            </div>

            <SecondaryButton
              onClick={() =>
                void addExternalVideo()
              }
              disabled={
                !externalVideo.trim() ||
                adding
              }
            >
              {adding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}

              {t(
                "addVideo",
              )}
            </SecondaryButton>
          </div>
        </div>
      )}

      {/* BLOCKS */}

      {step.blocks.length >
      0 ? (
        <div className="mt-6 space-y-3">
          {step.blocks.map(
            (
              block,
              index,
            ) => (
              <BlockCard
                key={
                  block.id
                }
                templateId={templateId}
                apiBase={
                  apiBase
                }
                stepId={
                  step.id
                }
                block={
                  block
                }
                previous={
                  step.blocks[
                    index -
                      1
                  ] ?? null
                }
                next={
                  step.blocks[
                    index +
                      1
                  ] ?? null
                }
                refresh={
                  refresh
                }
                reportError={
                  reportError
                }
                reportSuccess={
                  reportSuccess
                }
              />
            ),
          )}
        </div>
      ) : (
        <EmptyState
          icon={
            <FileText className="size-5" />
          }
          title={t(
            "noContent",
          )}
          description={t(
            "noContentDescription",
          )}
        />
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCK
═══════════════════════════════════════════════════════════════ */

function BlockCard({
  apiBase,
  stepId,
  templateId,
  block,
  previous,
  next,
  refresh,
  reportError,
  reportSuccess,
}: {
  apiBase: string;

  stepId: string;

  templateId: string;

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

  reportSuccess: (
    message: string,
  ) => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  const [
    expanded,
    setExpanded,
  ] =
    useState(false);

  const [form, setForm] =
    useState(block);

  const [saving, setSaving] =
    useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] =
    useState(false);

  const [
    replacingMedia,
    setReplacingMedia,
  ] =
    useState(false);

  useEffect(() => {
    setForm(block);
  }, [block]);

  const endpoint =
    `${apiBase}/steps/${stepId}/blocks/${block.id}`;

  async function save() {
    setSaving(true);
    reportError(null);

    try {
      await api(
        endpoint,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              type:
                form.type,

              text:
                form.text,

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
        },
      );

      await refresh();

      setExpanded(false);

      reportSuccess(
        t(
          "messages.contentSaved",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.saveContent",
            ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api(
        endpoint,
        {
          method:
            "DELETE",
        },
      );

      await refresh();

      reportSuccess(
        t(
          "messages.contentDeleted",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.deleteContent",
            ),
      );
    }
  }

  async function move(
    other:
      | PostOpBlockDto
      | null,
  ) {
    if (!other) {
      return;
    }

    try {
      await Promise.all([
        api(
          endpoint,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sortOrder:
                  other.sortOrder,
              }),
          },
        ),

        api(
          `${apiBase}/steps/${stepId}/blocks/${other.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sortOrder:
                  block.sortOrder,
              }),
          },
        ),
      ]);

      await refresh();
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.reorderContent",
            ),
      );
    }
  }

  async function replaceMedia(
    media: {
      objectPath: string;
      publicUrl:
        | string
        | null;
      contentType: string;
      sizeBytes: number;
    },
  ) {
    try {
      await api(
        endpoint,
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              objectPath:
                media.objectPath,

              externalUrl:
                media.publicUrl,

              mediaAlt:
                form.mediaAlt,

              sortOrder:
                form.sortOrder,
            }),
        },
      );

      setReplacingMedia(
        false,
      );

      await refresh();

      reportSuccess(
        t(
          "messages.mediaReplaced",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.replaceMedia",
            ),
      );
    }
  }

  const icon =
    block.type === "TEXT"
      ? (
          <FileText className="size-4" />
        )
      : block.type ===
          "IMAGE"
        ? (
            <ImageIcon className="size-4" />
          )
        : block.type ===
            "VIDEO"
          ? (
              <Video className="size-4" />
            )
          : (
              <CalendarDays className="size-4" />
            );

  function blockTitle() {
    if (
      block.type === "TEXT"
    ) {
      return (
        block.text
          ?.trim()
          .slice(
            0,
            70,
          ) ||
        t(
          "textInstruction",
        )
      );
    }

    if (
      block.type === "IMAGE"
    ) {
      return (
        block.mediaAlt ||
        t(
          "imageInstruction",
        )
      );
    }

    if (
      block.type === "VIDEO"
    ) {
      return (
        block.mediaAlt ||
        t(
          "videoInstruction",
        )
      );
    }

    return (
      block.buttonLabel ||
      t(
        "bookingAction",
      )
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border transition ${
      expanded
        ? "border-[#D8BD8D] bg-white shadow-[0_12px_35px_rgba(40,60,93,0.06)]"
        : "border-[#283C5D]/[0.08] bg-[#FAF9F7]/70 hover:border-[#283C5D]/15"
    }`}>
      {/* HEADER */}

      <div className="flex items-center gap-3 p-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#B4945A] shadow-sm">
          {icon}
        </div>

        <button
          type="button"
          onClick={() =>
            setExpanded(
              (
                current,
              ) =>
                !current,
            )
          }
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-medium text-[#283C5D]">
            {blockTitle()}
          </p>

          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            {block.type}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            title={t(
              "moveUp",
            )}
            disabled={
              !previous
            }
            onClick={() =>
              void move(
                previous,
              )
            }
          >
            <ChevronUp className="size-3.5" />
          </IconButton>

          <IconButton
            title={t(
              "moveDown",
            )}
            disabled={
              !next
            }
            onClick={() =>
              void move(
                next,
              )
            }
          >
            <ChevronDown className="size-3.5" />
          </IconButton>

          <button
            type="button"
            onClick={() =>
              setExpanded(
                (
                  current,
                ) =>
                  !current,
              )
            }
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-white hover:text-[#283C5D]"
          >
            <ChevronDown className={`size-4 transition-transform ${
              expanded
                ? "rotate-180"
                : ""
            }`} />
          </button>
        </div>
      </div>

      {/* BODY */}

      {expanded && (
        <div className="border-t border-[#283C5D]/[0.06] bg-white p-4 md:p-5">
          {block.type ===
            "TEXT" && (
            <Field>
              <FieldLabel>
                {t(
                  "instruction",
                )}
              </FieldLabel>

              <textarea
                value={
                  form.text ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  setForm({
                    ...form,

                    text:
                      event
                        .target
                        .value,
                  })
                }
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </Field>
          )}

          {block.type ===
            "IMAGE" && (
            <div className="space-y-4">
              {form.externalUrl && (
                <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
                  <img
                    src={
                      form.externalUrl
                    }
                    alt={
                      form.mediaAlt ??
                      ""
                    }
                    className="max-h-64 w-full object-cover"
                  />
                </div>
              )}

              <Field>
                <FieldLabel>
                  {t(
                    "mediaDescription",
                  )}
                </FieldLabel>

                <input
                  value={
                    form.mediaAlt ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,

                      mediaAlt:
                        event
                          .target
                          .value,
                    })
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              {!replacingMedia ? (
                <SecondaryButton
                  onClick={() =>
                    setReplacingMedia(
                      true,
                    )
                  }
                >
                  <UploadCloud className="size-4" />

                  {t(
                    "replaceImage",
                  )}
                </SecondaryButton>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D8BD8D] bg-[#D8BD8D]/[0.07] p-4">
                  <div className="mb-3 flex justify-between gap-3">
                    <p className="text-sm font-medium text-[#283C5D]">
                      {t(
                        "replaceImage",
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setReplacingMedia(
                          false,
                        )
                      }
                      className="text-neutral-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <PostOpMediaUploader
                    purpose="TEMPLATE"
                    templateId={
                      stepId
                        ? undefined
                        : undefined
                    }
                    accept="image"
                    onUploaded={(
                      media,
                    ) =>
                      void replaceMedia(
                        media,
                      )
                    }
                  />
                </div>
              )}
            </div>
          )}

          {block.type ===
            "VIDEO" && (
            <div className="space-y-4">
              {!form.objectPath && (
                <Field>
                  <FieldLabel>
                    {t(
                      "videoUrl",
                    )}
                  </FieldLabel>

                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                    <input
                      value={
                        form.externalUrl ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,

                          externalUrl:
                            event
                              .target
                              .value,
                        })
                      }
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>
              )}

              <Field>
                <FieldLabel>
                  {t(
                    "videoTitle",
                  )}
                </FieldLabel>

                <input
                  value={
                    form.mediaAlt ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,

                      mediaAlt:
                        event
                          .target
                          .value,
                    })
                  }
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>
          )}

          {block.type ===
            "BOOKING" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>
                  {t(
                    "bookingType",
                  )}
                </FieldLabel>

                <select
                  value={
                    form.bookingType ??
                    "EITHER"
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,

                      bookingType:
                        event
                          .target
                          .value as BookingType,
                    })
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="EITHER">
                    {t(
                      "either",
                    )}
                  </option>

                  <option value="IN_CLINIC">
                    {t(
                      "inClinic",
                    )}
                  </option>

                  <option value="ONLINE">
                    {t(
                      "online",
                    )}
                  </option>
                </select>
              </Field>

              <Field>
                <FieldLabel>
                  {t(
                    "buttonLabel",
                  )}
                </FieldLabel>

                <input
                  value={
                    form.buttonLabel ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,

                      buttonLabel:
                        event
                          .target
                          .value,
                    })
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              <div className="md:col-span-2">
                <Field>
                  <FieldLabel>
                    {t(
                      "bookingUrl",
                    )}
                  </FieldLabel>

                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                    <input
                      value={
                        form.bookingUrl ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,

                          bookingUrl:
                            event
                              .target
                              .value,
                        })
                      }
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() =>
                  setConfirmDelete(
                    true,
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="size-3.5" />

                {t(
                  "remove",
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">
                  {t(
                    "confirmRemove",
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    void remove()
                  }
                  className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                >
                  {t(
                    "delete",
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setConfirmDelete(
                      false,
                    )
                  }
                  className="rounded-lg px-2.5 py-1.5 text-xs text-neutral-500"
                >
                  {t(
                    "cancel",
                  )}
                </button>
              </div>
            )}

            <PrimaryButton
              onClick={() =>
                void save()
              }
              disabled={
                saving
              }
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}

              {t(
                "save",
              )}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REMINDERS
═══════════════════════════════════════════════════════════════ */

function ReminderPanel({
  apiBase,
  stepId,
  reminders,
  global = false,
  refresh,
  reportError,
  reportSuccess,
}: {
  apiBase: string;

  stepId: string | null;

  reminders:
    PostOpReminderDto[];

  global?: boolean;

  refresh: () => Promise<void>;

  reportError: (
    message: string | null,
  ) => void;

  reportSuccess: (
    message: string,
  ) => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  const [adding, setAdding] =
    useState(false);

  async function addReminder() {
    setAdding(true);
    reportError(null);

    try {
      await api(
        `${apiBase}/reminders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              stepId,

              type:
                "GENERAL",

              text:
                t(
                  "newReminder",
                ),

              startsAfterHours:
                0,

              endsAfterHours:
                null,

              notificationsEnabled:
                false,

              repeatEveryHours:
                null,

              isPinned:
                true,
            }),
        },
      );

      await refresh();

      reportSuccess(
        t(
          "messages.reminderAdded",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.addReminder",
            ),
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card>
      <SectionHeader
        icon={
          global ? (
            <BellRing className="size-4" />
          ) : (
            <Bell className="size-4" />
          )
        }
        title={
          global
            ? t(
                "globalReminders",
              )
            : t(
                "stepReminders",
              )
        }
        description={
          global
            ? t(
                "globalRemindersDescription",
              )
            : t(
                "stepRemindersDescription",
              )
        }
        right={
          <SecondaryButton
            onClick={() =>
              void addReminder()
            }
            disabled={
              adding
            }
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}

            {t(
              "addReminder",
            )}
          </SecondaryButton>
        }
      />

      {reminders.length >
      0 ? (
        <div className="mt-6 space-y-3">
          {reminders.map(
            (
              reminder,
              index,
            ) => (
              <ReminderCard
                key={
                  reminder.id
                }
                apiBase={
                  apiBase
                }
                reminder={
                  reminder
                }
                previous={
                  reminders[
                    index -
                      1
                  ] ?? null
                }
                next={
                  reminders[
                    index +
                      1
                  ] ?? null
                }
                refresh={
                  refresh
                }
                reportError={
                  reportError
                }
                reportSuccess={
                  reportSuccess
                }
              />
            ),
          )}
        </div>
      ) : (
        <EmptyState
          icon={
            <Bell className="size-5" />
          }
          title={t(
            "noReminders",
          )}
          description={
            global
              ? t(
                  "noGlobalRemindersDescription",
                )
              : t(
                  "noStepRemindersDescription",
                )
          }
        />
      )}
    </Card>
  );
}

function ReminderCard({
  apiBase,
  reminder,
  previous,
  next,
  refresh,
  reportError,
  reportSuccess,
}: {
  apiBase: string;

  reminder:
    PostOpReminderDto;

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

  reportSuccess: (
    message: string,
  ) => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.postOpTemplates.editor",
    );

  const [form, setForm] =
    useState(reminder);

  const [
    expanded,
    setExpanded,
  ] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] =
    useState(false);

  useEffect(() => {
    setForm(reminder);
  }, [reminder]);

  const endpoint =
    `${apiBase}/reminders/${reminder.id}`;

  async function save() {
    setSaving(true);
    reportError(null);

    try {
      await api(
        endpoint,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              stepId:
                form.stepId,

              type:
                form.type,

              text:
                form.text,

              startsAfterHours:
                form.startsAfterHours,

              endsAfterHours:
                form.endsAfterHours,

              notificationsEnabled:
                form.notificationsEnabled,

              repeatEveryHours:
                form.repeatEveryHours,

              isPinned:
                form.isPinned,

              sortOrder:
                form.sortOrder,
            }),
        },
      );

      await refresh();

      setExpanded(false);

      reportSuccess(
        t(
          "messages.reminderSaved",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.saveReminder",
            ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api(
        endpoint,
        {
          method:
            "DELETE",
        },
      );

      await refresh();

      reportSuccess(
        t(
          "messages.reminderDeleted",
        ),
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.deleteReminder",
            ),
      );
    }
  }

  async function move(
    other:
      | PostOpReminderDto
      | null,
  ) {
    if (!other) {
      return;
    }

    try {
      await Promise.all([
        api(
          endpoint,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sortOrder:
                  other.sortOrder,
              }),
          },
        ),

        api(
          `${apiBase}/reminders/${other.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sortOrder:
                  reminder.sortOrder,
              }),
          },
        ),
      ]);

      await refresh();
    } catch (error) {
      reportError(
        error instanceof Error
          ? error.message
          : t(
              "errors.reorderReminder",
            ),
      );
    }
  }

  const typeStyle =
    reminder.type === "DO"
      ? "bg-emerald-50 text-emerald-700"
      : reminder.type ===
          "DONT"
        ? "bg-red-50 text-red-700"
        : "bg-[#283C5D]/[0.06] text-[#283C5D]";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#283C5D]/[0.08] bg-[#FAF9F7]/70">
      <div className="flex items-center gap-3 p-3.5">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${typeStyle}`}>
          {reminder.isPinned ? (
            <Pin className="size-4" />
          ) : (
            <Bell className="size-4" />
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setExpanded(
              (
                current,
              ) =>
                !current,
            )
          }
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-medium text-[#283C5D]">
            {reminder.text}
          </p>

          <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-neutral-400">
            <span>
              {reminder.type}
            </span>

            <span>•</span>

            <span>
              {formatHourOffset(
                reminder.startsAfterHours,
                t,
              )}
            </span>

            {reminder.notificationsEnabled && (
              <>
                <span>•</span>

                <span>
                  {t(
                    "notificationsOn",
                  )}
                </span>
              </>
            )}
          </div>
        </button>

        <div className="flex items-center">
          <IconButton
            title={t(
              "moveUp",
            )}
            disabled={
              !previous
            }
            onClick={() =>
              void move(
                previous,
              )
            }
          >
            <ChevronUp className="size-3.5" />
          </IconButton>

          <IconButton
            title={t(
              "moveDown",
            )}
            disabled={
              !next
            }
            onClick={() =>
              void move(
                next,
              )
            }
          >
            <ChevronDown className="size-3.5" />
          </IconButton>

          <button
            type="button"
            onClick={() =>
              setExpanded(
                (
                  current,
                ) =>
                  !current,
              )
            }
            className="rounded-lg p-2 text-neutral-400 hover:bg-white"
          >
            <ChevronDown className={`size-4 transition-transform ${
              expanded
                ? "rotate-180"
                : ""
            }`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 border-t border-[#283C5D]/[0.06] bg-white p-4 md:p-5">
          {/* TYPE */}

          <Field>
            <FieldLabel>
              {t(
                "reminderType",
              )}
            </FieldLabel>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  "DO",
                  "DONT",
                  "GENERAL",
                ] as ReminderType[]
              ).map(
                (type) => (
                  <button
                    key={
                      type
                    }
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,

                        type,
                      })
                    }
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                      form.type ===
                      type
                        ? type ===
                          "DO"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : type ===
                              "DONT"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-[#283C5D] bg-[#283C5D] text-white"
                        : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    {type ===
                    "DO"
                      ? t(
                          "do",
                        )
                      : type ===
                          "DONT"
                        ? t(
                            "dont",
                          )
                        : t(
                            "general",
                          )}
                  </button>
                ),
              )}
            </div>
          </Field>

          <Field>
            <FieldLabel>
              {t(
                "reminderText",
              )}
            </FieldLabel>

            <textarea
              rows={3}
              value={
                form.text
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  text:
                    event
                      .target
                      .value,
                })
              }
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>
                {t(
                  "startsAfter",
                )}
              </FieldLabel>

              <input
                type="number"
                min={0}
                value={
                  form.startsAfterHours
                }
                onChange={(
                  event,
                ) =>
                  setForm({
                    ...form,

                    startsAfterHours:
                      Number(
                        event
                          .target
                          .value,
                      ),
                  })
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                {t(
                  "endsAfter",
                )}
              </FieldLabel>

              <input
                type="number"
                min={0}
                value={
                  form.endsAfterHours ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  setForm({
                    ...form,

                    endsAfterHours:
                      event
                        .target
                        .value
                        ? Number(
                            event
                              .target
                              .value,
                          )
                        : null,
                  })
                }
                className={
                  inputClass
                }
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleCard
              checked={
                form.isPinned
              }
              icon={
                <Pin className="size-4" />
              }
              title={t(
                "keepVisible",
              )}
              description={t(
                "keepVisibleDescription",
              )}
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  isPinned:
                    value,
                })
              }
            />

            <ToggleCard
              checked={
                form.notificationsEnabled
              }
              icon={
                <BellRing className="size-4" />
              }
              title={t(
                "notifications",
              )}
              description={t(
                "notificationsDescription",
              )}
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  notificationsEnabled:
                    value,

                  repeatEveryHours:
                    value
                      ? form.repeatEveryHours
                      : null,
                })
              }
            />
          </div>

          {form.notificationsEnabled && (
            <Field>
              <FieldLabel>
                {t(
                  "repeatEvery",
                )}
              </FieldLabel>

              <div className="relative max-w-xs">
                <input
                  type="number"
                  min={1}
                  value={
                    form.repeatEveryHours ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,

                      repeatEveryHours:
                        event
                          .target
                          .value
                          ? Number(
                              event
                                .target
                                .value,
                            )
                          : null,
                    })
                  }
                  className={`${inputClass} pr-16`}
                />

                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                  {t(
                    "hours",
                  )}
                </span>
              </div>
            </Field>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() =>
                  setConfirmDelete(
                    true,
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-3.5" />

                {t(
                  "remove",
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void remove()
                  }
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {t(
                    "delete",
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setConfirmDelete(
                      false,
                    )
                  }
                  className="text-xs text-neutral-500"
                >
                  {t(
                    "cancel",
                  )}
                </button>
              </div>
            )}

            <PrimaryButton
              onClick={() =>
                void save()
              }
              disabled={
                saving
              }
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}

              {t(
                "save",
              )}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UI
═══════════════════════════════════════════════════════════════ */

const inputClass =
  "w-full rounded-xl border border-[#283C5D]/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition placeholder:text-neutral-300 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10";

function Card({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[#283C5D]/10 bg-white p-5 shadow-[0_18px_55px_rgba(40,60,93,0.045)] md:p-6">
      {children}
    </div>
  );
}

function EditorHero({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#283C5D]/10 bg-[#283C5D] p-6 text-white shadow-[0_18px_55px_rgba(40,60,93,0.12)] md:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[#D8BD8D]/20 blur-3xl" />

      <div className="relative max-w-xl">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-[#E6CC9C]">
          {icon}
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D8BD8D]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/60">
          {description}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  right,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#283C5D]/[0.06] text-[#283C5D]">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-[#283C5D]">
            {title}
          </h3>

          <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-400">
            {description}
          </p>
        </div>
      </div>

      {right}
    </div>
  );
}

function Field({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <label className="block">
      {children}
    </label>
  );
}

function FieldLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="mb-2 block text-xs font-semibold text-[#283C5D]">
      {children}
    </span>
  );
}

function FieldHelp({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="mt-2 block text-xs leading-5 text-neutral-400">
      {children}
    </span>
  );
}

function MetricCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#283C5D]/10 bg-white px-5 py-4">
      <p className="text-2xl font-semibold tracking-[-0.03em] text-[#283C5D]">
        {value}
      </p>

      <p className="mt-1 text-xs text-neutral-400">
        {label}
      </p>
    </div>
  );
}

function ChoiceCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-[#D8BD8D] bg-[#D8BD8D]/10 shadow-[0_8px_20px_rgba(216,189,141,0.12)]"
          : "border-[#283C5D]/10 bg-white hover:border-[#283C5D]/20"
      }`}
    >
      <div className={`flex size-9 items-center justify-center rounded-xl ${
        selected
          ? "bg-[#283C5D] text-white"
          : "bg-[#283C5D]/[0.06] text-[#283C5D]"
      }`}>
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-[#283C5D]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-neutral-400">
        {description}
      </p>
    </button>
  );
}

function AddContentButton({
  icon,
  title,
  active,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#D8BD8D] bg-[#D8BD8D]/10"
          : "border-[#283C5D]/10 bg-white hover:-translate-y-0.5 hover:border-[#D8BD8D] hover:shadow-[0_8px_22px_rgba(40,60,93,0.06)]"
      }`}
    >
      <div className={`flex size-9 items-center justify-center rounded-xl transition ${
        active
          ? "bg-[#283C5D] text-white"
          : "bg-[#FAF9F7] text-[#B4945A] group-hover:bg-[#D8BD8D]/15"
      }`}>
        {icon}
      </div>

      <p className="mt-3 text-sm font-medium text-[#283C5D]">
        {title}
      </p>
    </button>
  );
}

function ToggleCard({
  checked,
  icon,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onChange: (
    checked: boolean,
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked,
        )
      }
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-[#D8BD8D] bg-[#D8BD8D]/10"
          : "border-[#283C5D]/10 bg-white"
      }`}
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
        checked
          ? "bg-[#283C5D] text-white"
          : "bg-neutral-100 text-neutral-400"
      }`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#283C5D]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-neutral-400">
          {description}
        </p>
      </div>

      <div className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked
          ? "bg-[#283C5D]"
          : "bg-neutral-200"
      }`}>
        <div className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${
          checked
            ? "left-6"
            : "left-1"
        }`} />
      </div>
    </button>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#283C5D]/10 bg-[#FAF9F7]/70 px-6 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#B4945A] shadow-sm">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-[#283C5D]">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-400">
        {description}
      </p>
    </div>
  );
}

function SmallBadge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#283C5D]/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#283C5D]">
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
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
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#283C5D]/10 bg-white px-4 py-2.5 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D]/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-[#283C5D]/[0.07] bg-white p-2.5 text-neutral-500 transition hover:border-[#283C5D]/15 hover:bg-[#FAF9F7] hover:text-[#283C5D] disabled:cursor-not-allowed disabled:opacity-25"
    >
      {children}
    </button>
  );
}

function DangerIconButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function formatHourOffset(
  hours: number,
  t: ReturnType<
    typeof useTranslations
  >,
) {
  if (hours === 0) {
    return t(
      "immediately",
    );
  }

  if (
    hours % 24 === 0
  ) {
    const days =
      hours / 24;

    return t(
      "afterDays",
      {
        count: days,
      },
    );
  }

  return t(
    "afterHours",
    {
      count: hours,
    },
  );
}