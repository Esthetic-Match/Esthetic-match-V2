"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

type DeleteGalleryCaseModalProps = {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteGalleryCaseModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteGalleryCaseModalProps) {
  const t = useTranslations("dashboard.editGallery.deleteModal");
  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283C5D]/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-[2rem] border border-[#283C5D]/10 bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#283C5D]/50 transition hover:bg-[#FAF9F7] hover:text-[#283C5D] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <h2 className="text-xl font-bold text-[#283C5D]">
        {t("title")}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#283C5D]/60">
        {t("description")}
      </p>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="rounded-full border border-[#283C5D]/10 px-5 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-[#FAF9F7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("cancel")}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}

          {isDeleting ? t("deleting") : t("delete")}
        </button>
      </div>
    </div>
  </div>
);
}
