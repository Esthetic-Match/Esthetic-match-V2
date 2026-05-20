// components/dashboard/admin/AdminStatsCards.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Stethoscope, UserRound, UsersRound } from "lucide-react";

type AdminStats = {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
};

function StatCard({
  eyebrow,
  title,
  description,
  value,
  isLoading,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  value: number;
  isLoading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            {eyebrow}
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">{title}</h2>

          <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
            {description}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF2DE] text-[#d8bd8d]">
          {icon}
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-[#d8bd8d]" />
        ) : (
          <p className="text-5xl font-bold tracking-tight text-[#283C5D]">
            {value}
          </p>
        )}
      </div>
    </section>
  );
}

export default function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Could not load admin stats.");
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
    <>
      <StatCard
        eyebrow="Platform"
        title="Total Users"
        description="All registered patients, doctors, and admins."
        value={stats?.totalUsers ?? 0}
        isLoading={isLoading}
        icon={<UsersRound size={26} />}
      />

      <StatCard
        eyebrow="Patients"
        title="Total Patients"
        description="Users registered with patient accounts."
        value={stats?.totalPatients ?? 0}
        isLoading={isLoading}
        icon={<UserRound size={26} />}
      />

      <StatCard
        eyebrow="Doctors"
        title="Total Doctors"
        description="Users registered with doctor accounts."
        value={stats?.totalDoctors ?? 0}
        isLoading={isLoading}
        icon={<Stethoscope size={26} />}
      />
    </>
  );
}