"use client";

import {
  Camera,
  Globe2,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ChangeEvent } from "react";

import PrivateGcsImage from "@/components/UI/PrivateGcsImage";
import BeforeAfterUploadModal from "../profile/modal/BeforeAfterUploadModal";

type BeforeAfterCaseRecord = {
  id: string;
  doctorId: string;
  patientId: string | null;
  procedure: string | null;
  notes: string | null;
  title: string | null;
  isPublic: boolean;
  beforeImage: string | null;
  afterImage: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminDoctorGallery = {
  doctorProfileId: string;
  doctorId: string;
  name: string | null;
  email: string;
  clinicName: string;
  avatar: string | null;
  procedureIds: string[];
  cases: BeforeAfterCaseRecord[];
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function getDoctorsFromPayload(
  payload: unknown
): AdminDoctorGallery[] {
  if (!isRecord(payload)) {
    return [];
  }

  const data = isRecord(payload.data)
    ? payload.data
    : payload;

  if (!Array.isArray(data.doctors)) {
    return [];
  }

  return data.doctors as AdminDoctorGallery[];
}

async function readJsonResponse(
  response: Response
): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return parsed;
  } catch {
    return {
      error: raw,
    };
  }
}

export default function AdminBeforeAfterPanel() {
  const t = useTranslations(
    "admin.beforeAfter"
  );
    const procedureT = useTranslations(
    "proceduresName"
  );

  const [doctors, setDoctors] = useState<
    AdminDoctorGallery[]
  >([]);

  const [
    selectedDoctorId,
    setSelectedDoctorId,
  ] = useState("");

  const [searchValue, setSearchValue] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [hasLoadError, setHasLoadError] =
    useState(false);

  const [
    isUploadModalOpen,
    setIsUploadModalOpen,
  ] = useState(false);

  const [
    deletingCaseId,
    setDeletingCaseId,
  ] = useState<string | null>(null);

  const [
    updatingVisibilityCaseId,
    setUpdatingVisibilityCaseId,
  ] = useState<string | null>(null);

  const loadData =
    useCallback(async (): Promise<void> => {
      setHasLoadError(false);

      try {
        const response = await fetch(
          "/api/admin/before-after",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const payload =
          await readJsonResponse(response);

        if (!response.ok) {
          console.error(
            "Admin before/after request failed:",
            payload
          );

          throw new Error(
            "Could not load admin gallery data."
          );
        }

        const nextDoctors =
          getDoctorsFromPayload(payload);

        setDoctors(nextDoctors);

        setSelectedDoctorId(
          (currentDoctorId: string) => {
            if (
              currentDoctorId &&
              nextDoctors.some(
                (
                  doctor: AdminDoctorGallery
                ) =>
                  doctor.doctorId ===
                  currentDoctorId
              )
            ) {
              return currentDoctorId;
            }

            return (
              nextDoctors[0]?.doctorId ?? ""
            );
          }
        );
      } catch (error) {
        console.error(
          "Could not load admin gallery:",
          error
        );

        setHasLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedDoctor =
    useMemo<AdminDoctorGallery | null>(() => {
      return (
        doctors.find(
          (
            doctor: AdminDoctorGallery
          ) =>
            doctor.doctorId ===
            selectedDoctorId
        ) ?? null
      );
    }, [doctors, selectedDoctorId]);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch =
      searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return doctors;
    }

    return doctors.filter(
      (doctor: AdminDoctorGallery) => {
        const values = [
          doctor.name ?? "",
          doctor.email,
          doctor.clinicName,
        ];

        return values.some(
          (value: string) =>
            value
              .toLowerCase()
              .includes(normalizedSearch)
        );
      }
    );
  }, [doctors, searchValue]);

  function updateCaseInState(
    caseId: string,
    updater: (
      currentCase: BeforeAfterCaseRecord
    ) => BeforeAfterCaseRecord
  ): void {
    setDoctors(
      (
        currentDoctors: AdminDoctorGallery[]
      ) =>
        currentDoctors.map(
          (
            doctor: AdminDoctorGallery
          ): AdminDoctorGallery => {
            return {
              ...doctor,

              cases: doctor.cases.map(
                (
                  item: BeforeAfterCaseRecord
                ): BeforeAfterCaseRecord => {
                  if (item.id !== caseId) {
                    return item;
                  }

                  return updater(item);
                }
              ),
            };
          }
        )
    );
  }

  async function handleVisibilityChange(
    item: BeforeAfterCaseRecord
  ): Promise<void> {
    if (updatingVisibilityCaseId) {
      return;
    }

    const nextIsPublic = !item.isPublic;

    setUpdatingVisibilityCaseId(item.id);

    /*
     * Optimistic update.
     */
    updateCaseInState(
      item.id,
      (
        currentCase: BeforeAfterCaseRecord
      ) => ({
        ...currentCase,
        isPublic: nextIsPublic,
      })
    );

    try {
      const response = await fetch(
        "/api/admin/before-after",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id: item.id,
            isPublic: nextIsPublic,
          }),
        }
      );

      const payload =
        await readJsonResponse(response);

      if (!response.ok) {
        console.error(
          "Update before/after visibility failed:",
          payload
        );

        throw new Error(
          "Could not update case visibility."
        );
      }
    } catch (error) {
      console.error(
        "Could not update case visibility:",
        error
      );

      /*
       * Roll back optimistic update.
       */
      updateCaseInState(
        item.id,
        (
          currentCase: BeforeAfterCaseRecord
        ) => ({
          ...currentCase,
          isPublic: item.isPublic,
        })
      );

      window.alert(
        t("visibilityUpdateError")
      );
    } finally {
      setUpdatingVisibilityCaseId(null);
    }
  }

  async function handleDeleteCase(
    caseId: string
  ): Promise<void> {
    if (deletingCaseId) {
      return;
    }

    const confirmed = window.confirm(
      t("deleteConfirmation")
    );

    if (!confirmed) {
      return;
    }

    setDeletingCaseId(caseId);

    try {
      const response = await fetch(
        `/api/admin/before-after?id=${encodeURIComponent(
          caseId
        )}`,
        {
          method: "DELETE",
        }
      );

      const payload =
        await readJsonResponse(response);

      if (!response.ok) {
        console.error(
          "Delete before/after case failed:",
          payload
        );

        throw new Error(
          "Could not delete before/after case."
        );
      }

      setDoctors(
        (
          currentDoctors: AdminDoctorGallery[]
        ) =>
          currentDoctors.map(
            (
              doctor: AdminDoctorGallery
            ): AdminDoctorGallery => {
              if (
                doctor.doctorId !==
                selectedDoctorId
              ) {
                return doctor;
              }

              return {
                ...doctor,

                cases: doctor.cases.filter(
                  (
                    item: BeforeAfterCaseRecord
                  ) => item.id !== caseId
                ),
              };
            }
          )
      );
    } catch (error) {
      console.error(
        "Could not delete before/after case:",
        error
      );

      window.alert(t("deleteError"));
    } finally {
      setDeletingCaseId(null);
    }
  }

  return (
    <>
      <section className="w-full">
        <div className="overflow-hidden rounded-[2rem] border border-[#E7DDD0] bg-[#FAF9F7] shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
          <div className="flex flex-col gap-5 border-b border-[#E7DDD0] px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <div className="flex items-center gap-2 text-[#D8BD8D]">
                <Camera size={18} />

                <span className="text-xs font-bold uppercase tracking-[0.22em]">
                  {t("eyebrow")}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#283C5D] md:text-3xl">
                {t("title")}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#283C5D]/60">
                {t("description")}
              </p>
            </div>

            <button
              type="button"
              disabled={!selectedDoctor}
              onClick={() =>
                setIsUploadModalOpen(true)
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(40,60,93,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1F304D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus
                size={17}
                className="text-[#D8BD8D]"
              />

              {t("uploadCase")}
            </button>
          </div>

          <div className="grid min-h-[650px] lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-[#E7DDD0] bg-white/60 p-4 lg:border-b-0 lg:border-r lg:p-5">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#283C5D]/35"
                />

                <input
                  type="search"
                  value={searchValue}
                  onChange={(
                    event: ChangeEvent<HTMLInputElement>
                  ) =>
                    setSearchValue(
                      event.target.value
                    )
                  }
                  placeholder={t(
                    "searchPlaceholder"
                  )}
                  className="h-12 w-full rounded-2xl border border-[#E7DDD0] bg-white pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/35 focus:border-[#D8BD8D]"
                />
              </div>

              <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <LoaderCircle
                      size={24}
                      className="animate-spin text-[#D8BD8D]"
                    />
                  </div>
                ) : filteredDoctors.length ===
                  0 ? (
                  <div className="py-12 text-center">
                    <UserRound
                      size={28}
                      className="mx-auto text-[#283C5D]/25"
                    />

                    <p className="mt-3 text-sm text-[#283C5D]/50">
                      {t("noDoctors")}
                    </p>
                  </div>
                ) : (
                  filteredDoctors.map(
                    (
                      doctor: AdminDoctorGallery
                    ) => {
                      const isSelected =
                        doctor.doctorId ===
                        selectedDoctorId;

                      return (
                        <button
                          key={
                            doctor.doctorProfileId
                          }
                          type="button"
                          onClick={() =>
                            setSelectedDoctorId(
                              doctor.doctorId
                            )
                          }
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-[#D8BD8D] bg-[#D8BD8D]/10 shadow-sm"
                              : "border-transparent bg-white hover:border-[#E7DDD0]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#283C5D]">
                                {doctor.name ||
                                  doctor.clinicName}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#283C5D]/50">
                                {
                                  doctor.clinicName
                                }
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-[#283C5D]/[0.06] px-2.5 py-1 text-xs font-semibold text-[#283C5D]">
                              {doctor.cases.length}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )
                )}
              </div>
            </aside>

            <div className="p-5 md:p-7 lg:p-8">
              {hasLoadError ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-red-600">
                    {t("loadError")}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void loadData()
                    }
                    className="mt-4 rounded-full border border-[#E7DDD0] bg-white px-5 py-2.5 text-sm font-semibold text-[#283C5D]"
                  >
                    {t("retry")}
                  </button>
                </div>
              ) : !selectedDoctor ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <UserRound
                    size={36}
                    className="text-[#283C5D]/20"
                  />

                  <p className="mt-4 text-sm text-[#283C5D]/50">
                    {t("selectDoctor")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 border-b border-[#E7DDD0] pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8BD8D]">
                        {t("selectedDoctor")}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold text-[#283C5D]">
                        {selectedDoctor.name ||
                          selectedDoctor.clinicName}
                      </h2>

                      <p className="mt-1 text-sm text-[#283C5D]/50">
                        {
                          selectedDoctor.clinicName
                        }
                        {" · "}
                        {selectedDoctor.email}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-[#283C5D]/55">
                      {t("caseCount", {
                        count:
                          selectedDoctor.cases
                            .length,
                      })}
                    </p>
                  </div>

                  {selectedDoctor.cases.length ===
                  0 ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D8BD8D]/40 bg-white">
                        <Camera
                          size={28}
                          className="text-[#D8BD8D]"
                        />
                      </div>

                      <h3 className="mt-5 text-xl font-semibold text-[#283C5D]">
                        {t("emptyTitle")}
                      </h3>

                      <p className="mt-2 max-w-md text-sm leading-6 text-[#283C5D]/55">
                        {t(
                          "emptyDescription"
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setIsUploadModalOpen(
                            true
                          )
                        }
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white"
                      >
                        <ImagePlus
                          size={17}
                          className="text-[#D8BD8D]"
                        />

                        {t("uploadFirstCase")}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-7 grid gap-6 xl:grid-cols-2">
                      {selectedDoctor.cases.map(
                        (
                          item: BeforeAfterCaseRecord
                        ) => {
                          const isUpdatingVisibility =
                            updatingVisibilityCaseId ===
                            item.id;

                          return (
                            <article
                              key={item.id}
                              className="overflow-hidden rounded-[1.75rem] border border-[#E7DDD0] bg-white shadow-[0_16px_45px_rgba(40,60,93,0.07)]"
                            >
                              <div className="grid grid-cols-2 gap-px bg-[#E7DDD0]">
                                <div className="bg-[#F5F1EB]">
                                  <div className="border-b border-[#E7DDD0] bg-white px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#283C5D]/50">
                                    {t("before")}
                                  </div>

                                  <div className="relative h-[300px]">
                                    {item.beforeImage ? (
                                      <PrivateGcsImage
                                        objectPath={
                                          item.beforeImage
                                        }
                                        alt={t(
                                          "beforeImageAlt",
                                          {
                                            title:
                                              item.title ??
                                              t(
                                                "untitledCase"
                                              ),
                                          }
                                        )}
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-xs text-[#283C5D]/35">
                                        {t(
                                          "missingImage"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="bg-[#F5F1EB]">
                                  <div className="border-b border-[#E7DDD0] bg-white px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#283C5D]/50">
                                    {t("after")}
                                  </div>

                                  <div className="relative h-[300px]">
                                    {item.afterImage ? (
                                      <PrivateGcsImage
                                        objectPath={
                                          item.afterImage
                                        }
                                        alt={t(
                                          "afterImageAlt",
                                          {
                                            title:
                                              item.title ??
                                              t(
                                                "untitledCase"
                                              ),
                                          }
                                        )}
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-xs text-[#283C5D]/35">
                                        {t(
                                          "missingImage"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-[#283C5D]">
                                      {item.title ||
                                        t(
                                          "untitledCase"
                                        )}
                                    </h3>

                                    {item.procedure ? (
                                      <p className="mt-1 text-sm font-medium text-[#D8BD8D]">
                                          {procedureT(item.procedure)}
                                      </p>
                                    ) : null}
                                  </div>

                                  <div className="flex shrink-0 items-center gap-2">
                                    {isUpdatingVisibility ? (
                                      <LoaderCircle
                                        size={15}
                                        className="animate-spin text-[#D8BD8D]"
                                      />
                                    ) : item.isPublic ? (
                                      <Globe2
                                        size={15}
                                        className="text-emerald-600"
                                      />
                                    ) : (
                                      <LockKeyhole
                                        size={15}
                                        className="text-[#283C5D]/50"
                                      />
                                    )}

                                    <span
                                      className={`text-xs font-semibold ${
                                        item.isPublic
                                          ? "text-emerald-700"
                                          : "text-[#283C5D]/55"
                                      }`}
                                    >
                                      {item.isPublic
                                        ? t("public")
                                        : t(
                                            "private"
                                          )}
                                    </span>

                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={
                                        item.isPublic
                                      }
                                      aria-label={t(
                                        "visibilityToggleLabel"
                                      )}
                                      disabled={
                                        isUpdatingVisibility
                                      }
                                      onClick={() =>
                                        void handleVisibilityChange(
                                          item
                                        )
                                      }
                                      className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                                        item.isPublic
                                          ? "bg-emerald-500"
                                          : "bg-[#283C5D]/20"
                                      } disabled:cursor-wait disabled:opacity-60`}
                                    >
                                      <span
                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                          item.isPublic
                                            ? "translate-x-0.5"
                                            : "-translate-x-[1.125rem]"
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>

                                {item.notes ? (
                                  <p className="mt-4 text-sm leading-6 text-[#283C5D]/55">
                                    {item.notes}
                                  </p>
                                ) : null}

                                <div className="mt-5 flex justify-end border-t border-[#E7DDD0] pt-4">
                                  <button
                                    type="button"
                                    disabled={
                                      deletingCaseId ===
                                      item.id
                                    }
                                    onClick={() =>
                                      void handleDeleteCase(
                                        item.id
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {deletingCaseId ===
                                    item.id ? (
                                      <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2
                                        size={16}
                                      />
                                    )}

                                    {deletingCaseId ===
                                    item.id
                                      ? t(
                                          "deleting"
                                        )
                                      : t("delete")}
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        }
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedDoctor ? (
        <BeforeAfterUploadModal
          isOpen={isUploadModalOpen}
          doctorId={selectedDoctor.doctorId}
          procedureIds={
            selectedDoctor.procedureIds
          }
          onClose={() =>
            setIsUploadModalOpen(false)
          }
          onUploaded={() => {
            setIsUploadModalOpen(false);
            void loadData();
          }}
        />
      ) : null}
    </>
  );
}