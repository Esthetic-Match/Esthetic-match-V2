"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

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
      className="relative z-[99999] flex cursor-pointer items-center justify-center gap-2 rounded-full 
      border border-black/10 bg-white px-3 py-2 text-sm text-black transition
      hover:bg-[#283C5D] hover:text-white hover:scale-[0.95] active:scale-[1.01]"
    >
      <span className="relative h-5 w-5 overflow-hidden rounded-full border border-black/10 bg-white hover:scale-[1.05]">
        <Image
          src={`/images/flags/${locale}.png`}
          alt={`${locale.toUpperCase()} flag`}
          fill
          sizes="20px"
          className="object-fill"
        />
      </span>
    </button>
  );
}