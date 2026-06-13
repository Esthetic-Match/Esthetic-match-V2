"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import Image from "next/image";

export default function LanguageSelector() {
  const t = useTranslations("settings");
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          {t("language.title")}
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          {t("language.changeLanguage")}
        </h2>

        <div className="my-4 border-t border-gray-300"></div>
      </div>

      <div className="flex flex-row justify-start gap-4">
        <Link
          href={pathname}
          locale="en"
          className={`flex w-32 flex-col items-center justify-center rounded-2xl border p-4 transition
          ${
            locale === "en"
              ? "border-[#d8bd8d] bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] text-white"
              : "border-black/10 bg-white text-black hover:bg-gray-100"
          }`}
        >
          <Image
            src="/flags/en.png"
            alt={t("language.english")}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />

          <span className="mt-2 text-sm font-medium">
            {t("language.english")}
          </span>
        </Link>

        <Link
          href={pathname}
          locale="fr"
          className={`flex w-32 flex-col items-center justify-center rounded-2xl border p-4 transition
          ${
            locale === "fr"
              ? "border-[#d8bd8d] bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] text-white"
              : "border-black/10 bg-white text-black hover:bg-gray-100"
          }`}
        >
          <Image
            src="/flags/fr.png"
            alt={t("language.french")}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />

          <span className="mt-2 text-sm font-medium">
            {t("language.frenchNative")}
          </span>
        </Link>
      </div>
    </div>
  );
}