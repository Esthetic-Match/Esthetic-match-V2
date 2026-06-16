"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

type SpecialtySelectorProps = {
  selectedSpecialties: string[];
  onToggleSpecialty: (id: string) => void;
};

export default function SpecialtySelector({
  selectedSpecialties,
  onToggleSpecialty,
}: SpecialtySelectorProps) {
  const t = useTranslations("onboarding.specialtySelector");
  const specialityT = useTranslations("specialitiesName");
  const specialtyGroups = DoctorCatalog.specialties.groups;

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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                  <Image
                    src={`/images/dashboard/specialties/${specialty.icon}`}
                    alt={specialityT(specialty.id)}
                    width={44}
                    height={44}
                    className={`mb-3 h-11 w-11 object-contain transition ${
                      selected
                        ? "opacity-100"
                        : "opacity-80 group-hover:opacity-100"
                    }`}
                  />

                  <span className="text-sm font-semibold text-[#283C5D]">
                    {specialityT(specialty.id)}
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