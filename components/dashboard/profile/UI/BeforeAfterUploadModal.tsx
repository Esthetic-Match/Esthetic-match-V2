"use client";

import { useState } from "react";
import { X, ImagePlus, Upload } from "lucide-react";

type BeforeAfterUploadModalProps = {
  isOpen: boolean;
  doctorId: string;
  patientId?: string | null;
  procedureId?: string | null;
  title?: string;
  onClose: () => void;
  onUploaded: (data: {
    caseId: string;
    beforeImage: string;
    afterImage: string;
  }) => void;
};

export default function BeforeAfterUploadModal({
  isOpen,
  doctorId,
  patientId,
  procedureId,
  title,
  onClose,
  onUploaded,
}: BeforeAfterUploadModalProps) {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const selectedCount = Number(Boolean(beforeFile)) + Number(Boolean(afterFile));
  const canUpload = selectedCount === 2 && !isUploading;

  async function uploadPrivateImage(file: File, folder: string) {
    const signedUrlRes = await fetch("/api/images/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: file.type,
        access: "private",
        type: "medical",
        folder,
      }),
    });

    if (!signedUrlRes.ok) {
      throw new Error("Failed to create signed upload URL");
    }

    const { uploadUrl, objectPath } = await signedUrlRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload image");
    }

    return objectPath as string;
  }

  async function handleUpload() {
    if (!beforeFile || !afterFile) return;

    try {
      setIsUploading(true);

      const createCaseRes = await fetch("/api/doctor-cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          patientId,
          procedureId,
          title,
        }),
      });

      if (!createCaseRes.ok) {
        throw new Error("Failed to create case");
      }

      const createdCase = await createCaseRes.json();
      const caseId = createdCase.id;

      const basePath = `doctor-profile/${doctorId}/gallery/${caseId}`;

      const beforeImage = await uploadPrivateImage(
        beforeFile,
        `${basePath}/before`
      );

      const afterImage = await uploadPrivateImage(
        afterFile,
        `${basePath}/after`
      );

      const updateCaseRes = await fetch(`/api/doctor-cases/${caseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          beforeImage,
          afterImage,
        }),
      });

      if (!updateCaseRes.ok) {
        throw new Error("Failed to update case images");
      }

      onUploaded({
        caseId,
        beforeImage,
        afterImage,
      });

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
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#283C5D]">
              Upload Before & After Pictures
            </h2>
            <p className="mt-1 text-sm text-black/45">
              Select both images first, then upload them together.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/60 transition hover:bg-black/10 active:scale-[0.98]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ImageInputBox
            title="Before"
            file={beforeFile}
            onChange={setBeforeFile}
          />

          <ImageInputBox
            title="After"
            file={afterFile}
            onChange={setAfterFile}
          />
        </div>

        <button
          type="button"
          disabled={!canUpload}
          onClick={handleUpload}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          <Upload size={17} />
          {isUploading ? "Uploading..." : `Upload (${selectedCount}/2) images`}
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
  onChange: (file: File | null) => void;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <label className="block cursor-pointer">
      <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]">
        {title}
      </h3>

      <div className="relative flex min-h-[220px] overflow-hidden rounded-2xl border-2 border-dashed border-[#283C5D]/20 bg-[#FAF9F7] transition hover:border-[#d8bd8d]">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="truncate text-sm font-medium text-white">
                {file?.name}
              </p>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center p-5 text-center">
            <ImagePlus size={30} className="mb-3 text-[#283C5D]/60" />

            <p className="text-sm font-medium text-[#283C5D]">
              Choose {title.toLowerCase()} image
            </p>

            <p className="mt-1 text-xs text-[#283C5D]/45">
              JPG, PNG or WebP
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0] || null;
          onChange(selectedFile);
        }}
      />
    </label>
  );
}