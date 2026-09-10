import { Sparkle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  PublicExpertiseTabs,
  type PublicExpertiseCategoryGroup,
} from "./PublicExpertiseTabs";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type PublicExpertiseSectionProps = {
  doctorProfile: {
    expertise?: PublicExpertiseCategoryGroup[];
  };
};

/* ═════════════════════════════════════
   COMPONENT
═════════════════════════════════════ */

export default async function PublicExpertiseSection({
  doctorProfile,
}: PublicExpertiseSectionProps) {
  const t = await getTranslations(
    "doctor.doctor.profile",
  );

  const expertise =
    doctorProfile.expertise ?? [];

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section
        aria-labelledby="doctor-expertise-title"
        className="mt-6 rounded-3xl border border-gray-300/10 bg-[#283C5D] p-6 shadow-lg md:p-8"
      >
        {/* Header */}

        <div className="mb-7 flex items-center gap-3">
          <Sparkle
            size={20}
            className="shrink-0 text-[#d8bd8d]"
          />

          <h2
            id="doctor-expertise-title"
            className="text-sm font-bold uppercase tracking-[0.22em] text-white"
          >
            {t("expertise.title")}
          </h2>
        </div>

        {/* Expertise */}

        <PublicExpertiseTabs
          categories={expertise}
          ariaLabel={t(
            "expertise.aria",
          )}
          noProceduresLabel={t(
            "expertise.noProcedures",
          )}
        />
      </section>
    </div>
  );
}