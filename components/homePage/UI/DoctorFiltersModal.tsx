"use client";

import { X, Star, MapPin, Stethoscope, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type DoctorFiltersModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const specialties = [
  { label: "Aesthetic Doctor", value: "aesthetic_doctor" },
  { label: "Plastic Surgeon", value: "plastic_surgeon" },
  { label: "Dermatologist", value: "dermatologist" },
  { label: "Dentist", value: "dentist" },
  { label: "Ophthalmologist", value: "ophthalmologist" },
  { label: "ENT Surgeon", value: "ent_surgeon" },
];

const categories = [
  { label: "Non-surgical face", value: "non_surgical_face" },
  { label: "Non-surgical body", value: "non_surgical_body" },
  { label: "Aesthetic dentistry", value: "aesthetic_dentistry" },
  { label: "Hair medicine", value: "hair_medicine" },
  { label: "Muscle tone & EMS", value: "muscle_tone_and_ems" },
  { label: "IV therapy", value: "iv_therapy" },
  { label: "Wellness & drainage", value: "wellness_and_drainage" },
  { label: "Surgical face", value: "surgical_face" },
  { label: "Surgical body", value: "surgical_body" },
  { label: "Longevity medicine", value: "longevity_medicine" },
];

export default function DoctorFiltersModal({
  isOpen,
  onClose,
}: DoctorFiltersModalProps) {
  const t = useTranslations("home.doctors.filters");
  const specialityT = useTranslations("specialitiesName");
  const categoryT = useTranslations("categoriesName");
  const router = useRouter();

  const [specialty, setSpecialty] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");

  const translatedSpecialties = specialties.map((item) => ({
    ...item,
    label: specialityT(item.value),
  }));

  const translatedCategories = categories.map((item) => ({
    ...item,
    label: categoryT(item.value),
  }));

  if (!isOpen) return null;

  function applyFilters() {
    const params = new URLSearchParams();

    if (specialty) params.set("specialty", specialty);
    if (category) params.set("category", category);
    if (location.trim()) params.set("location", location.trim());
    if (minRating) params.set("minRating", minRating);

    router.push(`/doctors?${params.toString()}`);
    onClose();
  }

  function clearFilters() {
    setSpecialty("");
    setCategory("");
    setLocation("");
    setMinRating("");
    router.push("/doctors");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
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

        <div className="grid gap-5 bg-[#FAF9F7] p-6 md:grid-cols-2">
          <FilterSelect
            icon={<Stethoscope size={16} />}
            label={t("specialty")}
            value={specialty}
            onChange={setSpecialty}
            placeholder={t("anySpecialty")}
            options={translatedSpecialties}
          />

          <FilterSelect
            icon={<Sparkles size={16} />}
            label={t("category")}
            value={category}
            onChange={setCategory}
            placeholder={t("anyCategory")}
            options={translatedCategories}
          />

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