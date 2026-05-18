export type GalleryCase = {
  id: string;
  beforeImage: string | null;
  afterImage: string | null;
  title: string;
  procedure: string;
  notes: string;
  isPublic: boolean;
};

export type GalleryEditableField = "title" | "procedure" | "notes";