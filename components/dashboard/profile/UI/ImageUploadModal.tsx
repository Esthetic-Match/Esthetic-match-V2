"use client";

import { X, Trash2 } from "lucide-react";
import UploadImageWidget from "@/components/UI/UploadImageWidget";

type EditBannerModalProps = {
  isOpen: boolean;
  ImagePath: string;
  currentImage?: string | null;
  onClose: () => void;
  onImageloaded: (url: string) => void;
  onDeleteBanner: () => void;
};

export default function ImageUploadModal({
  isOpen,
  ImagePath,
  currentImage,
  onClose,
  onImageloaded,
  onDeleteBanner,
}: EditBannerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#283C5D]">Upload New Image</h2>
            <p className="mt-1 text-sm text-black/45">
              Upload a new image or remove the current one.
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

        {currentImage ? (
          <button
            type="button"
            onClick={onDeleteBanner}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 active:scale-[0.98]"
          >
            <Trash2 size={16} />
            Delete Image
          </button>
        ) : null}

          <UploadImageWidget
            type="banner"
            access="public"
            uploadPath={ImagePath}
            label="Add a photo of clinic"
            onUploaded={(url) => {
              onImageloaded(url);
              onClose();
            }}
          />
      </div>
    </div>
  );
}