"use client";

import { Eye, EyeOff, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GalleryCaseActionsMenuProps = {
  isPublic: boolean;
  isVisibilitySaving: boolean;
  onToggleVisibility: () => void;
  onDeleteClick: () => void;
};

export default function GalleryCaseActionsMenu({
  isPublic,
  isVisibilitySaving,
  onToggleVisibility,
  onDeleteClick,
}: GalleryCaseActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleToggleVisibility() {
    setIsOpen(false);
    onToggleVisibility();
  }

  return (
    <div ref={menuRef} className="absolute right-4 top-4 z-20">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-[#283C5D] shadow-sm transition hover:bg-[#FAF9F7] active:scale-95"
        aria-label="Open case actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-[#283C5D]/10 bg-white p-2 shadow-xl">
          <button
            type="button"
            onClick={handleToggleVisibility}
            disabled={isVisibilitySaving}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#283C5D] transition hover:bg-[#FAF9F7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVisibilitySaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPublic ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}

            {isPublic ? "Make case private" : "Make case public"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDeleteClick();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete case
          </button>
        </div>
      )}
    </div>
  );
}