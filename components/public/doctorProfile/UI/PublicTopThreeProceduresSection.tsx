"use client";

import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import PublicProcedureViewModal, {
  type PublicProcedureViewData,
} from "@/components/public/doctorProfile/modal/PublicProcedureViewModal";

type PublicTopThreeProceduresClientProps = {
  procedures: PublicProcedureViewData[];
};

export default function PublicTopThreeProceduresClient({
  procedures,
}: PublicTopThreeProceduresClientProps) {
  const t = useTranslations(
    "doctor.doctor.profile"
  );

  const [
    selectedProcedure,
    setSelectedProcedure,
  ] =
    useState<PublicProcedureViewData | null>(
      null
    );

  return (
    <>
      <div className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-6xl">
        <section className="relative overflow-hidden rounded-3xl border border-[#CEB591]/20 bg-white px-6 py-8 shadow-[0_18px_55px_rgba(40,60,93,0.08)] md:px-10 md:py-10">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-72 -translate-x-1/2 rounded-full bg-[#F1E1C6]/35 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#283C5D] md:text-2xl">
              {t("header.topProcedures")}
            </h2>

            <div className="mt-3 h-px w-16 bg-gradient-to-r from-transparent via-[#D8BD8D] to-transparent" />
          </div>

          <div className="relative mt-7 flex min-h-14 flex-wrap items-center justify-center gap-3">
            {procedures.length > 0 ? (
              procedures.map(
                (
                  procedure,
                  index
                ) => (
                  <button
                    key={procedure.id}
                    type="button"
                    onClick={() =>
                      setSelectedProcedure(
                        procedure
                      )
                    }
                    className="group flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D8BD8D]/40 bg-[#F8F3EA] px-5 py-2.5 text-center text-sm font-semibold text-[#283C5D] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D8BD8D] hover:bg-white hover:shadow-[0_10px_28px_rgba(40,60,93,0.12)] active:translate-y-0"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D8BD8D]/20 text-[10px] font-bold text-[#9B7C45]">
                      {index + 1}
                    </span>

                    <span className="break-words">
                      {procedure.label}
                    </span>

                    </button>
                )
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-[#283C5D]/15 bg-[#FAF9F7] px-6 py-4 text-center">
                <p className="text-sm font-medium text-[#283C5D]/55">
                  {t(
                    "header.noTopProcedures"
                  )}
                </p>
              </div>
            )}
          </div>

          {procedures.length > 0 && (
            <div className="relative mt-5 flex items-center justify-center gap-2 text-xs text-[#283C5D]/40">
              <Sparkles className="h-3.5 w-3.5 text-[#D8BD8D]" />

              <span>
                {t(
                  "header.clickProcedureToView"
                )}
              </span>
            </div>
          )}
        </section>
      </div>

      <PublicProcedureViewModal
        open={
          selectedProcedure !== null
        }
        procedure={
          selectedProcedure
        }
        onClose={() =>
          setSelectedProcedure(null)
        }
      />
    </>
  );
}