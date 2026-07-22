"use client";

import {
  ChevronDown,
  Loader2,
  RefreshCw,
  Settings2,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import CategoryProcedureModal from "../settings/modal/CategoryProcedureModal";

type DoctorSummary = {
  userId: string;
  doctorProfileId: string;
  name: string | null;
  email: string;
  clinicName: string | null;
  avatar: string | null;
};

type DoctorsResponse = {
  doctors: DoctorSummary[];
};

type DoctorProcedureResponse = {
  doctor: {
    userId: string;
    doctorProfileId: string;
    name: string | null;
    email: string;
  };
  specialtyIds: string[];
  subcategoryIds: string[];
  procedureIds: string[];
  topThree: string[];
};

function getDoctorLabel(doctor: DoctorSummary) {
  return (
    doctor.name?.trim() ||
    doctor.clinicName?.trim() ||
    doctor.email
  );
}

export default function AdminDoctorProcedures() {
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [selectedDoctorUserId, setSelectedDoctorUserId] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [doctorsReloadKey, setDoctorsReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDoctors() {
      try {
        const response = await fetch("/api/admin/doctors", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = (await response.json()) as
          | DoctorsResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Could not load the doctors.",
          );
        }

        if (controller.signal.aborted) return;

        const doctorList = (data as DoctorsResponse).doctors;

        setDoctors(doctorList);
        setDoctorsError(null);
        setSelectedDoctorUserId((currentDoctorUserId) => {
          const currentDoctorStillExists = doctorList.some(
            (doctor) => doctor.userId === currentDoctorUserId,
          );

          if (currentDoctorStillExists) {
            return currentDoctorUserId;
          }

          return doctorList[0]?.userId ?? "";
        });
      } catch (loadError) {
        if (controller.signal.aborted) return;

        setDoctors([]);
        setSelectedDoctorUserId("");
        setDoctorsError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the doctors.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDoctors(false);
        }
      }
    }

    void fetchDoctors();

    return () => {
      controller.abort();
    };
  }, [doctorsReloadKey]);

  const selectedDoctor = doctors.find(
    (doctor) => doctor.userId === selectedDoctorUserId,
  );

  function retryLoadingDoctors() {
    setIsLoadingDoctors(true);
    setDoctorsError(null);
    setDoctorsReloadKey((currentKey) => currentKey + 1);
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
      <div className="border-b border-[#283C5D]/10 bg-[#283C5D] px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#D8BD8D]">
            <Stethoscope size={21} />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8BD8D]">
              Doctor accounts
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Manage procedures
            </h2>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div>
          <label
            htmlFor="admin-doctor-procedure-selector"
            className="text-sm font-semibold text-[#283C5D]"
          >
            Select doctor
          </label>

          <div className="relative mt-2">
            <select
              id="admin-doctor-procedure-selector"
              value={selectedDoctorUserId}
              onChange={(event) =>
                setSelectedDoctorUserId(event.target.value)
              }
              disabled={isLoadingDoctors || doctors.length === 0}
              className="min-h-12 w-full appearance-none rounded-2xl border border-[#283C5D]/15 bg-white px-4 py-3 pr-11 text-sm font-medium text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
            >
              {isLoadingDoctors ? (
                <option value="">Loading doctors…</option>
              ) : doctors.length === 0 ? (
                <option value="">No doctors available</option>
              ) : (
                doctors.map((doctor) => (
                  <option key={doctor.userId} value={doctor.userId}>
                    {getDoctorLabel(doctor)} — {doctor.email}
                  </option>
                ))
              )}
            </select>

            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#283C5D]/50"
            />
          </div>
        </div>

        {doctorsError ? (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p>{doctorsError}</p>

            <button
              type="button"
              onClick={retryLoadingDoctors}
              disabled={isLoadingDoctors}
              className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingDoctors ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Retry
            </button>
          </div>
        ) : null}

        {!isLoadingDoctors && !doctorsError && doctors.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-[#283C5D]/10 bg-[#283C5D]/5 px-4 py-4 text-sm text-[#283C5D]/70">
            No doctor accounts with profiles were found.
          </div>
        ) : null}

        {selectedDoctor ? (
          <DoctorProcedureEditor
            key={selectedDoctor.userId}
            doctor={selectedDoctor}
          />
        ) : null}
      </div>
    </section>
  );
}

type DoctorProcedureEditorProps = {
  doctor: DoctorSummary;
};

function DoctorProcedureEditor({ doctor }: DoctorProcedureEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>(
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProcedures() {
      try {
        const response = await fetch(
          `/api/admin/doctors/${encodeURIComponent(doctor.userId)}/procedures`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = (await response.json()) as
          | DoctorProcedureResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Could not load the doctor's procedures.",
          );
        }

        if (controller.signal.aborted) return;

        const doctorData = data as DoctorProcedureResponse;

        setSpecialtyIds(doctorData.specialtyIds);
        setSelectedSubcategoryIds(doctorData.subcategoryIds);
        setSelectedProcedureIds(doctorData.procedureIds);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the doctor's procedures.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchProcedures();

    return () => {
      controller.abort();
    };
  }, [doctor.userId, reloadKey]);

  function retryLoadingProcedures() {
    setIsLoading(true);
    setError(null);
    setReloadKey((currentKey) => currentKey + 1);
  }

  async function saveProcedures(input: {
    subcategoryIds: string[];
    procedureIds: string[];
  }) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/doctors/${encodeURIComponent(doctor.userId)}/procedures`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subcategoryIds: input.subcategoryIds,
            procedureIds: input.procedureIds,
          }),
        },
      );

      const data = (await response.json()) as
        | DoctorProcedureResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Could not update the doctor's procedures.",
        );
      }

      const doctorData = data as DoctorProcedureResponse;

      setSpecialtyIds(doctorData.specialtyIds);
      setSelectedSubcategoryIds(doctorData.subcategoryIds);
      setSelectedProcedureIds(doctorData.procedureIds);
      setIsModalOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update the doctor's procedures.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-6 border-t border-[#283C5D]/10 pt-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#283C5D]">
            {getDoctorLabel(doctor)}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {doctor.clinicName?.trim() || doctor.email}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Add or remove procedures from this doctor public profile.
          </p>
        </div>

        <div className="rounded-2xl border border-[#D8BD8D]/40 bg-[#D8BD8D]/10 px-4 py-3 text-center sm:min-w-32">
          <p className="text-2xl font-semibold text-[#283C5D]">
            {isLoading ? "—" : selectedProcedureIds.length}
          </p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-[#283C5D]/60">
            Procedures
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading || isSaving || Boolean(error)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f304c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading || isSaving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Settings2 size={17} />
          )}
          {isSaving ? "Saving…" : "Select procedures"}
        </button>

        {error ? (
          <button
            type="button"
            onClick={retryLoadingProcedures}
            disabled={isLoading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#283C5D]/15 px-5 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Retry
          </button>
        ) : null}
      </div>
{isModalOpen ? (
  <CategoryProcedureModal
    open
    specialtyIds={specialtyIds}
    selectedCategoryIds={selectedSubcategoryIds}
    selectedProcedureIds={selectedProcedureIds}
    saveEndpoint={`/api/admin/doctors/${encodeURIComponent(
      doctor.userId,
    )}/procedures`}
    onClose={() => {
      setIsModalOpen(false);
    }}
    onSaved={({ subcategoryIds, procedureIds }) => {
      setSelectedSubcategoryIds(subcategoryIds);
      setSelectedProcedureIds(procedureIds);
      setIsModalOpen(false);
    }}
  />
) : null}
    </div>
  );
}