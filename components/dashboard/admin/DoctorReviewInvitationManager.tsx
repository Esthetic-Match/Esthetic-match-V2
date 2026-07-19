"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Check,
  Clock3,
  Copy,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import {
  useFormatter,
  useLocale,
  useTranslations,
} from "next-intl";

type DeliveryMethod = "email" | "link";

type DoctorOption = {
  id: string;
  name: string | null;
  clinicName: string;
  avatar: string | null;
  city: string | null;
  country: string | null;
};

type PatientOption = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  preferredLanguage: string | null;
  registeredAt: string;
};

type InvitationResult = {
  delivery: DeliveryMethod;
  invitation: {
    id: string;
    doctorProfileId: string;
    recipientEmail: string | null;
    reviewUrl: string;
    expiresAt: string;
    sentAt: string | null;
    isRestrictedToPatient: boolean;
  };
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === "string" ? value : null;
}

function parseDoctors(
  value: unknown
): DoctorOption[] | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.doctors)
  ) {
    return null;
  }

  const doctors: DoctorOption[] = [];

  for (const item of value.doctors) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.clinicName !== "string"
    ) {
      return null;
    }

    const name = readNullableString(item.name);
    const avatar = readNullableString(item.avatar);
    const city = readNullableString(item.city);
    const country = readNullableString(item.country);

    if (item.name !== null && name === null) return null;
    if (item.avatar !== null && avatar === null) return null;
    if (item.city !== null && city === null) return null;
    if (item.country !== null && country === null) return null;

    doctors.push({
      id: item.id,
      name,
      clinicName: item.clinicName,
      avatar,
      city,
      country,
    });
  }

  return doctors;
}

function parsePatients(
  value: unknown
): PatientOption[] | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.patients)
  ) {
    return null;
  }

  const patients: PatientOption[] = [];

  for (const item of value.patients) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.email !== "string" ||
      typeof item.registeredAt !== "string"
    ) {
      return null;
    }

    const name = readNullableString(item.name);
    const image = readNullableString(item.image);
    const preferredLanguage = readNullableString(
      item.preferredLanguage
    );

    if (item.name !== null && name === null) return null;
    if (item.image !== null && image === null) return null;
    if (
      item.preferredLanguage !== null &&
      preferredLanguage === null
    ) {
      return null;
    }

    patients.push({
      id: item.id,
      name,
      email: item.email,
      image,
      preferredLanguage,
      registeredAt: item.registeredAt,
    });
  }

  return patients;
}

function parseInvitationResult(
  value: unknown
): InvitationResult | null {
  if (
    !isRecord(value) ||
    (value.delivery !== "email" &&
      value.delivery !== "link") ||
    !isRecord(value.invitation)
  ) {
    return null;
  }

  const invitation = value.invitation;
  const recipientEmail = readNullableString(
    invitation.recipientEmail
  );
  const sentAt = readNullableString(
    invitation.sentAt
  );

  if (
    typeof invitation.id !== "string" ||
    typeof invitation.doctorProfileId !== "string" ||
    typeof invitation.reviewUrl !== "string" ||
    typeof invitation.expiresAt !== "string" ||
    typeof invitation.isRestrictedToPatient !==
      "boolean"
  ) {
    return null;
  }

  if (
    invitation.recipientEmail !== null &&
    recipientEmail === null
  ) {
    return null;
  }

  if (
    invitation.sentAt !== null &&
    sentAt === null
  ) {
    return null;
  }

  return {
    delivery: value.delivery,
    invitation: {
      id: invitation.id,
      doctorProfileId:
        invitation.doctorProfileId,
      recipientEmail,
      reviewUrl: invitation.reviewUrl,
      expiresAt: invitation.expiresAt,
      sentAt,
      isRestrictedToPatient:
        invitation.isRestrictedToPatient,
    },
  };
}

function getInitials(
  name: string | null,
  fallback: string
): string {
  const source = name?.trim() || fallback.trim();

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

async function copyText(
  text: string
): Promise<void> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea =
    document.createElement("textarea");

  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied =
    document.execCommand("copy");

  textarea.remove();

  if (!copied) {
    throw new Error("Copy operation failed.");
  }
}

