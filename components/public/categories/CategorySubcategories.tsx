"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";

type Procedure = {
  id: string;
  name: string;
  label: string;
};

type Subcategory = {
  subcategory: string;
  title: string;
  description: string;
  procedures: readonly Procedure[];
};

type CategorySubcategoriesProps = {
  subcategories: readonly Subcategory[];
  title: string;
  selectedProceduresTitle: string;
  selectedProceduresDescription: string;
  chooseProceduresTitle: string;
  chooseProceduresDescription: string;
  findBestDoctors: string;
  chooseProceduresButton: string;
};

export default function CategorySubcategories({
  subcategories,
  title,
  selectedProceduresTitle,
  selectedProceduresDescription,
  chooseProceduresTitle,
  chooseProceduresDescription,
  findBestDoctors,
  chooseProceduresButton,
}: CategorySubcategoriesProps) {
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([]);

  const selectedProcedures = useMemo(() => {
    return subcategories
      .flatMap((subcategory) => subcategory.procedures)
      .filter((procedure) => selectedProcedureIds.includes(procedure.id));
  }, [subcategories, selectedProcedureIds]);

  const doctorsHref =
    selectedProcedureIds.length > 0
      ? `/doctors?procedures=${selectedProcedureIds.join(",")}`
      : "/doctors";

  function toggleProcedure(procedureId: string) {
    setSelectedProcedureIds((prev) => {
      if (prev.includes(procedureId)) {
        return prev.filter((id) => id !== procedureId);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, procedureId];
    });
  }

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-lg md:p-8">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]">
        {title}
      </h2>

      <div className="mt-5 rounded-3xl border border-[#d8bd8d]/40 bg-[#FAF9F7] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-bold text-[#283C5D]">
              {selectedProcedureIds.length > 0
                ? selectedProceduresTitle
                : chooseProceduresTitle}
            </h3>

            <p className="mt-1 text-sm text-[#283C5D]/60">
              {selectedProcedureIds.length > 0
                ? selectedProceduresDescription.replace(
                    "{count}",
                    String(selectedProcedureIds.length)
                  )
                : chooseProceduresDescription}
            </p>
          </div>

          {selectedProcedureIds.length > 0 ? (
            <Link
              href={doctorsHref}
              className="inline-flex shrink-0 justify-center rounded-full bg-[#d8bd8d] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#061A2D] transition hover:bg-[#f4e4c6]"
            >
              {findBestDoctors}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex shrink-0 cursor-not-allowed justify-center rounded-full bg-[#283C5D]/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#283C5D]/45"
            >
              {chooseProceduresButton}
            </button>
          )}
        </div>

        {selectedProcedures.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {selectedProcedures.map((procedure) => (
              <button
                key={procedure.id}
                type="button"
                onClick={() => toggleProcedure(procedure.id)}
                className="rounded-full border border-[#283C5D] bg-[#283C5D] px-4 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:bg-[#A74848] active:scale-[0.97]"
              >
                {procedure.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-7 grid gap-5">
        {subcategories.map((subcategory) => (
          <details
            key={subcategory.subcategory}
            className="group rounded-2xl border border-black/10 bg-[#FAF9F7] p-5"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#283C5D]">
                  {subcategory.title}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#283C5D]/60">
                  {subcategory.description}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#d8bd8d]">
                {subcategory.procedures.length} procedures
              </span>
            </summary>

            <div className="mt-5 flex flex-wrap gap-2">
              {subcategory.procedures.map((procedure) => {
                const selected = selectedProcedureIds.includes(procedure.id);
                const disabled = !selected && selectedProcedureIds.length >= 3;

                return (
                  <button
                    key={procedure.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleProcedure(procedure.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97] cursor-pointer ${
                      selected
                        ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-[#A74848]"
                        : "border-black/10 bg-white text-[#283C5D]/70 hover:border-[#d8bd8d] hover:text-[#283C5D]"
                    } ${
                      disabled
                        ? "cursor-not-allowed opacity-40 hover:border-black/10 hover:text-[#283C5D]/70"
                        : ""
                    }`}
                  >
                    {procedure.label}
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}