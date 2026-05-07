import type { DoctorProfileData } from "@/components/dashboard/profile/types";

export function formatLabel(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

type UpdateFn = (
  data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
) => Promise<void> | void;

export async function handleImageUpload({
  newUrl,
  currentValue,
  fallbackValue,
  setValue,
  field,
  onUpdateProfile,
}: {
  newUrl: string | null;
  currentValue: string | null;
  fallbackValue?: string;
  setValue: (val: string | null) => void;
  field: keyof DoctorProfileData;
  onUpdateProfile: UpdateFn;
}) {
  const previous = currentValue;

  setValue(newUrl ?? fallbackValue ?? null);

  try {
    await onUpdateProfile({
      [field]: newUrl,
    });
  } catch {
    setValue(previous);
  }
}