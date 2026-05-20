// components/dashboard/admin/DoctorPlansCard.tsx
"use client";

import { useEffect, useState } from "react";
import { Crown, Loader2 } from "lucide-react";

type DoctorPlanStats = {
  freeDoctors: number;
  standardDoctors: number;
  totalDoctors: number;
};

export default function DoctorPlansCard() {
  const [stats, setStats] = useState<DoctorPlanStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/doctor-plans");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Could not load doctor plan stats.");
        }

        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            Doctor Plans
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            Paid Plan Distribution
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
            Compare doctors using free and standard plans.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF2DE] text-[#d8bd8d]">
          <Crown size={26} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#d8bd8d]" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#FAF9F7] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
              Free
            </p>
            <p className="mt-3 text-4xl font-bold text-[#283C5D]">
              {stats?.freeDoctors ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FAF2DE] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#283C5D]/50">
              Standard
            </p>
            <p className="mt-3 text-4xl font-bold text-[#283C5D]">
              {stats?.standardDoctors ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-[#283C5D] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Total
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {stats?.totalDoctors ?? 0}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}