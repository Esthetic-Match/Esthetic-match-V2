"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function DeleteAccount() {
  const router = useRouter();
  const t = useTranslations("settings.deleteAccount");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDeleteAccount() {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || t("errors.failed"));
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("errors.generic")
      );
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  }

  return (
    <>
      <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
        <div>
          <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
            {t("eyebrow")}
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
            {t("title")}
          </h2>

          <div className="my-4 border-t border-gray-300" />
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />

            <div>
              <h3 className="font-semibold text-red-700">
                {t("warningTitle")}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-red-600">
                {t("warningDescription")}
              </p>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {t("button")}
        </button>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-red-500">
                  {t("modal.eyebrow")}
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-[#283C5D]">
                  {t("modal.title")}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-[#283C5D]/60 transition hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#283C5D]/65">
              {t("modal.description")}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="flex-1 rounded-full border border-[#283C5D]/15 px-4 py-3 text-sm font-medium text-[#283C5D] transition hover:bg-[#FAF9F7]"
              >
                {t("modal.cancel")}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? t("modal.deleting") : t("modal.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}