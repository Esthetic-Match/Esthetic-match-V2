export type GalleryCase = {
  id: string;

  beforeImage: string | null;
  afterImage: string | null;

  title: string | null;
  notes: string | null;

  procedureId: string | null;

  isPublic: boolean;
};

export type GalleryEditableField =
  | "title"
  | "procedureId"
  | "notes";