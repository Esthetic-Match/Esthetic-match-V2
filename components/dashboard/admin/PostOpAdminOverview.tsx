"use client";

import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PostOpAdminOverview() {
  const t = useTranslations(
    "admin.postOpOverview"
  );

  return (
    <Link
      href="/dashboard/adminPanel/post-op"
      className="group block overflow-hidden rounded-[1.75rem] border border-[#283C5D]/10 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(40,60,93,0.10)]"
    >
      <div className="relative p-6 md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#283C5D] text-white shadow-sm">
              <ClipboardCheck className="size-5" />
            </div>

            <div className="flex size-9 items-center justify-center rounded-full border border-[#283C5D]/10 text-[#283C5D] transition group-hover:border-[#D8BD8D]/60 group-hover:bg-[#D8BD8D]/10">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4945A]">
              {t("eyebrow")}
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#283C5D]">
              {t("title")}
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#283C5D]/60">
              {t("description")}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <FileText className="size-4 text-[#B4945A]" />

              <p className="mt-3 text-sm font-semibold text-[#283C5D]">
                {t("templates.title")}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#283C5D]/50">
                {t("templates.description")}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <Stethoscope className="size-4 text-[#B4945A]" />

              <p className="mt-3 text-sm font-semibold text-[#283C5D]">
                {t("procedures.title")}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#283C5D]/50">
                {t("procedures.description")}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F7] p-4">
              <ClipboardCheck className="size-4 text-[#B4945A]" />

              <p className="mt-3 text-sm font-semibold text-[#283C5D]">
                {t("recovery.title")}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#283C5D]/50">
                {t("recovery.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}