// utils/formatLabel.ts
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