"use client";

import { useEffect, useState } from "react";

import {
  deleteDoctorGalleryCase,
  fetchDoctorGallery,
  toggleGalleryCaseVisibility,
  updateDoctorGalleryCase,
} from "./galleryApi";

import type {
  GalleryCase,
  GalleryEditableField,
} from "./types";

export function useEditGallery(userId: string) {
  const [gallery, setGallery] = useState<GalleryCase[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibilitySavingId, setVisibilitySavingId] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGallery() {
      try {
        setIsFetching(true);

        const galleryCases = await fetchDoctorGallery(userId);

        if (isMounted) {
          setGallery(galleryCases);
        }
      } catch (error) {
        console.error("Failed to load doctor gallery:", error);
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    if (userId) {
      void loadGallery();
    } else {
      setGallery([]);
      setIsFetching(false);
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  function updateGalleryCase(
    caseId: string,
    field: GalleryEditableField,
    value: string
  ) {
    setGallery((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  async function saveGalleryCase(item: GalleryCase) {
    try {
      setSavingId(item.id);

      const updatedCase = await updateDoctorGalleryCase(item);

      /*
       * Keep local state synchronized with the database response.
       *
       * This is especially useful now that procedureId is a real relation
       * field rather than the old free-text "procedure" value.
       */
      if (updatedCase) {
        setGallery((prev) =>
          prev.map((caseItem) =>
            caseItem.id === item.id
              ? {
                  ...caseItem,
                  ...updatedCase,
                }
              : caseItem
          )
        );
      }
    } catch (error) {
      console.error("Failed to save gallery case:", error);
    } finally {
      setSavingId(null);
    }
  }

  async function deleteGalleryCase(caseId: string) {
    try {
      setDeletingId(caseId);

      await deleteDoctorGalleryCase(caseId);

      setGallery((prev) =>
        prev.filter((item) => item.id !== caseId)
      );
    } catch (error) {
      console.error("Failed to delete gallery case:", error);
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleCaseVisibility(item: GalleryCase) {
    try {
      setVisibilitySavingId(item.id);

      const nextIsPublic = !item.isPublic;

      await toggleGalleryCaseVisibility(
        item.id,
        nextIsPublic
      );

      setGallery((prev) =>
        prev.map((caseItem) =>
          caseItem.id === item.id
            ? {
                ...caseItem,
                isPublic: nextIsPublic,
              }
            : caseItem
        )
      );
    } catch (error) {
      console.error(
        "Failed to update gallery case visibility:",
        error
      );
    } finally {
      setVisibilitySavingId(null);
    }
  }

  return {
    gallery,
    isFetching,
    savingId,
    deletingId,
    visibilitySavingId,
    updateGalleryCase,
    saveGalleryCase,
    deleteGalleryCase,
    toggleCaseVisibility,
  };
}