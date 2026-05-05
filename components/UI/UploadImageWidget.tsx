"use client";

import { useState } from "react";

type UploadImageWidgetProps = {
  type?: "profile" | "medical";
};

export default function UploadImageWidget({
  type = "profile",
}: UploadImageWidgetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setMessage(null);
  }

  async function handleUpload() {
    if (!file) {
      setMessage("Please select an image first.");
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
        }),
      });

      if (!signedUrlRes.ok) {
        throw new Error("Could not create upload URL.");
      }

      const { uploadUrl } = await signedUrlRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed.");
      }

      setMessage("Image uploaded successfully.");
      setFile(null);
    } catch (error) {
      setMessage("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-black">Upload image</p>
          <p className="text-xs text-gray-500">
            PNG, JPG or WEBP images are supported.
          </p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center transition hover:bg-gray-50">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected image preview"
              className="h-40 w-40 rounded-xl object-cover"
            />
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to select an image
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Image will upload securely to Google Cloud Storage
              </p>
            </div>
          )}
        </label>

        {file && (
          <p className="truncate text-xs text-gray-500">
            Selected: {file.name}
          </p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full rounded-full bg-[#283C5D] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}