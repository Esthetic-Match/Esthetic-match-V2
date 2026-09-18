"use client";

import {
  ImageIcon,
  Loader2,
  Upload,
  Video,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type Props = {
  purpose:
    | "TEMPLATE"
    | "CASE"
    | "PATIENT_MEDIA";

  templateId?: string;
  caseId?: string;

  accept?: "image" | "video";

  onUploaded: (media: {
    objectPath: string;
    publicUrl: string | null;
    contentType: string;
    sizeBytes: number;
  }) => void;
};

type SignedUploadResponse = {
  data?: {
    uploadUrl: string;

    uploadFields: Record<
      string,
      string
    >;

    objectPath: string;

    publicUrl: string | null;

    access:
      | "public"
      | "private";

    maxBytes: number;
  };

  uploadUrl?: string;

  uploadFields?: Record<
    string,
    string
  >;

  objectPath?: string;

  publicUrl?: string | null;

  access?: "public" | "private";

  maxBytes?: number;
};

function uploadToGcs({
  url,
  fields,
  file,
  onProgress,
}: {
  url: string;

  fields: Record<
    string,
    string
  >;

  file: File;

  onProgress: (
    progress: number,
  ) => void;
}) {
  return new Promise<void>(
    (resolve, reject) => {
      const xhr =
        new XMLHttpRequest();

      xhr.open(
        "POST",
        url,
      );

      xhr.upload.onprogress = (
        event,
      ) => {
        if (
          !event.lengthComputable
        ) {
          return;
        }

        onProgress(
          Math.round(
            (event.loaded /
              event.total) *
              100,
          ),
        );
      };

      xhr.onload = () => {
        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {
          resolve();
          return;
        }

        reject(
          new Error(
            "Media upload failed.",
          ),
        );
      };

      xhr.onerror = () => {
        reject(
          new Error(
            "Media upload failed.",
          ),
        );
      };

      const form =
        new FormData();

      Object.entries(
        fields,
      ).forEach(
        ([key, value]) => {
          form.append(
            key,
            value,
          );
        },
      );

      form.append(
        "file",
        file,
      );

      xhr.send(form);
    },
  );
}

export default function PostOpMediaUploader({
  purpose,
  templateId,
  caseId,
  accept = "image",
  onUploaded,
}: Props) {
  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    };
  }, [previewUrl]);

  async function handleFile(
    file: File,
  ) {
    setError(null);
    setProgress(0);

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    const localPreview =
      URL.createObjectURL(
        file,
      );

    setPreviewUrl(
      localPreview,
    );

    setUploading(true);

    try {
      const response =
        await fetch(
          "/api/post-op/media/upload-url",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              contentType:
                file.type,

              sizeBytes:
                file.size,

              purpose,

              templateId,

              caseId,
            }),
          },
        );

      const json =
        (await response.json()) as SignedUploadResponse;

      if (!response.ok) {
        throw new Error(
          "Failed to create upload URL.",
        );
      }

      /*
       * Handles either your apiSuccess()
       * wrapper or a direct payload.
       */
      const signed =
        json.data ?? json;

      if (
        !signed.uploadUrl ||
        !signed.uploadFields ||
        !signed.objectPath
      ) {
        throw new Error(
          "Invalid upload response.",
        );
      }

      await uploadToGcs({
        url:
          signed.uploadUrl,

        fields:
          signed.uploadFields,

        file,

        onProgress:
          setProgress,
      });

      setProgress(100);

      onUploaded({
        objectPath:
          signed.objectPath,

        publicUrl:
          signed.publicUrl ??
          null,

        contentType:
          file.type,

        sizeBytes:
          file.size,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  const accepts =
    accept === "image"
      ? "image/jpeg,image/png,image/webp"
      : "video/mp4,video/webm,video/quicktime";

  return (
    <div className="space-y-3">
      {previewUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-[#283C5D]/10 bg-neutral-50">
          {accept === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Upload preview"
              className="max-h-80 w-full object-contain"
            />
          ) : (
            <video
              src={previewUrl}
              controls
              className="max-h-80 w-full"
            />
          )}

          {!uploading && (
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(
                  previewUrl,
                );

                setPreviewUrl(
                  null,
                );
              }}
              className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      {uploading && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-neutral-500">
            <span>
              Uploading
            </span>

            <span>
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full bg-[#283C5D] transition-[width]"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#283C5D]/10 bg-white px-4 py-2.5 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D]/5">
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : accept ===
          "image" ? (
          <ImageIcon className="size-4" />
        ) : (
          <Video className="size-4" />
        )}

        {uploading
          ? "Uploading..."
          : `Upload ${accept}`}

        <input
          type="file"
          accept={accepts}
          disabled={uploading}
          className="hidden"
          onChange={(event) => {
            const file =
              event.target.files?.[0];

            if (file) {
              void handleFile(
                file,
              );
            }

            event.target.value =
              "";
          }}
        />
      </label>
    </div>
  );
}