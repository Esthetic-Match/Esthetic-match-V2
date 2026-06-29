"use client";

import { Search, X } from "lucide-react";
import type { ChangeEvent } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  className?: string;
  autoFocus?: boolean;
};

export function ProceduresSearchBar({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "",
  autoFocus = false,
}: SearchBarProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.currentTarget.value);
  }

  function handleClear() {
    onChange("");
  }

  return (
    <div className={["relative w-full", className].join(" ")}>
      <Search
        size={17}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#283C5D]/40"
      />

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] py-3 pl-11 pr-11 text-sm font-medium text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/35 focus:border-[#d8bd8d]/70 focus:bg-white focus:ring-4 focus:ring-[#d8bd8d]/15"
      />

      {value.length > 0 ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#283C5D]/40 transition hover:bg-[#283C5D]/10 hover:text-[#283C5D]"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}