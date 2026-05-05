"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

type SpecialtySelectorProps = {
  selectedSpecialties: string[];
  onToggleSpecialty: (id: string) => void;
};

type SpecialtyItem = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
};

type SpecialtyGroup = {
  titleKey: string;
  items: SpecialtyItem[];
};

const specialtyGroups: SpecialtyGroup[] = [
  {
    titleKey: "groups.aesthetic",
    items: [
      {
        id: "aesthetic_doctor",
        labelKey: "items.aesthetic_doctor.label",
        descriptionKey: "items.aesthetic_doctor.description",
        icon: "aesthetic-doctor.svg",
      },
      {
        id: "dermatologist",
        labelKey: "items.dermatologist.label",
        descriptionKey: "items.dermatologist.description",
        icon: "dermatologist.svg",
      },
    ],
  },
  {
    titleKey: "groups.surgery",
    items: [
      {
        id: "plastic_surgeon",
        labelKey: "items.plastic_surgeon.label",
        descriptionKey: "items.plastic_surgeon.description",
        icon: "plastic-surgeon.svg",
      },
      {
        id: "maxillofacial_surgeon",
        labelKey: "items.maxillofacial_surgeon.label",
        descriptionKey: "items.maxillofacial_surgeon.description",
        icon: "maxillofacial-surgeon.svg",
      },
      {
        id: "ent_surgeon",
        labelKey: "items.ent_surgeon.label",
        descriptionKey: "items.ent_surgeon.description",
        icon: "ent-surgeon.svg",
      },
    ],
  },
  {
    titleKey: "groups.associatedSpecialties",
    items: [
      {
        id: "ophthalmologist",
        labelKey: "items.ophthalmologist.label",
        descriptionKey: "items.ophthalmologist.description",
        icon: "ophthalmologist.svg",
      },
      {
        id: "dentist",
        labelKey: "items.dentist.label",
        descriptionKey: "items.dentist.description",
        icon: "dentist.svg",
      },
      {
        id: "orthodontist",
        labelKey: "items.orthodontist.label",
        descriptionKey: "items.orthodontist.description",
        icon: "orthodontist.svg",
      },
    ],
  },
  {
    titleKey: "groups.other",
    items: [
      {
        id: "oculoplastic_surgeon",
        labelKey: "items.oculoplastic_surgeon.label",
        descriptionKey: "items.oculoplastic_surgeon.description",
        icon: "oculoplastic-surgeon.svg",
      },
      {
        id: "reconstructive_surgeon",
        labelKey: "items.reconstructive_surgeon.label",
        descriptionKey: "items.reconstructive_surgeon.description",
        icon: "reconstructive-surgeon.svg",
      },
      {
        id: "other_specialty",
        labelKey: "items.other_specialty.label",
        descriptionKey: "items.other_specialty.description",
        icon: "other-specialty.svg",
      },
    ],
  },
];

export default function SpecialtySelector({
  selectedSpecialties,
  onToggleSpecialty,
}: SpecialtySelectorProps) {
  const t = useTranslations("signUp.specialtySelector");

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl">
          {t("title")}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#283C5D]/45">
          {t("subtitle")}
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#EFF6FF] px-4 py-2 text-xs font-medium text-[#283C5D]/60">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#2563EB] text-[10px] font-bold text-[#2563EB]">
            i
          </span>
          <span>{t("note")}</span>
        </div>
      </div>

      {specialtyGroups.map((group) => (
        <section key={group.titleKey} className="space-y-3">
          <h3 className="text-sm font-semibold text-[#283C5D]">
            {t(group.titleKey)}
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {group.items.map((specialty) => {
              const selected = selectedSpecialties.includes(specialty.id);

              return (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => onToggleSpecialty(specialty.id)}
                  aria-pressed={selected}
                  className={`group relative flex min-h-[150px] flex-col items-center justify-center rounded-xl border px-4 py-5 text-center shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                    selected
                      ? "border-[#2563EB]/20 bg-[#EFF6FF]/40 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]"
                      : "border-black/5 bg-white hover:border-[#2563EB]/40"
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition ${
                      selected
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-black/15 bg-white text-transparent"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>

                  <img
                    src={`/images/specialties/${specialty.icon}`}
                    alt={t(specialty.labelKey)}
                    className={`mb-3 h-11 w-11 object-contain transition ${
                      selected
                        ? "opacity-100"
                        : "opacity-80 group-hover:opacity-100"
                    }`}
                  />

                  <span className="text-sm font-semibold text-[#283C5D]">
                    {t(specialty.labelKey)}
                  </span>

                  <span className="mt-1 text-xs leading-snug text-[#283C5D]/50">
                    {t(specialty.descriptionKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}