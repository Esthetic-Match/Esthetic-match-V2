"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const newLocale = locale === "en" ? "fr" : "en";

  return (
    <button
      type="button"
      onClick={() => {
        router.push(pathname, { locale: newLocale });
      }}
      className="relative z-[99999] flex cursor-pointer items-center gap-2 rounded-full 
      border border-black/10 bg-white px-3 py-2 text-sm text-black transition hover:bg-gray-300
      hover:text-black active:scale-[0.98] justify-center"
    >
      <Globe size={16} />
      <span>{newLocale.toUpperCase()}</span>
    </button>
  );
}