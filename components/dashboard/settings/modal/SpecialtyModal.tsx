"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils/utils";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type CatalogueSpecialtyGroup = {
  id: string;
  name: string;
  sortOrder: number;
};

type CatalogueSpecialty = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  group: CatalogueSpecialtyGroup;
};

type CatalogueResponse = {
  success: boolean;
  specialties?: CatalogueSpecialty[];
  error?: string;
};

type SpecialtyModalProps = {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSaved?: (
    updatedIds: string[],
  ) => void;

  saveEndpoint?: string;
};

/* ═════════════════════════════════════
   COMPONENT
═════════════════════════════════════ */

export default function SpecialtyModal({
  open,
  selectedIds,
  onClose,
  onSaved,
  saveEndpoint = "/api/doctor-profile",
}: SpecialtyModalProps) {
  const t =
    useTranslations("settings");

  const locale = useLocale();

  const router = useRouter();

  const wasOpenRef =
    useRef(false);

  /* ═══════════════════════════════════
     CATALOGUE
  ═══════════════════════════════════ */

  const [
    specialties,
    setSpecialties,
  ] = useState<
    CatalogueSpecialty[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState<string | null>(
    null,
  );

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  /* ═══════════════════════════════════
     SELECTION
  ═══════════════════════════════════ */

  const [
    localSelectedIds,
    setLocalSelectedIds,
  ] = useState<string[]>(
    selectedIds,
  );

  /* ═══════════════════════════════════
     SAVE STATE
  ═══════════════════════════════════ */

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState<string | null>(
    null,
  );

  /* ═══════════════════════════════════
     RESET WHEN MODAL OPENS
  ═══════════════════════════════════ */

  useEffect(() => {
    if (
      open &&
      !wasOpenRef.current
    ) {
      setLocalSelectedIds(
        selectedIds,
      );

      setSaveError(null);
      setLoadError(null);
    }

    wasOpenRef.current = open;
  }, [
    open,
    selectedIds,
  ]);

  /*
   * If the parent changes selectedIds
   * while the modal is already open,
   * keep the modal synchronized.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setLocalSelectedIds(
      selectedIds,
    );
  }, [
    open,
    selectedIds,
  ]);

  /* ═══════════════════════════════════
     LOAD SPECIALTIES
  ═══════════════════════════════════ */

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller =
      new AbortController();

    async function loadSpecialties() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response =
          await fetch(
            `/api/doctor-catalogue?locale=${encodeURIComponent(
              locale,
            )}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const data =
          (await response
            .json()
            .catch(() => null)) as
            | CatalogueResponse
            | null;

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Could not load specialties.",
          );
        }

        if (
          !data ||
          !Array.isArray(
            data.specialties,
          )
        ) {
          throw new Error(
            "The specialty catalogue response was invalid.",
          );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setSpecialties(
          data.specialties,
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setSpecialties([]);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load specialties.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoading(false);
        }
      }
    }

    void loadSpecialties();

    return () => {
      controller.abort();
    };
  }, [
    open,
    locale,
    reloadKey,
  ]);

  /* ═══════════════════════════════════
     GROUP SPECIALTIES
  ═══════════════════════════════════ */

  const groupedSpecialties =
    useMemo(() => {
      const groups =
        new Map<
          string,
          {
            id: string;
            name: string;
            sortOrder: number;
            specialties: CatalogueSpecialty[];
          }
        >();

      for (
        const specialty of specialties
      ) {
        const existing =
          groups.get(
            specialty.group.id,
          );

        if (existing) {
          existing.specialties.push(
            specialty,
          );

          continue;
        }

        groups.set(
          specialty.group.id,
          {
            id:
              specialty.group.id,

            name:
              specialty.group.name,

            sortOrder:
              specialty.group.sortOrder,

            specialties: [
              specialty,
            ],
          },
        );
      }

      return Array.from(
        groups.values(),
      )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder,
        )
        .map((group) => ({
          ...group,

          specialties: [
            ...group.specialties,
          ].sort(
            (a, b) =>
              a.sortOrder -
              b.sortOrder,
          ),
        }));
    }, [specialties]);

  /* ═══════════════════════════════════
     TOGGLE
  ═══════════════════════════════════ */

  function toggleItem(
    id: string,
  ) {
    setLocalSelectedIds(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (item) =>
                item !== id,
            )
          : [
              ...previous,
              id,
            ],
    );
  }

  /* ═══════════════════════════════════
     SAVE
  ═══════════════════════════════════ */

  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveError(null);

      /*
       * Only allow IDs which currently
       * exist in the catalogue.
       */
      const availableIds =
        new Set(
          specialties.map(
            (specialty) =>
              specialty.id,
          ),
        );

      const validSelectedIds =
        localSelectedIds.filter(
          (id) =>
            availableIds.has(id),
        );

      const response =
        await fetch(
          saveEndpoint,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              specialtyIds:
                validSelectedIds,
            }),
          },
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | {
              error?: string;
              message?: string;
            }
          | null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Could not update doctor profile.",
        );
      }

      setLocalSelectedIds(
        validSelectedIds,
      );

      onSaved?.(
        validSelectedIds,
      );

      router.refresh();

      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not update doctor profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ═══════════════════════════════════
     CLOSED
  ═══════════════════════════════════ */

  if (!open) {
    return null;
  }

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* ═════════════════════════════
            HEADER
        ═════════════════════════════ */}

        <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
              {t(
                "specialtiesModal.profileLabel",
              )}
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
              {t(
                "specialtiesModal.title",
              )}
            </h2>

            {localSelectedIds.length >
            0 ? (
              <p className="mt-1 text-xs text-[#283C5D]/45">
                {
                  localSelectedIds.length
                }{" "}
                selected
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSaving
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* ═════════════════════════════
            CONTENT
        ═════════════════════════════ */}

        <div className="esthetic-scrollbar min-h-[240px] flex-1 overflow-y-auto bg-[#FAF9F7] p-6">

          {/* ───────────────────────────
              Loading
          ─────────────────────────── */}

          {isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-[#283C5D]/60">
                <Loader2 className="h-7 w-7 animate-spin text-[#d8bd8d]" />

                <p className="text-sm font-medium">
                  Loading specialties…
                </p>
              </div>
            </div>
          ) : loadError ? (
            /* ─────────────────────────
               Error
            ───────────────────────── */

            <div className="flex min-h-[280px] items-center justify-center">
              <div className="w-full max-w-md rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

                <p className="mt-4 text-sm font-semibold text-red-700">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setReloadKey(
                      (
                        previous,
                      ) =>
                        previous + 1,
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f304c]"
                >
                  <RefreshCw
                    size={15}
                  />

                  Retry
                </button>
              </div>
            </div>
          ) : specialties.length ===
            0 ? (
            /* ─────────────────────────
               Empty catalogue
            ───────────────────────── */

            <div className="flex min-h-[280px] items-center justify-center">
              <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-[#283C5D]/60">
                No specialties are
                currently available.
              </div>
            </div>
          ) : (
            /* ─────────────────────────
               Groups
            ───────────────────────── */

            <div className="space-y-7">
              {groupedSpecialties.map(
                (group) => (
                  <section
                    key={
                      group.id
                    }
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#283C5D]/50">
                        {
                          group.name
                        }
                      </p>

                      <div className="h-px flex-1 bg-black/8" />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {group.specialties.map(
                        (
                          specialty,
                        ) => {
                          const isSelected =
                            localSelectedIds.includes(
                              specialty.id,
                            );

                          return (
                            <button
                              key={
                                specialty.id
                              }
                              type="button"
                              onClick={() =>
                                toggleItem(
                                  specialty.id,
                                )
                              }
                              className={cn(
                                "group rounded-full border px-4 py-2.5 text-sm font-medium transition active:scale-[0.97]",

                                isSelected
                                  ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-[#A74848]"
                                  : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white",
                              )}
                            >
                              {
                                specialty.name
                              }
                            </button>
                          );
                        },
                      )}
                    </div>
                  </section>
                ),
              )}
            </div>
          )}
        </div>

        {/* ═════════════════════════════
            SAVE ERROR
        ═════════════════════════════ */}

        {saveError ? (
          <div className="shrink-0 border-t border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
            {saveError}
          </div>
        ) : null}

        {/* ═════════════════════════════
            FOOTER
        ═════════════════════════════ */}

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-black/10 px-6 py-5">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSaving
            }
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-black/5 active:scale-[0.97] disabled:opacity-50"
          >
            {t(
              "specialtiesModal.cancel",
            )}
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              isSaving ||
              isLoading ||
              Boolean(
                loadError,
              )
            }
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-[#d8bd8d] px-7 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                {t(
                  "specialtiesModal.saving",
                )}
              </>
            ) : (
              t(
                "specialtiesModal.saveChanges",
              )
            )}
          </button>
        </div>
      </div>
    </div>
  );
}