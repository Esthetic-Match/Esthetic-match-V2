"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import Image from "next/image";

type ProcedureOption = {
  id: string;
  name: string;
  description: string | null;
};

type BeforeAfterUploadModalProps = {
  isOpen: boolean;
  doctorId: string;

  patientId?: string | null;
  procedureId?: string | null;
  title?: string;

  /*
   * Existing doctor dashboard usage.
   */
  procedureIds?: string[] | null;

  /*
   * Set true from the admin panel.
   */
  fetchAdminProcedures?: boolean;

  onClose: () => void;

  onUploaded: (data: {
    caseId: string;
    beforeImage: string;
    afterImage: string;
  }) => void;
};

function formatProcedureLabel(
  procedure: string
) {
  return procedure
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

export default function BeforeAfterUploadModal({
  isOpen,
  doctorId,
  patientId,
  procedureId,
  title,
  procedureIds,
  fetchAdminProcedures = false,
  onClose,
  onUploaded,
}: BeforeAfterUploadModalProps) {
  const t = useTranslations("dashboard");
  const procedureT =
    useTranslations("proceduresName");

  const locale = useLocale();

  const [caseTitle, setCaseTitle] =
    useState(title ?? "");

  const [description, setDescription] =
    useState("");

  const [
    selectedProcedure,
    setSelectedProcedure,
  ] = useState(procedureId ?? "");

  const [beforeFile, setBeforeFile] =
    useState<File | null>(null);

  const [afterFile, setAfterFile] =
    useState<File | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [
    isLoadingProcedures,
    setIsLoadingProcedures,
  ] = useState(false);

  const [
    adminProcedures,
    setAdminProcedures,
  ] = useState<ProcedureOption[]>([]);

  useEffect(() => {
    if (
      !isOpen ||
      !fetchAdminProcedures ||
      !doctorId
    ) {
      return;
    }

    let cancelled = false;

async function loadProcedures() {
  try {
    setIsLoadingProcedures(true);

    const response = await fetch(
      `/api/admin/doctors/${encodeURIComponent(
        doctorId
      )}/procedures?locale=${encodeURIComponent(
        locale
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load doctor procedures."
      );
    }

    const payload: unknown =
      await response.json();

    if (!isRecord(payload)) {
      return;
    }

    const data = isRecord(payload.data)
      ? payload.data
      : payload;

    const rawProcedures =
      data.procedures;

    if (!Array.isArray(rawProcedures)) {
      return;
    }

    const procedures: ProcedureOption[] =
      rawProcedures.flatMap((item) => {
        if (
          !isRecord(item) ||
          typeof item.id !== "string"
        ) {
          return [];
        }

        const translations =
          Array.isArray(item.translations)
            ? item.translations
            : [];

        const translation =
          translations.find(
            (translation) =>
              isRecord(translation) &&
              translation.localeCode ===
                locale
          ) ??
          translations.find(
            (translation) =>
              isRecord(translation) &&
              translation.localeCode ===
                "en"
          ) ??
          translations[0];

        if (!isRecord(translation)) {
          return [
            {
              id: item.id,
              name:
                formatProcedureLabel(
                  item.id
                ),
              description: null,
            },
          ];
        }

        return [
          {
            id: item.id,

            name:
              typeof translation.name ===
              "string"
                ? translation.name
                : formatProcedureLabel(
                    item.id
                  ),

            description:
              typeof translation.description ===
              "string"
                ? translation.description
                : null,
          },
        ];
      });

    if (!cancelled) {
      setAdminProcedures(procedures);
    }
  } catch (error) {
    console.error(
      "Could not load doctor procedures:",
      error
    );

    if (!cancelled) {
      setAdminProcedures([]);
    }
  } finally {
    if (!cancelled) {
      setIsLoadingProcedures(false);
    }
  }
}

    void loadProcedures();

    return () => {
      cancelled = true;
    };
  }, [
    doctorId,
    fetchAdminProcedures,
    isOpen,
    locale,
  ]);

  const procedures =
    useMemo<ProcedureOption[]>(() => {
      if (fetchAdminProcedures) {
        return adminProcedures;
      }

      return (procedureIds ?? []).map(
        (id) => ({
          id,

          name: procedureT.has(id)
            ? procedureT(id)
            : formatProcedureLabel(id),

          description: null,
        })
      );
    }, [
      adminProcedures,
      fetchAdminProcedures,
      procedureIds,
      procedureT,
    ]);

  if (!isOpen) {
    return null;
  }

  const selectedCount =
    Number(Boolean(beforeFile)) +
    Number(Boolean(afterFile));

  const canUpload =
    selectedCount === 2 && !isUploading;

  function handleProcedureClick(
    procedure: string
  ) {
    setSelectedProcedure((current) =>
      current === procedure
        ? ""
        : procedure
    );
  }

  async function uploadPrivateImage(
    file: File,
    folder: string
  ) {
    const signedUrlRes = await fetch(
      "/api/images/upload-url",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          contentType: file.type,
          access: "private",
          type: "medical",
          folder,
        }),
      }
    );

    if (!signedUrlRes.ok) {
      throw new Error(
        "Failed to create signed upload URL"
      );
    }

    const {
      uploadUrl,
      objectPath,
    } = await signedUrlRes.json();

    const uploadRes = await fetch(
      uploadUrl,
      {
        method: "PUT",

        headers: {
          "Content-Type": file.type,
        },

        body: file,
      }
    );

    if (!uploadRes.ok) {
      throw new Error(
        "Failed to upload image"
      );
    }

    return objectPath as string;
  }

  async function handleUpload() {
    if (!beforeFile || !afterFile) {
      return;
    }

    try {
      setIsUploading(true);

      const createCaseRes = await fetch(
        "/api/doctor-cases",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            doctorId,

            patientId:
              patientId || null,

            procedureId:
              selectedProcedure || null,

            title:
              caseTitle.trim() || null,

            notes:
              description.trim() || null,
          }),
        }
      );

      if (!createCaseRes.ok) {
        throw new Error(
          "Failed to create case"
        );
      }

      const createdCase =
        await createCaseRes.json();

      const caseId =
        createdCase.id;

      const basePath =
        `doctor-profile/${doctorId}/gallery/${caseId}`;

      const beforeImage =
        await uploadPrivateImage(
          beforeFile,
          `${basePath}/before`
        );

      const afterImage =
        await uploadPrivateImage(
          afterFile,
          `${basePath}/after`
        );

      const updateCaseRes = await fetch(
        `/api/doctor-cases/${caseId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            beforeImage,
            afterImage,

            title:
              caseTitle.trim() || null,

            notes:
              description.trim() || null,

            procedureId:
              selectedProcedure || null,
          }),
        }
      );

      if (!updateCaseRes.ok) {
        throw new Error(
          "Failed to update case images"
        );
      }

      onUploaded({
        caseId,
        beforeImage,
        afterImage,
      });

      setCaseTitle("");
      setDescription("");
      setSelectedProcedure("");
      setBeforeFile(null);
      setAfterFile(null);

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="esthetic-scrollbar max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#283C5D]">
              {t("galleryUpload.title")}
            </h2>

            <p className="mt-1 text-sm text-black/45">
              {t(
                "galleryUpload.description"
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/60 transition hover:bg-black/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#283C5D]">
              Title
            </label>

            <input
              value={caseTitle}
              onChange={(event) =>
                setCaseTitle(
                  event.target.value
                )
              }
              placeholder="Example: Jawline contouring result"
              className="w-full rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-3 text-sm text-[#283C5D] outline-none focus:border-[#d8bd8d]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#283C5D]">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Add optional notes about this case..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-3 text-sm text-[#283C5D] outline-none focus:border-[#d8bd8d]"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-[#283C5D]">
              Procedure type
            </label>

            {isLoadingProcedures ? (
              <div className="flex items-center gap-2 rounded-2xl bg-[#FAF9F7] px-4 py-4 text-sm text-[#283C5D]/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading procedures...
              </div>
            ) : procedures.length > 0 ? (
              <div className="grid gap-2">
                {procedures.map(
                  (procedure) => {
                    const isSelected =
                      selectedProcedure ===
                      procedure.id;

                    return (
                      <button
                        key={procedure.id}
                        type="button"
                        onClick={() =>
                          handleProcedureClick(
                            procedure.id
                          )
                        }
                        className={[
                          "rounded-2xl border px-4 py-3 text-left transition",
                          isSelected
                            ? "border-[#283C5D] bg-[#283C5D] text-white"
                            : "border-[#283C5D]/10 bg-[#FAF9F7] text-[#283C5D] hover:border-[#d8bd8d]",
                        ].join(" ")}
                      >
                        <p className="text-sm font-semibold">
                          {procedure.name}
                        </p>

                        {procedure.description ? (
                          <p
                            className={[
                              "mt-1 text-xs leading-5",
                              isSelected
                                ? "text-white/65"
                                : "text-[#283C5D]/50",
                            ].join(" ")}
                          >
                            {
                              procedure.description
                            }
                          </p>
                        ) : null}
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-[#283C5D]/15 bg-[#FAF9F7] px-4 py-3 text-sm text-[#283C5D]/50">
                No procedures added yet.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ImageInputBox
            title={t("gallery.before")}
            file={beforeFile}
            onChange={setBeforeFile}
          />

          <ImageInputBox
            title={t("gallery.after")}
            file={afterFile}
            onChange={setAfterFile}
          />
        </div>

        <button
          type="button"
          disabled={!canUpload}
          onClick={handleUpload}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
        >
          <Upload size={17} />

          {isUploading
            ? t(
                "galleryUpload.uploading"
              )
            : t("galleryUpload.upload", {
                count: selectedCount,
              })}
        </button>
      </div>
    </div>
  );
}

function ImageInputBox({
  title,
  file,
  onChange,
}: {
  title: string;
  file: File | null;
  onChange: (
    file: File | null
  ) => void;
}) {
  const t = useTranslations("dashboard");

  const previewUrl = file
    ? URL.createObjectURL(file)
    : null;

  return (
    <label className="block cursor-pointer">
      <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]">
        {title}
      </h3>

      <div className="relative flex min-h-[220px] overflow-hidden rounded-2xl border-2 border-dashed border-[#283C5D]/20 bg-[#FAF9F7] transition hover:border-[#d8bd8d]">
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="truncate text-sm font-medium text-white">
                {file?.name}
              </p>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center p-5 text-center">
            <ImagePlus
              size={30}
              className="mb-3 text-[#283C5D]/60"
            />

            <p className="text-sm font-medium text-[#283C5D]">
              {t(
                "galleryUpload.chooseImage",
                {
                  type: title.toLowerCase(),
                }
              )}
            </p>

            <p className="mt-1 text-xs text-[#283C5D]/45">
              {t(
                "galleryUpload.formats"
              )}
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onChange(
            event.target.files?.[0] ??
              null
          );
        }}
      />
    </label>
  );
}