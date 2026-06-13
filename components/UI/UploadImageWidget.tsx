"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type UploadAccess = "public" | "private";
type UploadType = "profile" | "medical" | "banner";

type UploadImageWidgetProps = {
  type?: UploadType;
  access?: UploadAccess;
  uploadPath: string;
  label?: string;
  onUploaded?: (url: string, objectPath: string) => void;
};

export default function UploadImageWidget({
  type = "profile",
  access = "private",
  uploadPath,
  label,
  onUploaded,
}: UploadImageWidgetProps) {
  const t = useTranslations("dashboard.uploadImageWidget");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setMessage(t("errors.invalidImage"));
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setMessage(null);
  }

  async function handleUpload() {
    if (!file) {
      setMessage(t("errors.selectFirst"));
      return;
    }

    try {
      setIsUploading(true);
      setMessage(null);

      const signedUrlRes = await fetch("/api/images/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: file.type,
          type,
          access,
          folder: uploadPath,
        }),
      });

      if (!signedUrlRes.ok) {
        throw new Error("Could not create upload URL.");
      }

      const data: {
        uploadUrl: string;
        publicUrl?: string | null;
        objectPath: string;
      } = await signedUrlRes.json();

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed.");
      }

      const returnedUrl =
        access === "public" && data.publicUrl
          ? data.publicUrl
          : data.objectPath;

      setMessage(t("success"));
      setFile(null);
      setPreviewUrl(null);

      onUploaded?.(returnedUrl, data.objectPath);
    } catch {
      setMessage(t("errors.generic"));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <label className="relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#283C5D] px-6 py-10 text-center transition hover:opacity-95">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={t("previewAlt")}
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
              <div className="h-full w-full bg-[url('/images/dashboard/medical-pattern.png')] bg-cover bg-center" />
            </div>

            <p className="relative z-10 text-sm font-semibold text-white">
              {label || t("defaultLabel")}
            </p>
          </>
        )}
      </label>

      {file && (
        <p className="truncate text-xs text-gray-500">
          {t("selected")} {file.name}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full rounded-full bg-[#283C5D] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? t("uploading") : t("upload")}
      </button>

      {message && (
        <p className="text-center text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}