"use client";

import {
  ArrowUpRight,
  Stethoscope,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type {
  LumiProcedure,
} from "./types";

type Props = {
  procedure: LumiProcedure;

  aiDescription:
    | string
    | null;
};

export default function LumiProcedureCard({
  procedure,
  aiDescription,
}: Props) {
  const t = useTranslations(
    "lumi.LumiProcedureCard",
  );

  return (
    <article className="flex w-[280px] shrink-0 snap-start flex-col rounded-[1.5rem] border border-[#283C5D]/10 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-[320px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D8BD8D]/20 text-[#283C5D]">
          <Stethoscope
            size={17}
          />
        </div>

        <ArrowUpRight
          size={17}
          className="text-[#283C5D]/30"
        />
      </div>

      <h3 className="mt-4 text-[17px] font-semibold leading-snug text-[#061A2D]">
        {procedure.name}
      </h3>

      <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#283C5D]/65">
        {aiDescription ??
          procedure.description ??
          t(
            "fallbackDescription",
          )}
      </p>

      {procedure
        .subcategories
        .length > 0 && (
        <div className="mt-auto pt-4">
          <span className="inline-flex rounded-full bg-[#FAF9F7] px-3 py-1.5 text-[11px] font-medium text-[#283C5D]/70">
            {
              procedure
                .subcategories[0]
                ?.name
            }
          </span>
        </div>
      )}
    </article>
  );
}