export default function DoctorReviewInvitationManager() {
  const t = useTranslations(
    "mainDashboard.reviewInvitations"
  );
  const locale = useLocale();
  const format = useFormatter();

  const [doctors, setDoctors] =
    useState<DoctorOption[]>([]);
  const [patients, setPatients] =
    useState<PatientOption[]>([]);

  const [
    selectedDoctorId,
    setSelectedDoctorId,
  ] = useState("");
  const [
    selectedPatientId,
    setSelectedPatientId,
  ] = useState("");

  const [doctorSearch, setDoctorSearch] =
    useState("");
  const [patientSearch, setPatientSearch] =
    useState("");

  const [delivery, setDelivery] =
    useState<DeliveryMethod>("email");

  const [
    isLoadingDoctors,
    setIsLoadingDoctors,
  ] = useState(true);
  const [
    isLoadingPatients,
    setIsLoadingPatients,
  ] = useState(true);

  const [isCreating, setIsCreating] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [patientLoadMessage, setPatientLoadMessage] =
    useState("");
  const [result, setResult] =
    useState<InvitationResult | null>(null);
  const [isCopied, setIsCopied] =
    useState(false);

  const loadDoctors =
    useCallback(async (): Promise<void> => {
      setIsLoadingDoctors(true);

      try {
        const response = await fetch(
          "/api/reviews/doctors",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const payload: unknown =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            t("doctorLoadError")
          );
        }

        const parsedDoctors =
          parseDoctors(payload);

        if (!parsedDoctors) {
          throw new Error(
            t("doctorLoadError")
          );
        }

        setDoctors(parsedDoctors);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t("doctorLoadError")
        );
      } finally {
        setIsLoadingDoctors(false);
      }
    }, [t]);

  const loadPatients =
    useCallback(async (): Promise<void> => {
      setIsLoadingPatients(true);
      setPatientLoadMessage("");

      try {
        const response = await fetch(
          "/api/reviews/patients",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const payload: unknown =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            t("patientAccessRequired")
          );
        }

        const parsedPatients =
          parsePatients(payload);

        if (!parsedPatients) {
          throw new Error(
            t("patientLoadError")
          );
        }

        setPatients(parsedPatients);
      } catch (error) {
        setPatientLoadMessage(
          error instanceof Error
            ? error.message
            : t("patientLoadError")
        );
      } finally {
        setIsLoadingPatients(false);
      }
    }, [t]);

  useEffect(() => {
    void loadDoctors();
    void loadPatients();
  }, [loadDoctors, loadPatients]);

  const filteredDoctors = useMemo(() => {
    const query = doctorSearch
      .trim()
      .toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) => {
      const location = [
        doctor.city,
        doctor.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        doctor.name
          ?.toLowerCase()
          .includes(query) ||
        doctor.clinicName
          .toLowerCase()
          .includes(query) ||
        location.includes(query)
      );
    });
  }, [doctors, doctorSearch]);

  const filteredPatients = useMemo(() => {
    const query = patientSearch
      .trim()
      .toLowerCase();

    if (!query) return patients;

    return patients.filter(
      (patient) =>
        patient.name
          ?.toLowerCase()
          .includes(query) ||
        patient.email
          .toLowerCase()
          .includes(query)
    );
  }, [patients, patientSearch]);

  const selectedDoctor = useMemo(
    () =>
      doctors.find(
        (doctor) =>
          doctor.id === selectedDoctorId
      ) ?? null,
    [doctors, selectedDoctorId]
  );

  const selectedPatient = useMemo(
    () =>
      patients.find(
        (patient) =>
          patient.id === selectedPatientId
      ) ?? null,
    [patients, selectedPatientId]
  );

  function resetResult() {
    setResult(null);
    setErrorMessage("");
    setIsCopied(false);
  }

  function selectDoctor(
    doctorId: string
  ) {
    setSelectedDoctorId(doctorId);
    resetResult();
  }

  function selectPatient(
    patientId: string
  ) {
    setSelectedPatientId(patientId);
    resetResult();
  }

  function clearPatient() {
    setSelectedPatientId("");
    resetResult();
  }

  async function createInvitation() {
    if (!selectedDoctor) {
      setErrorMessage(
        t("selectDoctorError")
      );
      return;
    }

    if (
      delivery === "email" &&
      !selectedPatient
    ) {
      setErrorMessage(
        t("selectPatientError")
      );
      return;
    }

    setIsCreating(true);
    setErrorMessage("");
    setResult(null);
    setIsCopied(false);

    try {
      const response = await fetch(
        "/api/dashboard/doctor/review-invitations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            doctorProfileId:
              selectedDoctor.id,
            patientUserId:
              selectedPatient?.id ?? null,
            delivery,
            locale,
          }),
        }
      );

      const payload: unknown =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        const backendMessage =
          isRecord(payload) &&
          typeof payload.error === "string"
            ? payload.error
            : null;

        throw new Error(
          backendMessage ??
            (delivery === "email"
              ? t("sendError")
              : t("generateError"))
        );
      }

      const parsedResult =
        parseInvitationResult(payload);

      if (!parsedResult) {
        throw new Error(
          t("generateError")
        );
      }

      setResult(parsedResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("generateError")
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopy() {
    if (!result) return;

    try {
      await copyText(
        result.invitation.reviewUrl
      );

      setIsCopied(true);

      window.setTimeout(() => {
        setIsCopied(false);
      }, 2200);
    } catch {
      setErrorMessage(t("copyError"));
    }
  }

  const requiresPatient =
    delivery === "email";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#283C5D]/10 bg-white p-6 shadow-lg shadow-[#283C5D]/5 md:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#283C5D] text-[#D8BD8D] shadow-md">
            <Send
              size={21}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8BD8D]">
              {t("eyebrow")}
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#283C5D]">
              {t("title")}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#283C5D]/60">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_1fr_0.95fr]">
          <SelectionPanel
            title={t("doctorListTitle")}
            subtitle={t("doctorRequired")}
            searchValue={doctorSearch}
            searchPlaceholder={t(
              "doctorSearchPlaceholder"
            )}
            onSearchChange={setDoctorSearch}
          >
            <div className="h-[430px] overflow-y-auto overscroll-contain p-3">
              {isLoadingDoctors ? (
                <LoadingState />
              ) : filteredDoctors.length === 0 ? (
                <EmptyState
                  icon="doctor"
                  title={t(
                    doctors.length === 0
                      ? "emptyDoctorsTitle"
                      : "noDoctorResultsTitle"
                  )}
                  description={t(
                    doctors.length === 0
                      ? "emptyDoctorsDescription"
                      : "noDoctorResultsDescription"
                  )}
                />
              ) : (
                <div className="space-y-2">
                  {filteredDoctors.map(
                    (doctor) => {
                      const isSelected =
                        doctor.id ===
                        selectedDoctorId;

                      const location = [
                        doctor.city,
                        doctor.country,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <button
                          key={doctor.id}
                          type="button"
                          onClick={() =>
                            selectDoctor(
                              doctor.id
                            )
                          }
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition ${
                            isSelected
                              ? "border-[#D8BD8D] bg-[#FAF2DE]/65 shadow-sm"
                              : "border-transparent hover:border-[#283C5D]/10 hover:bg-[#FAF9F7]"
                          }`}
                        >
                          {doctor.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={doctor.avatar}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-2xl object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                                isSelected
                                  ? "bg-[#283C5D] text-[#D8BD8D]"
                                  : "bg-[#FAF9F7] text-[#283C5D]"
                              }`}
                            >
                              {getInitials(
                                doctor.name,
                                doctor.clinicName
                              )}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#283C5D]">
                              {doctor.name ||
                                doctor.clinicName}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-[#283C5D]/50">
                              {doctor.clinicName}
                            </p>

                            {location && (
                              <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#283C5D]/40">
                                <MapPin
                                  size={11}
                                  aria-hidden="true"
                                />
                                {location}
                              </p>
                            )}
                          </div>

                          <SelectionCheck
                            selected={isSelected}
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </SelectionPanel>

          <SelectionPanel
            title={t("patientListTitle")}
            subtitle={
              requiresPatient
                ? t("patientRequired")
                : t("patientOptional")
            }
            searchValue={patientSearch}
            searchPlaceholder={t(
              "patientSearchPlaceholder"
            )}
            onSearchChange={setPatientSearch}
            action={
              selectedPatient &&
              !requiresPatient ? (
                <button
                  type="button"
                  onClick={clearPatient}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#283C5D]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#283C5D] transition hover:border-[#D8BD8D]"
                >
                  <X
                    size={13}
                    aria-hidden="true"
                  />
                  {t("clearSelection")}
                </button>
              ) : null
            }
          >
            <div className="h-[430px] overflow-y-auto overscroll-contain p-3">
              {isLoadingPatients ? (
                <LoadingState />
              ) : patientLoadMessage ? (
                <EmptyState
                  icon="patient"
                  title={t(
                    "patientAccessTitle"
                  )}
                  description={
                    patientLoadMessage
                  }
                />
              ) : filteredPatients.length === 0 ? (
                <EmptyState
                  icon="patient"
                  title={t(
                    patients.length === 0
                      ? "emptyPatientsTitle"
                      : "noPatientResultsTitle"
                  )}
                  description={t(
                    patients.length === 0
                      ? "emptyPatientsDescription"
                      : "noPatientResultsDescription"
                  )}
                />
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map(
                    (patient) => {
                      const isSelected =
                        patient.id ===
                        selectedPatientId;

                      return (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() =>
                            selectPatient(
                              patient.id
                            )
                          }
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition ${
                            isSelected
                              ? "border-[#D8BD8D] bg-[#FAF2DE]/65 shadow-sm"
                              : "border-transparent hover:border-[#283C5D]/10 hover:bg-[#FAF9F7]"
                          }`}
                        >
                          {patient.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={patient.image}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-2xl object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                                isSelected
                                  ? "bg-[#283C5D] text-[#D8BD8D]"
                                  : "bg-[#FAF9F7] text-[#283C5D]"
                              }`}
                            >
                              {getInitials(
                                patient.name,
                                patient.email
                              )}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#283C5D]">
                              {patient.name ||
                                t(
                                  "unnamedPatient"
                                )}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-[#283C5D]/50">
                              {patient.email}
                            </p>

                            <p className="mt-1 text-[11px] text-[#283C5D]/40">
                              {t("registeredOn", {
                                date: format.dateTime(
                                  new Date(
                                    patient.registeredAt
                                  ),
                                  {
                                    year:
                                      "numeric",
                                    month:
                                      "short",
                                    day:
                                      "numeric",
                                  }
                                ),
                              })}
                            </p>
                          </div>

                          <SelectionCheck
                            selected={isSelected}
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </SelectionPanel>

          <div className="flex min-h-[520px] flex-col rounded-3xl bg-[#283C5D] p-5 text-white md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8BD8D]">
                {t("deliveryTitle")}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/8 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDelivery("email");
                    resetResult();
                  }}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    delivery === "email"
                      ? "bg-white text-[#283C5D] shadow-sm"
                      : "text-white/65 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Mail
                    size={16}
                    aria-hidden="true"
                  />
                  {t("emailAndLink")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDelivery("link");
                    resetResult();
                  }}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    delivery === "link"
                      ? "bg-white text-[#283C5D] shadow-sm"
                      : "text-white/65 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Link2
                    size={16}
                    aria-hidden="true"
                  />
                  {t("linkOnly")}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-white/50">
                {delivery === "email"
                  ? t(
                      "emailAndLinkDescription"
                    )
                  : t(
                      "linkOnlyDescription"
                    )}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <SelectedSummary
                icon="doctor"
                label={t("selectedDoctor")}
                title={
                  selectedDoctor
                    ? selectedDoctor.name ||
                      selectedDoctor.clinicName
                    : t("noDoctorSelected")
                }
                subtitle={
                  selectedDoctor?.clinicName ??
                  t("doctorSelectionRequired")
                }
              />

              <SelectedSummary
                icon="patient"
                label={t("selectedPatient")}
                title={
                  selectedPatient
                    ? selectedPatient.name ||
                      t("unnamedPatient")
                    : requiresPatient
                      ? t("noPatientSelected")
                      : t("genericLinkTitle")
                }
                subtitle={
                  selectedPatient?.email ??
                  (requiresPatient
                    ? t(
                        "patientSelectionRequired"
                      )
                    : t(
                        "genericLinkDescription"
                      ))
                }
              />
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm font-medium text-red-100">
                {errorMessage}
              </div>
            )}

            {result && (
              <div className="mt-4 rounded-2xl border border-[#D8BD8D]/35 bg-[#D8BD8D]/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D8BD8D] text-[#283C5D]">
                    <Check
                      size={17}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {result.delivery ===
                      "email"
                        ? t(
                            "emailSuccessTitle"
                          )
                        : t(
                            "linkSuccessTitle"
                          )}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/55">
                      {result.delivery ===
                      "email" &&
                      result.invitation
                        .recipientEmail
                        ? t(
                            "emailSuccessDescription",
                            {
                              email:
                                result
                                  .invitation
                                  .recipientEmail,
                            }
                          )
                        : result.invitation
                            .isRestrictedToPatient
                          ? t(
                              "restrictedLinkSuccessDescription"
                            )
                          : t(
                              "genericLinkSuccessDescription"
                            )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-black/15 p-2">
                  <input
                    readOnly
                    value={
                      result.invitation
                        .reviewUrl
                    }
                    aria-label={t(
                      "generatedLink"
                    )}
                    className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white/75 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      void handleCopy()
                    }
                    className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-[#283C5D] transition hover:bg-[#D8BD8D]"
                  >
                    {isCopied ? (
                      <Check
                        size={14}
                        aria-hidden="true"
                      />
                    ) : (
                      <Copy
                        size={14}
                        aria-hidden="true"
                      />
                    )}

                    {isCopied
                      ? t("copied")
                      : t("copy")}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-white/45">
                  <Clock3
                    size={13}
                    aria-hidden="true"
                  />

                  {t("expires", {
                    date: format.dateTime(
                      new Date(
                        result.invitation
                          .expiresAt
                      ),
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    ),
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <div className="mb-4 flex items-start gap-2 text-xs leading-5 text-white/45">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-[#D8BD8D]"
                  aria-hidden="true"
                />

                <p>
                  {selectedPatient
                    ? t(
                        "restrictedSecurityNote"
                      )
                    : t(
                        "genericSecurityNote"
                      )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void createInvitation()
                }
                disabled={
                  isCreating ||
                  !selectedDoctor ||
                  (requiresPatient &&
                    !selectedPatient)
                }
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D8BD8D] px-5 py-3.5 text-sm font-semibold text-[#283C5D] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isCreating ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    {delivery === "email"
                      ? t("sending")
                      : t("generating")}
                  </>
                ) : (
                  <>
                    {delivery === "email" ? (
                      <Mail
                        size={17}
                        aria-hidden="true"
                      />
                    ) : (
                      <Link2
                        size={17}
                        aria-hidden="true"
                      />
                    )}

                    {delivery === "email"
                      ? t("sendInvitation")
                      : t("generateLink")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectionPanel({
  title,
  subtitle,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#283C5D]/10">
      <div className="border-b border-[#283C5D]/10 bg-[#FAF9F7] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#283C5D]">
              {title}
            </p>

            <p className="mt-1 text-xs text-[#283C5D]/45">
              {subtitle}
            </p>
          </div>

          {action}
        </div>

        <label className="relative block">
          <Search
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#283C5D]/35"
          />

          <input
            type="search"
            value={searchValue}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-full border border-[#283C5D]/10 bg-white pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/35 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10"
          />
        </label>
      </div>

      {children}
    </div>
  );
}

function SelectionCheck({
  selected,
}: {
  selected: boolean;
}) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        selected
          ? "border-[#283C5D] bg-[#283C5D] text-white"
          : "border-[#283C5D]/20"
      }`}
    >
      {selected && (
        <Check
          size={12}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2
        size={26}
        className="animate-spin text-[#D8BD8D]"
        aria-hidden="true"
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: "doctor" | "patient";
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-7 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF2DE] text-[#D8BD8D]">
        {icon === "doctor" ? (
          <Stethoscope
            size={24}
            aria-hidden="true"
          />
        ) : (
          <UserRound
            size={24}
            aria-hidden="true"
          />
        )}
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#283C5D]">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-[#283C5D]/55">
        {description}
      </p>
    </div>
  );
}

function SelectedSummary({
  icon,
  label,
  title,
  subtitle,
}: {
  icon: "doctor" | "patient";
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D8BD8D] text-[#283C5D]">
          {icon === "doctor" ? (
            <Stethoscope
              size={17}
              aria-hidden="true"
            />
          ) : (
            <UserRound
              size={17}
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-white">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-white/45">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}