"use client";

import { Check } from "lucide-react";

type SpecialtySelectorProps = {
  selectedSpecialties: string[];
  onToggleSpecialty: (id: string) => void;
};

type SpecialtyItem = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

type SpecialtyGroup = {
  title: string;
  items: SpecialtyItem[];
};

const specialtyGroups: SpecialtyGroup[] = [
  {
    title: "Aesthetic",
    items: [
      {
        id: "aesthetic_doctor",
        label: "Aesthetic Doctor",
        description: "Injections, lasers, aesthetic treatments",
        icon: "aesthetic-doctor.svg",
      },
      {
        id: "dermatologist",
        label: "Dermatologist",
        description: "Skin, hair, dermatological laser",
        icon: "dermatologist.svg",
      },
    ],
  },
  {
    title: "Surgery",
    items: [
      {
        id: "plastic_surgeon",
        label: "Plastic Surgeon",
        description: "Aesthetic & reconstructive surgery",
        icon: "plastic-surgeon.svg",
      },
      {
        id: "maxillofacial_surgeon",
        label: "Maxillofacial Surgeon",
        description: "Maxillofacial, trauma, aesthetic",
        icon: "maxillofacial-surgeon.svg",
      },
      {
        id: "ent_surgeon",
        label: "ENT Surgeon",
        description: "Otorhinolaryngology, cervico-facial surgery",
        icon: "ent-surgeon.svg",
      },
    ],
  },
  {
    title: "Associated Specialties",
    items: [
      {
        id: "ophthalmologist",
        label: "Ophthalmologist",
        description: "Ocular surgery, aesthetic eye medicine",
        icon: "ophthalmologist.svg",
      },
      {
        id: "dentist",
        label: "Dentist",
        description: "Aesthetic dentistry, rehabilitation",
        icon: "dentist.svg",
      },
      {
        id: "orthodontist",
        label: "Orthodontist",
        description: "Orthodontics, teeth alignment",
        icon: "orthodontist.svg",
      },
    ],
  },
  {
    title: "Other",
    items: [
      {
        id: "oculoplastic_surgeon",
        label: "Oculoplastic Surgeon",
        description: "Eye plastic & reconstructive surgery",
        icon: "oculoplastic-surgeon.svg",
      },
      {
        id: "reconstructive_surgeon",
        label: "Reconstructive Surgeon",
        description: "Advanced reconstructive procedures",
        icon: "reconstructive-surgeon.svg",
      },
      {
        id: "other_specialty",
        label: "Other Specialty",
        description: "Specify your specialty",
        icon: "other-specialty.svg",
      },
    ],
  },
];

export default function SpecialtySelector({
  selectedSpecialties,
  onToggleSpecialty,
}: SpecialtySelectorProps) {
  return (
      <div className="w-full space-y-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl">
            What are your main specialties?
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#283C5D]/45">
            Select your specialties to personalize your profile and connect with
            patients.
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#EFF6FF] px-4 py-2 text-xs font-medium text-[#283C5D]/60">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#2563EB] text-[10px] font-bold text-[#2563EB]">
              i
            </span>
            <span>You can add or modify them later.</span>
          </div>
        </div>
      {specialtyGroups.map((group) => (
        <section key={group.title} className="space-y-3">
          <h3 className="text-sm font-semibold text-[#283C5D]">
            {group.title}
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
                  className={`group relative flex min-h-[150px] flex-col items-center justify-center rounded-xl border bg-white px-4 py-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                    selected
                      ? "border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_1px_rgba(37,99,235,0.25)]"
                      : "border-black/10 hover:border-[#2563EB]/40"
                  }`}
                >
                  {/* check icon */}
                  <span
                    className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition ${
                      selected
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-black/15 bg-white text-transparent"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>

                  {/* icon */}
                  <img
                    src={`/images/specialties/${specialty.icon}`}
                    alt={specialty.label}
                    className={`mb-3 h-11 w-11 object-contain transition ${
                      selected
                        ? "opacity-100"
                        : "opacity-80 group-hover:opacity-100"
                    }`}
                  />

                  {/* label */}
                  <span className="text-sm font-semibold text-[#283C5D]">
                    {specialty.label}
                  </span>

                  {/* description */}
                  <span className="mt-1 text-xs leading-snug text-[#283C5D]/50">
                    {specialty.description}
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