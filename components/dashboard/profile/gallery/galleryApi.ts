import type { GalleryCase } from "./types";

export async function fetchDoctorGallery(userId: string): Promise<GalleryCase[]> {
  const res = await fetch(`/api/doctor-cases?doctorId=${userId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch gallery");
  }

  const data = await res.json();

  return data.map((item: any) => ({
    id: item.id,
    beforeImage: item.beforeImage ?? null,
    afterImage: item.afterImage ?? null,
    title: item.title ?? "",
    procedure: item.procedure ?? "",
    notes: item.notes ?? "",
    isPublic: Boolean(item.isPublic),
  }));
}

export async function updateDoctorGalleryCase(item: GalleryCase) {
  const res = await fetch(`/api/doctor-cases/${item.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: item.title,
      procedure: item.procedure,
      notes: item.notes,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error ?? "Failed to save gallery case");
  }

  return res.json();
}

export async function deleteDoctorGalleryCase(caseId: string) {
  const res = await fetch(`/api/doctor-cases/${caseId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error ?? "Failed to delete gallery case");
  }

  return res.json();
}

export async function toggleGalleryCaseVisibility(
  caseId: string,
  isPublic: boolean
) {
  const res = await fetch(`/api/doctor-cases/${caseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isPublic,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error ?? "Failed to update case visibility");
  }

  return res.json();
}