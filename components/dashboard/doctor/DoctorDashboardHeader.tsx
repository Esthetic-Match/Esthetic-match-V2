"use client";

import { authClient } from "@/lib/auth/auth-client";
import { CalendarDays, LockKeyhole, Sparkles, Stethoscope } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export default function DoctorDashboardHeader() {
  const t = useTranslations("mainDashboard.doctorHeader");
  const locale = useLocale();
  const { data: session } = authClient.useSession();

  const doctorName = session?.user?.name?.trim();
  const firstName = doctorName?.split(/\s+/)[0];

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, [locale]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return firstName
        ? t("greeting.morning", { name: firstName })
        : t("greeting.morningFallback");
    }

    if (hour < 18) {
      return firstName
        ? t("greeting.afternoon", { name: firstName })
        : t("greeting.afternoonFallback");
    }

    return firstName
      ? t("greeting.evening", { name: firstName })
      : t("greeting.eveningFallback");
  }, [firstName, t]);

  return (
    <header className="relative overflow-hidden rounded-[2rem] bg-[#283C5D] px-6 py-8 text-white shadow-[0_24px_70px_-32px_rgba(40,60,93,0.7)] sm:px-8 md:px-10 md:py-10">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border border-[#D8BD8D]/25" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-64 bg-[radial-gradient(circle_at_bottom_right,rgba(216,189,141,0.2),transparent_68%)]" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">

          <h1 className="max-w-2xl text-3xl font-light leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.75rem]">
            {greeting}
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-white/65 sm:text-base">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D8BD8D]/15">
              <CalendarDays className="h-5 w-5 text-[#D8BD8D]" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                {t("today")}
              </p>

              <p className="mt-0.5 text-sm font-medium capitalize text-white">
                {currentDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D8BD8D]/15">
              <LockKeyhole className="h-5 w-5 text-[#D8BD8D]" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                {t("workspaceLabel")}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#D8BD8D]" />

                <p className="text-sm font-medium text-white">
                  {t("workspaceValue")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}