"use client";

import { X, Star, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { cn } from "@/lib/utils";

type DoctorFiltersModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Procedure = {
  id: string;
  name: string;
};

type Subcategory = {
  subcategory: string;
  procedures: readonly Procedure[];
};

type Category = {
  category: string;
  subcategories: readonly Subcategory[];
};

export default function DoctorFiltersModal({
  isOpen,
  onClose,
}: DoctorFiltersModalProps) {
  const t = useTranslations("home.doctors.filters");
  const categoryT = useTranslations("categoriesName");
  const subcategoryT = useTranslations("subcategoriesName");
  const procedureT = useTranslations("proceduresName");
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([]);

  const selectedCategories = useMemo<Category[]>(() => {
    return DoctorCatalog.categories.filter((category) =>
      selectedCategoryIds.includes(category.category)
    ) as Category[];
  }, [selectedCategoryIds]);

const selectedProcedures = useMemo<Procedure[]>(() => {
  const procedures: Procedure[] = [];

  DoctorCatalog.categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.procedures.forEach((procedure) => {
        if (selectedProcedureIds.includes(procedure.id)) {
          procedures.push({
            id: procedure.id,
            name: procedure.name,
          });
        }
      });
    });
  });

  return procedures;
}, [selectedProcedureIds]);

  if (!isOpen) return null;

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((item) => item !== categoryId)
        : [...prev, categoryId]
    );
  }

  function toggleProcedure(procedureId: string) {
    setSelectedProcedureIds((prev) =>
      prev.includes(procedureId)
        ? prev.filter((item) => item !== procedureId)
        : [...prev, procedureId]
    );
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (location.trim()) params.set("location", location.trim());
    if (minRating) params.set("minRating", minRating);

    if (selectedCategoryIds.length > 0) {
      params.set("category", selectedCategoryIds.join(","));
    }

    if (selectedProcedureIds.length > 0) {
      params.set("procedures", selectedProcedureIds.join(","));
    }

    router.push(`/doctors?${params.toString()}`);
    onClose();
  }

  function clearFilters() {
    setLocation("");
    setMinRating("");
    setSelectedCategoryIds([]);
    setSelectedProcedureIds([]);
    router.push("/doctors");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
              {t("eyebrow")}
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
              {t("title")}
            </h2>

            <p className="mt-1 text-sm text-[#283C5D]/60">
              {t("description")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-[#FAF9F7] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#283C5D]">
                <MapPin size={16} />
                {t("location")}
              </label>

              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder={t("locationPlaceholder")}
                className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
              />
            </div>

            <FilterSelect
              icon={<Star size={16} />}
              label={t("minimumRating")}
              value={minRating}
              onChange={setMinRating}
              placeholder={t("anyRating")}
              options={[
                { label: "4.5+", value: "4.5" },
                { label: "4.0+", value: "4" },
                { label: "3.5+", value: "3.5" },
              ]}
            />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[0.85fr_1.4fr]">
          <div className="h-[52vh] overflow-y-auto border-b border-black/10 bg-[#FAF9F7] p-6 md:border-b-0 md:border-r">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
              {t("category")}
            </h3>

            <div className="flex flex-wrap gap-2">
              {DoctorCatalog.categories.map((category) => {
                const selected = selectedCategoryIds.includes(
                  category.category
                );

                return (
                  <button
                    key={category.category}
                    type="button"
                    onClick={() => toggleCategory(category.category)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97]",
                      selected
                        ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-red-500 hover:bg-[#A74848]"
                        : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                    )}
                  >
                    {categoryT(category.category)}
                  </button>
                );
              })}
            </div>

            {selectedProcedures.length > 0 ? (
              <div className="mt-6 border-t border-black/10 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/45">
                  {t("selectedProcedures")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedProcedures.map((procedure) => (
                    <button
                      key={procedure.id}
                      type="button"
                      onClick={() => toggleProcedure(procedure.id)}
                      className="rounded-full border border-[#283C5D] bg-[#283C5D] px-4 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:bg-[#A74848] active:scale-[0.97]"
                    >
                      {procedureT(procedure.id)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="h-[52vh] overflow-y-auto bg-white p-6">
            <div className="sticky -top-6 z-10 mb-4 flex items-end justify-between gap-4 bg-white pb-4 pt-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#283C5D]">
                  {t("procedures")}
                </h3>

                <p className="mt-1 text-xs text-[#283C5D]/55">
                  {selectedCategories.length > 0
                    ? t("selectProcedures")
                    : t("chooseCategoryFirst")}
                </p>
              </div>

              <p className="text-xs font-medium text-[#d8bd8d]">
                {selectedProcedureIds.length} selected
              </p>
            </div>

            {selectedCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-sm text-[#283C5D]/60">
                {t("chooseCategoryFirst")}
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {selectedCategories.map((category) => (
                  <div key={category.category} className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
                      {categoryT(category.category)}
                    </p>

                    {category.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.subcategory}
                        className="rounded-2xl bg-[#FAF9F7] p-4"
                      >
                        <h4 className="mb-3 text-sm font-semibold text-[#283C5D]">
                          {subcategoryT(subcategory.subcategory)}
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {subcategory.procedures.map((procedure) => {
                            const selected = selectedProcedureIds.includes(
                              procedure.id
                            );

                            return (
                              <button
                                key={procedure.id}
                                type="button"
                                onClick={() => toggleProcedure(procedure.id)}
                                className={cn(
                                  "rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.97]",
                                  selected
                                    ? "border-[#283C5D] bg-[#283C5D] text-white hover:border-[#94604C] hover:bg-[#A74848]"
                                    : "border-black/10 bg-white text-[#283C5D] hover:border-[#283C5D] hover:bg-[#283C5D] hover:text-white"
                                )}
                              >
                                {procedureT(procedure.id)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/10 px-6 py-5">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-black/5 active:scale-[0.97]"
          >
            {t("clear")}
          </button>

          <button
            type="button"
            onClick={applyFilters}
            className="rounded-full bg-[#d8bd8d] px-7 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.97]"
          >
            {t("apply")}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#283C5D]">
        {icon}
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}