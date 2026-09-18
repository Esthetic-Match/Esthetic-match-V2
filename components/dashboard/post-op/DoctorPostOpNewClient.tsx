"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  type PostOpTemplateDto,
} from "./PostOpTemplatePreview";

export type PostOpProcedureOption = {
  id: string;
  name: string;
};

type Patient = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type TemplateResponse = {
  template:
    | PostOpTemplateDto
    | null;

  source:
    | "DEFAULT"
    | "DOCTOR"
    | null;

  customized: boolean;
};

type Props = {
  procedures:
    PostOpProcedureOption[];

  localeCode:
    | "en"
    | "fr";
};

type PatientMode =
  | "REGISTERED"
  | "MANUAL";

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

export default function DoctorPostOpNewClient({
  procedures,
  localeCode,
}: Props) {
  const t =
    useTranslations(
      "postOp.doctor.newPostOp",
    );

  const [step, setStep] =
    useState(1);

  const [
    procedureId,
    setProcedureId,
  ] =
    useState("");

  const [
    template,
    setTemplate,
  ] =
    useState<PostOpTemplateDto | null>(
      null,
    );

  const [
    templateSource,
    setTemplateSource,
  ] =
    useState<
      | "DEFAULT"
      | "DOCTOR"
      | null
    >(null);

  const [
    templateLoading,
    setTemplateLoading,
  ] =
    useState(false);

  const [
    creatingTemplate,
    setCreatingTemplate,
  ] =
    useState(false);

  const [
    patientMode,
    setPatientMode,
  ] =
    useState<PatientMode>(
      "REGISTERED",
    );

  const [
    patientSearch,
    setPatientSearch,
  ] =
    useState("");

  const [
    patientResults,
    setPatientResults,
  ] =
    useState<Patient[]>([]);

  const [
    searchingPatients,
    setSearchingPatients,
  ] =
    useState(false);

  const [
    selectedPatient,
    setSelectedPatient,
  ] =
    useState<Patient | null>(
      null,
    );

  const [
    manualName,
    setManualName,
  ] =
    useState("");

  const [
    manualEmail,
    setManualEmail,
  ] =
    useState("");

  const [
    procedureDate,
    setProcedureDate,
  ] =
    useState("");

  const [
    procedureTime,
    setProcedureTime,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    createdCaseId,
    setCreatedCaseId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const procedure =
    useMemo(
      () =>
        procedures.find(
          (item) =>
            item.id ===
            procedureId,
        ) ?? null,
      [
        procedureId,
        procedures,
      ],
    );

  /* ═══════════════════════════════════════
     TEMPLATE
  ═══════════════════════════════════════ */

  useEffect(() => {
    if (!procedureId) {
      setTemplate(null);
      setTemplateSource(null);
      return;
    }

    let cancelled =
      false;

    async function load() {
      setTemplateLoading(
        true,
      );

      setError(null);

      try {
        const result =
          await api<TemplateResponse>(
            `/api/post-op/doctor/templates/effective?procedureId=${encodeURIComponent(
              procedureId,
            )}&localeCode=${localeCode}`,
          );

        if (cancelled) {
          return;
        }

        setTemplate(
          result.template,
        );

        setTemplateSource(
          result.source,
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : t(
                  "errors.template",
                ),
          );
        }
      } finally {
        if (!cancelled) {
          setTemplateLoading(
            false,
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    localeCode,
    procedureId,
    t,
  ]);

  async function createBlankTemplate() {
    if (!procedureId) {
      return;
    }

    setCreatingTemplate(
      true,
    );

    setError(null);

    try {
      const result =
        await api<{
          template:
            PostOpTemplateDto;
        }>(
          "/api/post-op/doctor/templates/blank",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                procedureId,

                localeCode,
              }),
          },
        );

      setTemplate(
        result.template,
      );

      setTemplateSource(
        "DOCTOR",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.createTemplate",
            ),
      );
    } finally {
      setCreatingTemplate(
        false,
      );
    }
  }

  /* ═══════════════════════════════════════
     PATIENT SEARCH
  ═══════════════════════════════════════ */

  useEffect(() => {
    if (
      patientMode !==
        "REGISTERED" ||
      patientSearch.trim()
        .length < 2
    ) {
      setPatientResults([]);
      return;
    }

    const timeout =
      window.setTimeout(
        async () => {
          setSearchingPatients(
            true,
          );

          try {
            const result =
              await api<{
                patients:
                  Patient[];
              }>(
                `/api/post-op/doctor/patients?q=${encodeURIComponent(
                  patientSearch.trim(),
                )}`,
              );

            setPatientResults(
              result.patients,
            );
          } catch {
            setPatientResults(
              [],
            );
          } finally {
            setSearchingPatients(
              false,
            );
          }
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timeout,
      );
  }, [
    patientMode,
    patientSearch,
  ]);

  /* ═══════════════════════════════════════
     VALIDATION
  ═══════════════════════════════════════ */

  const patientValid =
    patientMode ===
    "REGISTERED"
      ? Boolean(
          selectedPatient,
        )
      : Boolean(
          manualName.trim() &&
            manualEmail.trim(),
        );

  const dateValid =
    Boolean(
      procedureDate &&
        procedureTime,
    );

  const templateReady =
    Boolean(
      template &&
        template.steps.length >
          0,
    );

  function next() {
    setError(null);

    if (step === 1) {
      if (!procedureId) {
        setError(
          t(
            "errors.selectProcedure",
          ),
        );

        return;
      }

      if (!template) {
        setError(
          t(
            "errors.noTemplate",
          ),
        );

        return;
      }

      if (
        template.steps.length ===
        0
      ) {
        setError(
          t(
            "errors.emptyTemplate",
          ),
        );

        return;
      }
    }

    if (
      step === 2 &&
      !patientValid
    ) {
      setError(
        t(
          "errors.patient",
        ),
      );

      return;
    }

    if (
      step === 3 &&
      !dateValid
    ) {
      setError(
        t(
          "errors.date",
        ),
      );

      return;
    }

    setStep(
      (current) =>
        Math.min(
          current + 1,
          4,
        ),
    );
  }

  function back() {
    setError(null);

    setStep(
      (current) =>
        Math.max(
          current - 1,
          1,
        ),
    );
  }

  /* ═══════════════════════════════════════
     CREATE CASE
  ═══════════════════════════════════════ */

  async function createCase() {
    if (
      !procedureId ||
      !templateReady ||
      !patientValid ||
      !dateValid
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const localDate =
        new Date(
          `${procedureDate}T${procedureTime}`,
        );

      if (
        Number.isNaN(
          localDate.getTime(),
        )
      ) {
        throw new Error(
          t(
            "errors.date",
          ),
        );
      }

      const result =
        await api<{
          case: {
            id: string;
          };
        }>(
          "/api/post-op/cases",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                procedureId,

                localeCode,

                patientUserId:
                  patientMode ===
                  "REGISTERED"
                    ? selectedPatient
                        ?.id
                    : null,

                patientName:
                  patientMode ===
                  "REGISTERED"
                    ? selectedPatient
                        ?.name
                    : manualName.trim(),

                patientEmail:
                  patientMode ===
                  "REGISTERED"
                    ? selectedPatient
                        ?.email
                    : manualEmail
                        .trim()
                        .toLowerCase(),

                procedurePerformedAt:
                  localDate.toISOString(),
              }),
          },
        );

      setCreatedCaseId(
        result.case.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "errors.create",
            ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (createdCaseId) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] px-4 py-8 md:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-[#283C5D]/10 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)] md:p-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-[#283C5D]">
              {t(
                "success.title",
              )}
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-500">
              {t(
                "success.description",
              )}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/post-op"
                className="rounded-xl bg-[#283C5D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#21334F]"
              >
                {t(
                  "success.viewCases",
                )}
              </Link>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="rounded-xl border border-[#283C5D]/10 px-5 py-3 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D]/5"
              >
                {t(
                  "success.createAnother",
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-7">
          <div className="flex items-center gap-2 text-[#B4945A]">
            <Sparkles className="size-4" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              PostOp
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#283C5D] md:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            {t(
              "description",
            )}
          </p>
        </div>

        <Progress
          step={step}
          t={t}
        />

        {error && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}

            <button
              onClick={() =>
                setError(null)
              }
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="mt-5 rounded-[2rem] border border-[#283C5D]/10 bg-white p-5 shadow-[0_24px_70px_rgba(40,60,93,0.06)] md:p-8">
          {step === 1 && (
            <ProcedureStep
              procedures={
                procedures
              }
              procedureId={
                procedureId
              }
              onSelect={
                setProcedureId
              }
              template={
                template
              }
              templateSource={
                templateSource
              }
              loading={
                templateLoading
              }
              creatingTemplate={
                creatingTemplate
              }
              onCreateTemplate={
                createBlankTemplate
              }
              localeCode={
                localeCode
              }
            />
          )}

          {step === 2 && (
            <PatientStep
              mode={
                patientMode
              }
              setMode={
                setPatientMode
              }
              search={
                patientSearch
              }
              setSearch={
                setPatientSearch
              }
              results={
                patientResults
              }
              searching={
                searchingPatients
              }
              selected={
                selectedPatient
              }
              setSelected={
                setSelectedPatient
              }
              manualName={
                manualName
              }
              setManualName={
                setManualName
              }
              manualEmail={
                manualEmail
              }
              setManualEmail={
                setManualEmail
              }
            />
          )}

          {step === 3 && (
            <ScheduleStep
              date={
                procedureDate
              }
              setDate={
                setProcedureDate
              }
              time={
                procedureTime
              }
              setTime={
                setProcedureTime
              }
            />
          )}

          {step === 4 &&
            procedure &&
            template && (
              <ConfirmationStep
                procedure={
                  procedure
                }
                patientName={
                  patientMode ===
                  "REGISTERED"
                    ? selectedPatient
                        ?.name ??
                      ""
                    : manualName
                }
                patientEmail={
                  patientMode ===
                  "REGISTERED"
                    ? selectedPatient
                        ?.email ??
                      ""
                    : manualEmail
                }
                date={
                  procedureDate
                }
                time={
                  procedureTime
                }
                template={
                  template
                }
                source={
                  templateSource
                }
              />
            )}

          <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-5">
            <button
              type="button"
              onClick={back}
              disabled={
                step === 1
              }
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D]/5 disabled:invisible"
            >
              <ArrowLeft className="size-4" />
              {t("back")}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-[#283C5D] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#21334F]"
              >
                {t(
                  "continue",
                )}

                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={() =>
                  void createCase()
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#283C5D] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#21334F] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}

                {t(
                  "createJourney",
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROCEDURE
═══════════════════════════════════════════════════════════════ */

function ProcedureStep({
  procedures,
  procedureId,
  onSelect,
  template,
  templateSource,
  loading,
  creatingTemplate,
  onCreateTemplate,
  localeCode,
}: {
  procedures:
    PostOpProcedureOption[];

  procedureId: string;

  onSelect: (
    value: string,
  ) => void;

  template:
    | PostOpTemplateDto
    | null;

  templateSource:
    | "DEFAULT"
    | "DOCTOR"
    | null;

  loading: boolean;

  creatingTemplate: boolean;

  onCreateTemplate:
    () => void;

  localeCode:
    | "en"
    | "fr";
}) {
  const t =
    useTranslations(
      "postOp.doctor.newPostOp",
    );

  return (
    <div>
      <StepTitle
        icon={
          <FileText className="size-5" />
        }
        title={t(
          "procedure.title",
        )}
        description={t(
          "procedure.description",
        )}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {procedures.map(
          (procedure) => {
            const active =
              procedure.id ===
              procedureId;

            return (
              <button
                key={
                  procedure.id
                }
                type="button"
                onClick={() =>
                  onSelect(
                    procedure.id,
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-[#D8BD8D] bg-[#D8BD8D]/10 shadow-sm"
                    : "border-[#283C5D]/10 hover:-translate-y-0.5 hover:border-[#D8BD8D]"
                }`}
              >
                <div className={`flex size-9 items-center justify-center rounded-xl ${
                  active
                    ? "bg-[#283C5D] text-white"
                    : "bg-[#283C5D]/5 text-[#283C5D]"
                }`}>
                  {active ? (
                    <Check className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold text-[#283C5D]">
                  {procedure.name}
                </p>
              </button>
            );
          },
        )}
      </div>

      {procedureId && (
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5 text-sm text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              {t(
                "procedure.loadingPlan",
              )}
            </div>
          ) : template ? (
            <div className="rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[#B4945A]" />

                    <span className="text-xs font-semibold text-[#B4945A]">
                      {templateSource ===
                      "DOCTOR"
                        ? t(
                            "procedure.customPlan",
                          )
                        : t(
                            "procedure.defaultPlan",
                          )}
                    </span>
                  </div>

                  <p className="mt-2 font-semibold text-[#283C5D]">
                    {template.title}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {t(
                      "procedure.planSummary",
                      {
                        steps:
                          template
                            .steps
                            .length,
                        reminders:
                          template
                            .reminders
                            .length,
                      },
                    )}
                  </p>
                </div>

                {template.steps
                  .length === 0 && (
                  <Link
                    href={`/dashboard/post-op/templates?procedureId=${encodeURIComponent(
                      procedureId,
                    )}&localeCode=${localeCode}`}
                    className="rounded-xl bg-[#283C5D] px-4 py-2.5 text-center text-xs font-semibold text-white"
                  >
                    {t(
                      "procedure.buildPlan",
                    )}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D8BD8D] bg-[#D8BD8D]/[0.08] p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#B4945A] shadow-sm">
                <Plus className="size-5" />
              </div>

              <h3 className="mt-4 font-semibold text-[#283C5D]">
                {t(
                  "procedure.noPlan",
                )}
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
                {t(
                  "procedure.noPlanDescription",
                )}
              </p>

              <button
                type="button"
                onClick={
                  onCreateTemplate
                }
                disabled={
                  creatingTemplate
                }
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#283C5D] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {creatingTemplate ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}

                {t(
                  "procedure.createPlan",
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT
═══════════════════════════════════════════════════════════════ */

function PatientStep({
  mode,
  setMode,
  search,
  setSearch,
  results,
  searching,
  selected,
  setSelected,
  manualName,
  setManualName,
  manualEmail,
  setManualEmail,
}: {
  mode: PatientMode;

  setMode: (
    value: PatientMode,
  ) => void;

  search: string;
  setSearch: (
    value: string,
  ) => void;

  results: Patient[];

  searching: boolean;

  selected:
    | Patient
    | null;

  setSelected: (
    patient:
      | Patient
      | null,
  ) => void;

  manualName: string;
  setManualName: (
    value: string,
  ) => void;

  manualEmail: string;
  setManualEmail: (
    value: string,
  ) => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.newPostOp",
    );

  return (
    <div>
      <StepTitle
        icon={
          <UsersRound className="size-5" />
        }
        title={t(
          "patient.title",
        )}
        description={t(
          "patient.description",
        )}
      />

      <div className="mt-6 inline-flex rounded-2xl bg-[#FAF9F7] p-1">
        <button
          type="button"
          onClick={() =>
            setMode(
              "REGISTERED",
            )
          }
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode ===
            "REGISTERED"
              ? "bg-[#283C5D] text-white"
              : "text-[#283C5D]"
          }`}
        >
          {t(
            "patient.registered",
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            setMode(
              "MANUAL",
            )
          }
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode ===
            "MANUAL"
              ? "bg-[#283C5D] text-white"
              : "text-[#283C5D]"
          }`}
        >
          {t(
            "patient.notRegistered",
          )}
        </button>
      </div>

      {mode ===
      "REGISTERED" ? (
        <div className="mt-6">
          {selected ? (
            <div className="flex items-center justify-between rounded-2xl border border-[#D8BD8D] bg-[#D8BD8D]/10 p-4">
              <PatientIdentity
                patient={
                  selected
                }
              />

              <button
                type="button"
                onClick={() =>
                  setSelected(
                    null,
                  )
                }
                className="rounded-xl p-2 text-neutral-400 hover:bg-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

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
                    "patient.search",
                  )}
                  className={`${inputClass} pl-11`}
                />

                {searching && (
                  <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-neutral-400" />
                )}
              </div>

              {results.length >
                0 && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-[#283C5D]/10">
                  {results.map(
                    (
                      patient,
                    ) => (
                      <button
                        key={
                          patient.id
                        }
                        type="button"
                        onClick={() =>
                          setSelected(
                            patient,
                          )
                        }
                        className="flex w-full items-center border-b border-neutral-100 p-4 text-left transition last:border-b-0 hover:bg-[#FAF9F7]"
                      >
                        <PatientIdentity
                          patient={
                            patient
                          }
                        />
                      </button>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>
              {t(
                "patient.name",
              )}
            </span>

            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

              <input
                value={
                  manualName
                }
                onChange={(
                  event,
                ) =>
                  setManualName(
                    event
                      .target
                      .value,
                  )
                }
                className={`${inputClass} pl-11`}
              />
            </div>
          </label>

          <label>
            <span className={labelClass}>
              {t(
                "patient.email",
              )}
            </span>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

              <input
                type="email"
                value={
                  manualEmail
                }
                onChange={(
                  event,
                ) =>
                  setManualEmail(
                    event
                      .target
                      .value,
                  )
                }
                className={`${inputClass} pl-11`}
              />
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATE
═══════════════════════════════════════════════════════════════ */

function ScheduleStep({
  date,
  setDate,
  time,
  setTime,
}: {
  date: string;

  setDate: (
    value: string,
  ) => void;

  time: string;

  setTime: (
    value: string,
  ) => void;
}) {
  const t =
    useTranslations(
      "postOp.doctor.newPostOp",
    );

  return (
    <div>
      <StepTitle
        icon={
          <CalendarDays className="size-5" />
        }
        title={t(
          "schedule.title",
        )}
        description={t(
          "schedule.description",
        )}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>
            {t(
              "schedule.date",
            )}
          </span>

          <input
            type="date"
            value={date}
            onChange={(
              event,
            ) =>
              setDate(
                event.target
                  .value,
              )
            }
            className={
              inputClass
            }
          />
        </label>

        <label>
          <span className={labelClass}>
            {t(
              "schedule.time",
            )}
          </span>

          <input
            type="time"
            value={time}
            onChange={(
              event,
            ) =>
              setTime(
                event.target
                  .value,
              )
            }
            className={
              inputClass
            }
          />
        </label>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONFIRMATION
═══════════════════════════════════════════════════════════════ */

function ConfirmationStep({
  procedure,
  patientName,
  patientEmail,
  date,
  time,
  template,
  source,
}: {
  procedure:
    PostOpProcedureOption;

  patientName: string;
  patientEmail: string;

  date: string;
  time: string;

  template:
    PostOpTemplateDto;

  source:
    | "DEFAULT"
    | "DOCTOR"
    | null;
}) {
  const t =
    useTranslations(
      "postOp.doctor.newPostOp",
    );

  return (
    <div>
      <StepTitle
        icon={
          <ShieldCheck className="size-5" />
        }
        title={t(
          "confirm.title",
        )}
        description={t(
          "confirm.description",
        )}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SummaryCard
          title={t(
            "confirm.patient",
          )}
        >
          <p className="font-semibold text-[#283C5D]">
            {patientName}
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            {patientEmail}
          </p>
        </SummaryCard>

        <SummaryCard
          title={t(
            "confirm.procedure",
          )}
        >
          <p className="font-semibold text-[#283C5D]">
            {procedure.name}
          </p>

          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
            <CalendarDays className="size-4" />
            {date}

            <Clock3 className="ml-2 size-4" />
            {time}
          </div>
        </SummaryCard>
      </div>

      <div className="mt-4 rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B4945A]">
              {source ===
              "DOCTOR"
                ? t(
                    "confirm.customPlan",
                  )
                : t(
                    "confirm.defaultPlan",
                  )}
            </p>

            <h3 className="mt-2 font-semibold text-[#283C5D]">
              {template.title}
            </h3>

            {template.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                {
                  template.description
                }
              </p>
            )}
          </div>

          <div className="shrink-0 rounded-xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xl font-semibold text-[#283C5D]">
              {
                template.steps
                  .length
              }
            </p>

            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
              {t(
                "confirm.steps",
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {template.steps.map(
            (
              recoveryStep,
              index,
            ) => (
              <div
                key={
                  recoveryStep.id
                }
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[#283C5D] text-xs font-semibold text-white">
                  {index + 1}
                </div>

                <span className="text-sm font-medium text-[#283C5D]">
                  {
                    recoveryStep.title
                  }
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════════════ */

const inputClass =
  "w-full rounded-xl border border-[#283C5D]/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10";

const labelClass =
  "mb-2 block text-xs font-semibold text-[#283C5D]";

function Progress({
  step,
  t,
}: {
  step: number;

  t: ReturnType<
    typeof useTranslations
  >;
}) {
  const labels = [
    t(
      "progress.procedure",
    ),
    t(
      "progress.patient",
    ),
    t(
      "progress.schedule",
    ),
    t(
      "progress.confirm",
    ),
  ];

  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-2xl border border-[#283C5D]/10 bg-white">
      {labels.map(
        (
          label,
          index,
        ) => {
          const number =
            index + 1;

          const active =
            number === step;

          const done =
            number < step;

          return (
            <div
              key={label}
              className={`flex items-center gap-2 border-r px-3 py-3 last:border-r-0 md:px-5 ${
                active
                  ? "bg-[#283C5D] text-white"
                  : ""
              }`}
            >
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                active
                  ? "bg-white/15"
                  : done
                    ? "bg-[#D8BD8D]/25 text-[#8B6C37]"
                    : "bg-neutral-100 text-neutral-400"
              }`}>
                {done ? (
                  <Check className="size-3" />
                ) : (
                  number
                )}
              </span>

              <span className={`hidden text-xs font-medium sm:block ${
                active
                  ? "text-white"
                  : "text-[#283C5D]"
              }`}>
                {label}
              </span>
            </div>
          );
        },
      )}
    </div>
  );
}

function StepTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-white">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#283C5D]">
          {title}
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function PatientIdentity({
  patient,
}: {
  patient: Patient;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {patient.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            patient.avatar
          }
          alt=""
          className="size-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-[#283C5D]/5 text-[#283C5D]">
          <UserRound className="size-4" />
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#283C5D]">
          {patient.name}
        </p>

        <p className="truncate text-xs text-neutral-400">
          {patient.email}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#283C5D]/10 bg-white p-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
        {title}
      </p>

      {children}
    </div>
  );
}