"use client";

import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useTranslations } from "next-intl";

type BackButtonProps = {
  variant?: "light" | "dark";
};

export default function BackButton({
  variant = "light",
}: BackButtonProps) {
  const t = useTranslations("home.Home");

  const isDark = variant === "dark";

  return (
    <Link
      href="/"
      className={cn(
        "absolute left-6 top-6 z-10 flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 pr-5 text-sm transition hover:scale-[1.02]",

        !isDark &&
          "border border-white/40 text-white hover:bg-white hover:text-black active:scale-[0.98]",

        isDark &&
          "border border-black text-black hover:bg-[#283C5D]/80 hover:text-white active:scale-[0.98] max-md:border-white max-md:text-white"
      )}
    >
      <ChevronLeft size={18} />
      {t("back")}
    </Link>
  );
}