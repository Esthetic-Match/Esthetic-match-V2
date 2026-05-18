"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import GalleryField from "./GalleryField";
import GalleryImage from "./GalleryImage";
import GalleryCaseActionsMenu from "./GalleryCaseActionsMenu";
import DeleteGalleryCaseModal from "./DeleteGalleryCaseModal";
import type { GalleryCase, GalleryEditableField } from "./types";
import { ChevronDown } from "lucide-react";
import ProcedureSelectModal, {
  formatProcedureLabel,
} from "./ProcedureSelectModal";

type EditGalleryCaseCardProps = {
  item: GalleryCase;
  index: number;
  savingId: string | null;
  deletingId: string | null;
  visibilitySavingId: string | null;
  procedureIds?: string[] | null;
  onUpdate: (
    caseId: string,
    field: GalleryEditableField,
    value: string
  ) => void;
  onSave: (item: GalleryCase) => void;
  onDelete: (caseId: string) => void;
  onToggleVisibility: (item: GalleryCase) => void;
};

const inputClassName =
  "w-full rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]";
  

export default function EditGalleryCaseCard({
  item,
  index,
  savingId,
  deletingId,
  onUpdate,
  onSave,
  onDelete,
  visibilitySavingId,
  onToggleVisibility,
  procedureIds,
}: EditGalleryCaseCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);

  const isSaving = savingId === item.id;
  const isDeleting = deletingId === item.id;
  const isVisibilitySaving = visibilitySavingId === item.id;

  return (
    <>
      <article className="relative grid gap-6 rounded-[2rem] border border-[#283C5D]/10 bg-white p-4 shadow-sm md:grid-cols-[1.1fr_0.9fr] md:p-6">
        <GalleryCaseActionsMenu
          isPublic={item.isPublic}
          isVisibilitySaving={isVisibilitySaving}
          onToggleVisibility={() => onToggleVisibility(item)}
          onDeleteClick={() => setIsDeleteModalOpen(true)}
        />

        <div className="grid h-full gap-4 sm:grid-cols-2">
          <GalleryImage label="Before" imagePath={item.beforeImage} />
          <GalleryImage label="After" imagePath={item.afterImage} />
        </div>

        <div className="flex flex-col pr-10">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/40">
              {item.isPublic ? "Public" : "Private"}
              <span className="ml-4 inline-flex w-fit rounded-full bg-[#FAF9F7] px-3 py-1 text-xs font-semibold text-[#283C5D]/60">
                Case {index + 1}
              </span>
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#283C5D]">
              Gallery details
            </h2>
          </div>

          <div className="space-y-4">
            <GalleryField label="Title">
              <input
                value={item.title}
                onChange={(event) =>
                  onUpdate(item.id, "title", event.target.value)
                }
                placeholder="Example: Jawline refinement"
                className={inputClassName}
              />
            </GalleryField>

            <GalleryField label="Procedure">
              <button
                type="button"
                onClick={() => setIsProcedureModalOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] px-4 py-3 text-left text-sm text-[#283C5D] outline-none transition hover:border-[#d8bd8d]"
              >
                <span className={item.procedure ? "font-medium" : "text-[#283C5D]/40"}>
                  {item.procedure
                    ? formatProcedureLabel(item.procedure)
                    : "Select procedure"}
                </span>
                  
                <ChevronDown className="h-4 w-4 text-[#283C5D]/40" />
              </button>
            </GalleryField>

            <GalleryField label="Description">
              <textarea
                value={item.notes}
                onChange={(event) =>
                  onUpdate(item.id, "notes", event.target.value)
                }
                placeholder="Add a short description for this case..."
                rows={5}
                className={`${inputClassName} resize-none leading-6`}
              />
            </GalleryField>
          </div>

          <button
            type="button"
            onClick={() => onSave(item)}
            disabled={isSaving || isDeleting}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </article>

      <DeleteGalleryCaseModal
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDelete(item.id)}
      />
      <ProcedureSelectModal
        isOpen={isProcedureModalOpen}
        selectedProcedure={item.procedure}
        procedureIds={procedureIds}
        onClose={() => setIsProcedureModalOpen(false)}
        onSelect={(procedure) => onUpdate(item.id, "procedure", procedure)}
      />
    </>
  );
}