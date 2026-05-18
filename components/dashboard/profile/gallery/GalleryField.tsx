import type { ReactNode } from "react";

type GalleryFieldProps = {
  label: string;
  children: ReactNode;
};

export default function GalleryField({ label, children }: GalleryFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#283C5D]">
        {label}
      </span>

      {children}
    </label>
  );
}