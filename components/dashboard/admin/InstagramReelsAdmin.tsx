"use client";

import { useEffect, useState } from "react";
import {
  Aperture,
  Check,
  Link2,
  LoaderCircle,
  Plus,
  Save,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

type DoctorOption = {
  id: string;
  name: string;
  clinicName: string | null;
  avatar: string | null;
  city: string | null;
  country: string | null;
};

type ReelDoctorProfile = {
  id: string;
  slug: string | null;
  clinicName: string;
  avatar: string | null;
  user: {
    name: string;
  };
};

type InstagramReelRecord = {
  id: string;
  url: string;
  sortOrder: number;
  doctorProfileId: string | null;
  doctorProfile: ReelDoctorProfile | null;
  createdAt: string;
  updatedAt: string;
};

type ReelDraft = {
  url: string;
  sortOrder: number;
  doctorProfileId: string | null;
};

type DoctorSelectorModalProps = {
  isOpen: boolean;
  selectedDoctorProfileId: string | null;
  onClose: () => void;
  onSelect: (
    doctor: DoctorOption | null
  ) => void;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

async function parseJsonResponse(
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

function getPayloadRecord(
  payload: unknown
): Record<string, unknown> | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function parseDoctorOptions(
  payload: unknown,
  unnamedDoctorLabel: string
): DoctorOption[] {
  const record = getPayloadRecord(payload);

  if (!record) {
    return [];
  }

  const possibleDoctors = Array.isArray(
    record.doctors
  )
    ? record.doctors
    : [];

  return possibleDoctors.reduce<DoctorOption[]>(
    (
      doctors: DoctorOption[],
      item: unknown
    ) => {
      if (
        !isRecord(item) ||
        typeof item.id !== "string"
      ) {
        return doctors;
      }

      const user = isRecord(item.user)
        ? item.user
        : null;

      const directName =
        readNullableString(item.name);

      const userName = user
        ? readNullableString(user.name)
        : null;

      doctors.push({
        id: item.id,
        name:
          directName ??
          userName ??
          unnamedDoctorLabel,
        clinicName: readNullableString(
          item.clinicName
        ),
        avatar: readNullableString(
          item.avatar
        ),
        city: readNullableString(item.city),
        country: readNullableString(
          item.country
        ),
      });

      return doctors;
    },
    []
  );
}

function readHasMore(
  payload: unknown
): boolean {
  const record = getPayloadRecord(payload);

  if (!record) {
    return false;
  }

  return record.hasMore === true;
}

function parseReelDoctorProfile(
  value: unknown
): ReelDoctorProfile | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.clinicName !== "string"
  ) {
    return null;
  }

  const user = isRecord(value.user)
    ? value.user
    : null;

  if (
    !user ||
    typeof user.name !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    slug: readNullableString(value.slug),
    clinicName: value.clinicName,
    avatar: readNullableString(
      value.avatar
    ),
    user: {
      name: user.name,
    },
  };
}

function parseReels(
  payload: unknown
): InstagramReelRecord[] {
  const record = getPayloadRecord(payload);

  if (
    !record ||
    !Array.isArray(record.reels)
  ) {
    return [];
  }

  return record.reels.reduce<
    InstagramReelRecord[]
  >(
    (
      reels: InstagramReelRecord[],
      item: unknown
    ) => {
      if (!isRecord(item)) {
        return reels;
      }

      if (
        typeof item.id !== "string" ||
        typeof item.url !== "string" ||
        typeof item.sortOrder !== "number"
      ) {
        return reels;
      }

      reels.push({
        id: item.id,
        url: item.url,
        sortOrder: item.sortOrder,
        doctorProfileId:
          readNullableString(
            item.doctorProfileId
          ),
        doctorProfile:
          parseReelDoctorProfile(
            item.doctorProfile
          ),
        createdAt:
          typeof item.createdAt ===
          "string"
            ? item.createdAt
            : "",
        updatedAt:
          typeof item.updatedAt ===
          "string"
            ? item.updatedAt
            : "",
      });

      return reels;
    },
    []
  );
}

function getDoctorLabel(
  doctor: DoctorOption
): string {
  if (doctor.clinicName) {
    return `${doctor.name} — ${doctor.clinicName}`;
  }

  return doctor.name;
}

function DoctorSelectorModal({
  isOpen,
  selectedDoctorProfileId,
  onClose,
  onSelect,
}: DoctorSelectorModalProps) {
  const t = useTranslations(
    "admin.instagramReelsAdmin"
  );

  const [doctors, setDoctors] = useState<
    DoctorOption[]
  >([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [hasLoaded, setHasLoaded] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || hasLoaded) {
      return;
    }

    let isActive = true;

    async function loadAllDoctors(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const allDoctors: DoctorOption[] = [];

        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(
            `/api/public-pages/doctor-profile?page=${page}&limit=100`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

          const payload =
            await parseJsonResponse(response);

          if (!response.ok) {
            console.error(
              "Doctor fetch failed:",
              payload
            );

            throw new Error(
              "Could not load doctors."
            );
          }

          const pageDoctors =
            parseDoctorOptions(
              payload,
              t("unnamedDoctor")
            );

          allDoctors.push(...pageDoctors);

          hasMore =
            readHasMore(payload);

          page += 1;

          if (pageDoctors.length === 0) {
            hasMore = false;
          }
        }

        if (!isActive) {
          return;
        }

        const uniqueDoctors =
          Array.from(
            new Map(
              allDoctors.map(
                (
                  doctor: DoctorOption
                ) => [
                  doctor.id,
                  doctor,
                ]
              )
            ).values()
          );

        setDoctors(uniqueDoctors);
        setHasLoaded(true);
      } catch (error) {
        console.error(
          "Could not load doctors:",
          error
        );

        if (!isActive) {
          return;
        }

        setErrorMessage(
          t("doctorSelector.loadError")
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAllDoctors();

    return () => {
      isActive = false;
    };
  }, [isOpen, hasLoaded, t]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  const filteredDoctors = doctors.filter(
    (doctor: DoctorOption) => {
      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        doctor.name,
        doctor.clinicName ?? "",
        doctor.city ?? "",
        doctor.country ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    }
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#182438]/60 px-4 py-6 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-[0_35px_100px_rgba(40,60,93,0.30)]">
        <div className="flex items-start justify-between border-b border-[#E7DDD0] px-5 py-5 md:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#283C5D] text-[#D8BD8D]">
              <Stethoscope size={20} />
            </span>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D8BD8D]">
                {t(
                  "doctorSelector.eyebrow"
                )}
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#283C5D]">
                {t(
                  "doctorSelector.title"
                )}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E7DDD0] text-[#283C5D] transition hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
            aria-label={t(
              "doctorSelector.closeAriaLabel"
            )}
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-[#E7DDD0] bg-[#FAF9F7] px-5 py-4 md:px-7">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D8BD8D]"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement>
              ) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder={t(
                "doctorSelector.searchPlaceholder"
              )}
              autoFocus
              className="h-12 w-full rounded-full border border-[#E7DDD0] bg-white pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/35 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          <button
            type="button"
            onClick={() =>
              onSelect(null)
            }
            className={`mb-3 flex w-full items-center justify-between rounded-[1.25rem] border p-4 text-left transition ${
              selectedDoctorProfileId ===
              null
                ? "border-[#D8BD8D] bg-[#FFF9ED]"
                : "border-[#E7DDD0] bg-[#FAF9F7] hover:border-[#D8BD8D]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#D8BD8D] shadow-sm">
                <Aperture size={18} />
              </span>

              <div>
                <p className="text-sm font-semibold text-[#283C5D]">
                  {t(
                    "generalReel.title"
                  )}
                </p>

                <p className="mt-0.5 text-xs text-[#283C5D]/50">
                  {t(
                    "generalReel.description"
                  )}
                </p>
              </div>
            </div>

            {selectedDoctorProfileId ===
            null ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D8BD8D] text-[#283C5D]">
                <Check size={15} />
              </span>
            ) : null}
          </button>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <LoaderCircle
                  size={24}
                  className="animate-spin text-[#D8BD8D]"
                />

                <p className="text-sm text-[#283C5D]/55">
                  {t(
                    "doctorSelector.loading"
                  )}
                </p>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading &&
          !errorMessage ? (
            <div className="space-y-2">
              {filteredDoctors.map(
                (
                  doctor: DoctorOption
                ) => {
                  const isSelected =
                    selectedDoctorProfileId ===
                    doctor.id;

                  const location = [
                    doctor.city,
                    doctor.country,
                  ]
                    .filter(
                      (
                        value:
                          | string
                          | null
                      ): value is string =>
                        value !== null
                    )
                    .join(", ");

                  return (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() =>
                        onSelect(doctor)
                      }
                      className={`flex w-full items-center justify-between gap-4 rounded-[1.25rem] border p-4 text-left transition ${
                        isSelected
                          ? "border-[#D8BD8D] bg-[#FFF9ED]"
                          : "border-[#E7DDD0] bg-white hover:border-[#D8BD8D] hover:bg-[#FAF9F7]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#283C5D] text-white">
                          {doctor.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={
                                doctor.avatar
                              }
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound
                              size={18}
                            />
                          )}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#283C5D]">
                            {doctor.name}
                          </p>

                          {doctor.clinicName ? (
                            <p className="mt-0.5 truncate text-xs text-[#283C5D]/60">
                              {
                                doctor.clinicName
                              }
                            </p>
                          ) : null}

                          {location ? (
                            <p className="mt-0.5 truncate text-xs text-[#283C5D]/40">
                              {location}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D8BD8D] text-[#283C5D]">
                          <Check
                            size={15}
                          />
                        </span>
                      ) : null}
                    </button>
                  );
                }
              )}

              {filteredDoctors.length ===
              0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-[#D8BD8D]/60 bg-[#FAF9F7] px-6 py-10 text-center">
                  <Search
                    size={24}
                    className="mx-auto text-[#D8BD8D]"
                  />

                  <p className="mt-3 font-semibold text-[#283C5D]">
                    {t(
                      "doctorSelector.emptyTitle"
                    )}
                  </p>

                  <p className="mt-1 text-sm text-[#283C5D]/50">
                    {t(
                      "doctorSelector.emptyDescription"
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function InstagramReelsAdmin() {
  const t = useTranslations(
    "admin.instagramReelsAdmin"
  );

  const [reels, setReels] = useState<
    InstagramReelRecord[]
  >([]);

  const [drafts, setDrafts] = useState<
    Record<string, ReelDraft>
  >({});

  const [newUrl, setNewUrl] =
    useState("");

  const [
    newDoctorProfileId,
    setNewDoctorProfileId,
  ] = useState<string | null>(null);

  const [newDoctor, setNewDoctor] =
    useState<DoctorOption | null>(null);

  const [
    doctorModalTarget,
    setDoctorModalTarget,
  ] = useState<"new" | string | null>(
    null
  );

  const [
    selectedDraftDoctors,
    setSelectedDraftDoctors,
  ] = useState<
    Record<string, DoctorOption | null>
  >({});

  const [isLoading, setIsLoading] =
    useState(true);

  const [isCreating, setIsCreating] =
    useState(false);

  const [busyId, setBusyId] = useState<
    string | null
  >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  async function loadReels(): Promise<void> {
    try {
      const response = await fetch(
        "/api/instagram-reels",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const payload =
        await parseJsonResponse(response);

      if (!response.ok) {
        console.error(
          "Load Reels failed:",
          payload
        );

        throw new Error(
          "Could not load Instagram Reels."
        );
      }

      const nextReels =
        parseReels(payload);

      const nextDrafts =
        nextReels.reduce<
          Record<string, ReelDraft>
        >(
          (
            result: Record<
              string,
              ReelDraft
            >,
            reel: InstagramReelRecord
          ) => {
            result[reel.id] = {
              url: reel.url,
              sortOrder: reel.sortOrder,
              doctorProfileId:
                reel.doctorProfileId,
            };

            return result;
          },
          {}
        );

      const nextDraftDoctors =
        nextReels.reduce<
          Record<
            string,
            DoctorOption | null
          >
        >(
          (
            result: Record<
              string,
              DoctorOption | null
            >,
            reel: InstagramReelRecord
          ) => {
            if (!reel.doctorProfile) {
              result[reel.id] = null;

              return result;
            }

            result[reel.id] = {
              id: reel.doctorProfile.id,
              name:
                reel.doctorProfile.user
                  .name,
              clinicName:
                reel.doctorProfile
                  .clinicName,
              avatar:
                reel.doctorProfile.avatar,
              city: null,
              country: null,
            };

            return result;
          },
          {}
        );

      setReels(nextReels);
      setDrafts(nextDrafts);

      setSelectedDraftDoctors(
        nextDraftDoctors
      );
    } catch (error) {
      console.error(
        "Could not load Instagram Reels:",
        error
      );

      setErrorMessage(
        t("errors.load")
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReels();
  }, []);

  function updateDraft(
    id: string,
    field: keyof ReelDraft,
    value: string | number | null
  ): void {
    setDrafts(
      (
        current: Record<
          string,
          ReelDraft
        >
      ): Record<string, ReelDraft> => ({
        ...current,

        [id]: {
          ...current[id],
          [field]: value,
        },
      })
    );
  }

  function handleDoctorSelected(
    doctor: DoctorOption | null
  ): void {
    if (doctorModalTarget === "new") {
      setNewDoctor(doctor);

      setNewDoctorProfileId(
        doctor?.id ?? null
      );

      setDoctorModalTarget(null);

      return;
    }

    if (
      typeof doctorModalTarget ===
      "string"
    ) {
      updateDraft(
        doctorModalTarget,
        "doctorProfileId",
        doctor?.id ?? null
      );

      setSelectedDraftDoctors(
        (
          current: Record<
            string,
            DoctorOption | null
          >
        ): Record<
          string,
          DoctorOption | null
        > => ({
          ...current,
          [doctorModalTarget]: doctor,
        })
      );

      setDoctorModalTarget(null);
    }
  }

  async function handleCreate(): Promise<void> {
    const cleanUrl = newUrl.trim();

    if (!cleanUrl) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/instagram-reels",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            url: cleanUrl,
            doctorProfileId:
              newDoctorProfileId,
          }),
        }
      );

      const payload =
        await parseJsonResponse(response);

      if (!response.ok) {
        console.error(
          "Create Reel failed:",
          payload
        );

        throw new Error(
          "Could not add Instagram Reel."
        );
      }

      setNewUrl("");
      setNewDoctor(null);
      setNewDoctorProfileId(null);

      await loadReels();
    } catch (error) {
      console.error(
        "Could not create Instagram Reel:",
        error
      );

      setErrorMessage(
        t("errors.create")
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSave(
    id: string
  ): Promise<void> {
    const draft = drafts[id];

    if (!draft) {
      return;
    }

    setBusyId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/instagram-reels",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id,
            url: draft.url,
            sortOrder: draft.sortOrder,
            doctorProfileId:
              draft.doctorProfileId,
          }),
        }
      );

      const payload =
        await parseJsonResponse(response);

      if (!response.ok) {
        console.error(
          "Update Reel failed:",
          payload
        );

        throw new Error(
          "Could not update Instagram Reel."
        );
      }

      await loadReels();
    } catch (error) {
      console.error(
        "Could not update Instagram Reel:",
        error
      );

      setErrorMessage(
        t("errors.update")
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(
    id: string
  ): Promise<void> {
    setBusyId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/instagram-reels",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id,
          }),
        }
      );

      const payload =
        await parseJsonResponse(response);

      if (!response.ok) {
        console.error(
          "Delete Reel failed:",
          payload
        );

        throw new Error(
          "Could not delete Instagram Reel."
        );
      }

      await loadReels();
    } catch (error) {
      console.error(
        "Could not delete Instagram Reel:",
        error
      );

      setErrorMessage(
        t("errors.delete")
      );
    } finally {
      setBusyId(null);
    }
  }

  const modalSelectedDoctorProfileId =
    doctorModalTarget === "new"
      ? newDoctorProfileId
      : typeof doctorModalTarget ===
          "string"
        ? drafts[doctorModalTarget]
            ?.doctorProfileId ?? null
        : null;

  return (
    <>
      <section className="rounded-[2rem] border border-[#E7DDD0] bg-white p-5 shadow-[0_24px_70px_rgba(40,60,93,0.10)] md:p-8">
        <div className="flex flex-col gap-6 border-b border-[#E7DDD0] pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#283C5D] text-[#D8BD8D] shadow-[0_12px_30px_rgba(40,60,93,0.20)]">
              <Aperture size={22} />
            </span>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D8BD8D]">
                {t("eyebrow")}
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#283C5D]">
                {t("title")}
              </h2>

              <p className="mt-1 text-sm text-[#283C5D]/55">
                {t("description")}
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full border border-[#E7DDD0] bg-[#FAF9F7] px-4 py-2 text-xs font-semibold text-[#283C5D]/65">
            {t("reelCount", {
              count: reels.length,
            })}
          </span>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[#E7DDD0] bg-[#FAF9F7] p-4 md:p-5">
          <label
            htmlFor="new-instagram-reel"
            className="text-sm font-semibold text-[#283C5D]"
          >
            {t("create.title")}
          </label>

          <p className="mt-1 text-xs text-[#283C5D]/50">
            {t("create.description")}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <div className="relative">
              <Link2
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8BD8D]"
              />

              <input
                id="new-instagram-reel"
                type="url"
                value={newUrl}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>
                ) =>
                  setNewUrl(
                    event.target.value
                  )
                }
                placeholder={t(
                  "create.urlPlaceholder"
                )}
                className="h-12 w-full rounded-full border border-[#E7DDD0] bg-white pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/30 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setDoctorModalTarget(
                    "new"
                  )
                }
                className="flex h-12 flex-1 items-center justify-between rounded-full border border-[#E7DDD0] bg-white px-4 text-left transition hover:border-[#D8BD8D]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Stethoscope
                    size={17}
                    className="shrink-0 text-[#D8BD8D]"
                  />

                  <span className="truncate text-sm font-medium text-[#283C5D]">
                    {newDoctor
                      ? getDoctorLabel(
                          newDoctor
                        )
                      : t(
                          "create.connectDoctor"
                        )}
                  </span>
                </span>

                <Search
                  size={16}
                  className="shrink-0 text-[#283C5D]/40"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleCreate()
                }
                disabled={
                  isCreating ||
                  !newUrl.trim()
                }
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-6 text-sm font-semibold text-white transition duration-300 hover:bg-[#D8BD8D] hover:text-[#283C5D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={17} />
                )}

                {t("create.button")}
              </button>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {isLoading
            ? [0, 1, 2].map(
                (item: number) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-[1.5rem] bg-[#FAF9F7]"
                  />
                )
              )
            : null}

          {!isLoading &&
          reels.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#D8BD8D]/60 bg-[#FAF9F7] px-6 py-12 text-center">
              <Aperture
                size={26}
                className="mx-auto text-[#D8BD8D]"
              />

              <p className="mt-3 font-semibold text-[#283C5D]">
                {t("emptyTitle")}
              </p>
            </div>
          ) : null}

          {reels.map(
            (
              reel: InstagramReelRecord
            ) => {
              const draft =
                drafts[reel.id];

              if (!draft) {
                return null;
              }

              const selectedDoctor =
                selectedDraftDoctors[
                  reel.id
                ] ?? null;

              const isBusy =
                busyId === reel.id;

              return (
                <div
                  key={reel.id}
                  className="rounded-[1.5rem] border border-[#E7DDD0] bg-[#FAF9F7] p-4 transition hover:border-[#D8BD8D]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-[#D8BD8D]">
                      <Aperture
                        size={17}
                      />
                    </span>

                    <input
                      type="url"
                      value={draft.url}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) =>
                        updateDraft(
                          reel.id,
                          "url",
                          event.target.value
                        )
                      }
                      className="h-11 min-w-0 flex-1 rounded-full border border-[#E7DDD0] bg-white px-4 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D]"
                    />

                    <input
                      type="number"
                      min={0}
                      value={
                        draft.sortOrder
                      }
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) =>
                        updateDraft(
                          reel.id,
                          "sortOrder",
                          Number(
                            event.target
                              .value
                          )
                        )
                      }
                      className="h-11 w-full rounded-full border border-[#E7DDD0] bg-white px-4 text-center text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D] md:w-20"
                      aria-label={t(
                        "sortOrderAriaLabel"
                      )}
                    />
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setDoctorModalTarget(
                          reel.id
                        )
                      }
                      className="flex h-11 min-w-0 flex-1 items-center justify-between rounded-full border border-[#E7DDD0] bg-white px-4 text-left transition hover:border-[#D8BD8D]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Stethoscope
                          size={16}
                          className="shrink-0 text-[#D8BD8D]"
                        />

                        <span className="truncate text-sm font-medium text-[#283C5D]">
                          {selectedDoctor
                            ? getDoctorLabel(
                                selectedDoctor
                              )
                            : t(
                                "generalReel.title"
                              )}
                        </span>
                      </span>

                      <Search
                        size={15}
                        className="shrink-0 text-[#283C5D]/40"
                      />
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void handleSave(
                            reel.id
                          )
                        }
                        disabled={isBusy}
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 text-sm font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D] disabled:opacity-50 sm:flex-none"
                      >
                        {isBusy ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Save
                            size={16}
                          />
                        )}

                        {t("actions.save")}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(
                            reel.id
                          )
                        }
                        disabled={isBusy}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label={t(
                          "actions.deleteAriaLabel"
                        )}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      <DoctorSelectorModal
        isOpen={
          doctorModalTarget !== null
        }
        selectedDoctorProfileId={
          modalSelectedDoctorProfileId
        }
        onClose={() =>
          setDoctorModalTarget(null)
        }
        onSelect={handleDoctorSelected}
      />
    </>
  );
}