"use client";

import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

type SpecialtySelectorProps = {
  selectedSpecialties: string[];
  onToggleSpecialty: (id: string) => void;
};

function getSpecialtyImagePath(specialty: string) {
  return `/images/specialties/${specialty
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "-")}.jpg`;
}

export default function SpecialtySelector({
  selectedSpecialties,
  onToggleSpecialty,
}: SpecialtySelectorProps) {
  const t = useTranslations("signUp.specialties");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {DoctorCatalog.specialties.items.map((specialty) => {
          const selected = selectedSpecialties.includes(specialty);

          return (
            <button
              key={specialty}
              type="button"
              onClick={() => onToggleSpecialty(specialty)}
              aria-pressed={selected}
              className={`relative min-h-32 overflow-hidden rounded-2xl border transition
                hover:bg-[#EDD0A9] hover:border-[#EDD0A9] hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${
                selected
                  ? "border-[#EDD0A9] ring-2 ring-[#EDD0A9]"
                  : "border-black/10 hover:border-black/30"
              }`}
            >
              <img
                src={getSpecialtyImagePath(specialty)}
                alt={t(specialty)}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/35" />

              {selected ? (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
                  <Check size={14} strokeWidth={3} />
                </div>
              ) : null}

              <div className="relative z-10 flex h-full min-h-32 items-center justify-center px-3 text-center">
                <span className="text-lg font-normal text-white">
                  {t(specialty)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}