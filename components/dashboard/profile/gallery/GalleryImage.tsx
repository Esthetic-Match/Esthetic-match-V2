"use client";

import { Download } from "lucide-react";
import PrivateGcsImage from "@/components/UI/PrivateGcsImage";

type GalleryImageProps = {
  label: string;
  imagePath: string | null;
};

export default function GalleryImage({ label, imagePath }: GalleryImageProps) {
async function handleDownload() {
  if (!imagePath) return;

  try {
    const res = await fetch("/api/images/read-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        objectPath: imagePath,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error ?? "Failed to create download URL");
    }

    const signedUrl = data.url || data.readUrl || data.signedUrl;

    if (!signedUrl) {
      throw new Error("Missing signed URL");
    }

    const link = document.createElement("a");
    link.href = signedUrl;
    link.download = `${label.toLowerCase()}-image`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
  }
}

  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
        {label}
      </p>

      <button
        type="button"
        onClick={handleDownload}
        disabled={!imagePath}
        className="group relative flex-1 overflow-hidden rounded-3xl bg-[#FAF9F7] disabled:cursor-default"
        aria-label={`Download ${label} image`}
      >
        {imagePath ? (
          <>
            <PrivateGcsImage
              objectPath={imagePath}
              alt={`${label} image`}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/25" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#283C5D] shadow-lg backdrop-blur-sm">
                <Download className="h-5 w-5" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#283C5D]/40">
            No image
          </div>
        )}
      </button>
    </div>
  );
}