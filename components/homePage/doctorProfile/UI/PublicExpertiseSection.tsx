import { Lock, Sparkle } from "lucide-react";

type PublicExpertiseSectionProps = {
  doctorProfile: {
    procedureIds: string[];
    paidPlan: string | null;
  };
};

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function PublicExpertiseSection({
  doctorProfile,
}: PublicExpertiseSectionProps) {
  const isFreePlan = doctorProfile.paidPlan === "free" || !doctorProfile.paidPlan;

  const visibleProcedures = isFreePlan
    ? doctorProfile.procedureIds.slice(0, 5)
    : doctorProfile.procedureIds;

  const hiddenCount = Math.max(
    doctorProfile.procedureIds.length - visibleProcedures.length,
    0
  );

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <section
        aria-labelledby="doctor-expertise-title"
        className="mt-6 rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_120px] lg:items-center">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <Sparkle size={20} className="text-[#d8bd8d]" />

              <h2
                id="doctor-expertise-title"
                className="text-sm font-bold uppercase tracking-[0.22em] text-[#283C5D]"
              >
                Expertise
              </h2>
            </div>

            <p className="mb-4 text-sm font-medium text-[#283C5D]/80">
              Procedures
            </p>

            {visibleProcedures.length > 0 ? (
              <ul
                itemProp="knowsAbout"
                className="flex flex-wrap gap-3"
                aria-label="Doctor procedures and areas of expertise"
              >
                {visibleProcedures.map((procedureId) => (
                  <li key={procedureId} className="mb-2">
                    <span className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm">
                      {formatLabel(procedureId)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#283C5D]/45">
                No procedures added yet.
              </p>
            )}

            {isFreePlan && hiddenCount > 0 ? (
              <div className="mt-7 flex items-start gap-3 text-sm text-[#283C5D]/55">
                <Lock size={16} className="mt-0.5" aria-hidden="true" />

                <p>
                  +{hiddenCount} more procedures available from this doctor.
                </p>
              </div>
            ) : null}
          </div>

          {isFreePlan ? (
            <aside className="rounded-2xl bg-[#283C5D] p-8 text-center text-white shadow-md">
              <Sparkle size={26} className="mx-auto mb-5 text-[#d8bd8d]" />

              <h3 className="text-lg font-semibold">Standard Profile</h3>

              <p className="mt-3 text-sm text-white/60">
                This doctor has more procedures available.
              </p>
            </aside>
          ) : null}
        </div>
      </section>
    </div>
  );
}