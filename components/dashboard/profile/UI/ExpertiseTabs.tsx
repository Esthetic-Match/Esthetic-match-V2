"use client";

import { JSX, useMemo, useState } from "react";

export type ExpertiseProcedure = {
  id: string;
  label: string;
};

export type ExpertiseSubcategoryGroup = {
  subcategoryId: string;
  label: string;
  procedures: ExpertiseProcedure[];
};

export type ExpertiseCategoryGroup = {
  categoryId: string;
  label: string;
  subcategories: ExpertiseSubcategoryGroup[];
};

type ExpertiseTabsProps = {
  categories: ExpertiseCategoryGroup[];
  ariaLabel: string;
  noProceduresLabel: string;
};

export function ExpertiseTabs({
  categories,
  ariaLabel,
  noProceduresLabel,
}: ExpertiseTabsProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.categoryId ?? ""
  );

  const activeCategory = useMemo<ExpertiseCategoryGroup | null>(() => {
    return (
      categories.find(
        (category): boolean => category.categoryId === activeCategoryId
      ) ??
      categories[0] ??
      null
    );
  }, [activeCategoryId, categories]);

  if (categories.length === 0 || activeCategory === null) {
    return <p className="text-sm text-[#283C5D]/55">{noProceduresLabel}</p>;
  }

  return (
    <div className="space-y-7">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={[
          "flex gap-8 overflow-x-auto border-b border-[#283C5D]/10 pb-1",
          "[scrollbar-width:thin]",
          "[scrollbar-color:#d8bd8d_transparent]",
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:rounded-full",
          "[&::-webkit-scrollbar-track]:bg-[#283C5D]/5",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-[#d8bd8d]/70",
          "[&::-webkit-scrollbar-thumb:hover]:bg-[#d8bd8d]",
        ].join(" ")}
      >
        {categories.map((category): JSX.Element => {
          const isActive = category.categoryId === activeCategory.categoryId;

          return (
            <button
              key={category.categoryId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`expertise-panel-${category.categoryId}`}
              id={`expertise-tab-${category.categoryId}`}
              onClick={() => setActiveCategoryId(category.categoryId)}
              className={[
                "relative shrink-0 pb-4 text-sm font-bold uppercase tracking-[0.16em] transition-colors duration-300",
                "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-center after:transition-transform after:duration-300",
                isActive
                  ? "text-[#283C5D] after:scale-x-100 after:bg-[#d8bd8d]"
                  : "text-[#283C5D]/45 after:scale-x-0 after:bg-[#d8bd8d] hover:text-[#283C5D]/75 hover:after:scale-x-100",
              ].join(" ")}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`expertise-panel-${activeCategory.categoryId}`}
        aria-labelledby={`expertise-tab-${activeCategory.categoryId}`}
        className="rounded-[1.5rem] border border-[#283C5D]/10 bg-[#f9fafb] p-5 md:p-7"
      >
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-[#d8bd8d]" />

          <h3 className="text-center text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]">
            {activeCategory.label}
          </h3>

          <div className="h-px w-8 bg-[#d8bd8d]" />
        </div>

        <div className="space-y-6 text-center">
          {activeCategory.subcategories.map(
            (subcategory): JSX.Element => (
              <div key={subcategory.subcategoryId}>
                <h4 className="mb-3 text-sm font-semibold text-[#283C5D]/80">
                  {subcategory.label}
                </h4>

                {subcategory.procedures.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-3">
                    {subcategory.procedures.map(
                      (procedure): JSX.Element => (
                        <span
                          key={procedure.id}
                          className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm"
                        >
                          {procedure.label}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#283C5D]/45">
                    {noProceduresLabel}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}