"use client";

import {
  ArrowUp,
} from "lucide-react";
import Image from "next/image";
import {
  useState,
} from "react";
import { useTranslations } from "next-intl";

type Props = {
  disabled?: boolean;

  onSubmit: (
    query: string,
  ) => void;
};

export default function LumiComposer({
  disabled = false,
  onSubmit,
}: Props) {
  const t = useTranslations(
    "lumi.LumiComposer",
  );

  const [value, setValue] =
    useState("");

  function handleSubmit() {
    const query =
      value.trim();

    if (
      !query ||
      disabled
    ) {
      return;
    }

    onSubmit(query);
    setValue("");
  }

  return (
    <div className="rounded-[1.75rem] border border-[#283C5D]/10 bg-white p-2 shadow-[0_16px_50px_rgba(40,60,93,0.10)]">
      <div className="flex items-center gap-3">
        <div className="relative ml-1 h-9 w-9 shrink-0 overflow-hidden rounded-full">
          <Image
            src="/images/lumi.png"
            alt="Lumi"
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>

        <textarea
          value={value}
          disabled={disabled}
          rows={1}
          onChange={(event) =>
            setValue(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={t(
            "placeholder",
          )}
          className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-sm leading-6 text-[#061A2D] outline-none placeholder:text-[#283C5D]/40 disabled:opacity-50 sm:text-[15px]"
        />

        <button
          type="button"
          disabled={
            disabled ||
            !value.trim()
          }
          onClick={
            handleSubmit
          }
          aria-label={t(
            "sendMessage",
          )}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#283C5D] text-white transition hover:bg-[#061A2D] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp
            size={18}
          />
        </button>
      </div>
    </div>
  );
}