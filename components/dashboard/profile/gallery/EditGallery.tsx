"use client";

import { useTranslations } from "next-intl";
import EditGalleryCaseCard from "./EditGalleryCaseCard";
import { useEditGallery } from "./useEditGallery";

type EditGalleryProps = {
  userId: string;
  procedureIds?: string[] | null;
};

export default function EditGallery({
  userId,
  procedureIds,
}: EditGalleryProps) {
  const t = useTranslations("dashboard.editGallery");

  const {
    gallery,
    isFetching,
    savingId,
    deletingId,
    visibilitySavingId,
    updateGalleryCase,
    saveGalleryCase,
    deleteGalleryCase,
    toggleCaseVisibility,
  } = useEditGallery(userId);

  if (isFetching) {
    return (
      <section className="min-h-screen bg-[#FAF9F7] p-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center rounded-3xl bg-white p-12 text-[#283C5D]/60">
          {t("loading")}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FAF9F7] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            {t("eyebrow")}
          </p>

          <h1 className="mt-3 text-3xl font-bold text-[#283C5D]">
            {t("title")}
          </h1>
        </div>

        {gallery.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#283C5D]/20 bg-white p-12 text-center">
            <h2 className="text-xl font-bold text-[#283C5D]">
              {t("emptyTitle")}
            </h2>

            <p className="mt-3 text-sm text-[#283C5D]/60">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {gallery.map((item, index) => (
              <EditGalleryCaseCard
                key={item.id}
                item={item}
                index={index}
                savingId={savingId}
                deletingId={deletingId}
                visibilitySavingId={visibilitySavingId}
                procedureIds={procedureIds}
                onUpdate={updateGalleryCase}
                onSave={saveGalleryCase}
                onDelete={deleteGalleryCase}
                onToggleVisibility={toggleCaseVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}