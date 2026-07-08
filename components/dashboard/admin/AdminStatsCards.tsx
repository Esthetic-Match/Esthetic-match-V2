"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

type AdminStats = {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
};

type StatCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  value: number;
  isLoading: boolean;
  icon: React.ReactNode;
};

function StatCard({
  eyebrow,
  title,
  description,
  value,
  isLoading,
  icon,
}: StatCardProps) {
  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            {eyebrow}
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            {title}
          </h2>

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
  const t = useTranslations(
    "admin.adminStatsCards"
  );

  const [stats, setStats] =
    useState<AdminStats | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function fetchStats(): Promise<void> {
      try {
        const res = await fetch(
          "/api/admin/stats"
        );

        const data: unknown = await res.json();

        if (!res.ok) {
          throw new Error(
            "Could not load admin stats."
          );
        }

        if (
          typeof data === "object" &&
          data !== null &&
          "totalUsers" in data &&
          "totalPatients" in data &&
          "totalDoctors" in data &&
          typeof data.totalUsers === "number" &&
          typeof data.totalPatients === "number" &&
          typeof data.totalDoctors === "number"
        ) {
          setStats({
            totalUsers: data.totalUsers,
            totalPatients:
              data.totalPatients,
            totalDoctors: data.totalDoctors,
          });
        }
      } catch (error) {
        console.error(
          "Could not load admin stats:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchStats();
  }, []);

  return (
    <>
      <StatCard
        eyebrow={t("users.eyebrow")}
        title={t("users.title")}
        description={t("users.description")}
        value={stats?.totalUsers ?? 0}
        isLoading={isLoading}
        icon={<UsersRound size={26} />}
      />

      <StatCard
        eyebrow={t("patients.eyebrow")}
        title={t("patients.title")}
        description={t(
          "patients.description"
        )}
        value={stats?.totalPatients ?? 0}
        isLoading={isLoading}
        icon={<UserRound size={26} />}
      />

      <StatCard
        eyebrow={t("doctors.eyebrow")}
        title={t("doctors.title")}
        description={t(
          "doctors.description"
        )}
        value={stats?.totalDoctors ?? 0}
        isLoading={isLoading}
        icon={<Stethoscope size={26} />}
      />
    </>
  );
}