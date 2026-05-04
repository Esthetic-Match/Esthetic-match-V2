"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const pathWithoutLocale =
    pathname.replace(/^\/(en|fr)(?=\/|$)/, "") || "";

  function handleSwitch(newLocale: "en" | "fr") {
    router.push(`/${newLocale}${pathWithoutLocale}`);
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Language
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Change Language
      </h2>
      <div className="border-t border-gray-300 my-4"></div>
      </div>
      
      {/* ENGLISH CARD */}
      <div className="flex flex-row gap-4 justify-start">
        <button
          type="button"
          onClick={() => handleSwitch("en")}
          className={`flex flex-col items-center justify-center rounded-2xl border p-4 w-32 transition
          ${
            locale === "en"
              ? "border-[#d8bd8d] bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] text-white"
              : "border-black/10 bg-white text-black hover:bg-gray-100 cursor-pointer"
          }`}
        >
          <img
            src="/flags/en.png"
            alt="English"
            className="h-10 w-10 object-cover rounded-full"
          />
          <span className="mt-2 text-sm font-medium">English</span>
        </button>

        {/* FRENCH CARD */}
        <button
          type="button"
          onClick={() => handleSwitch("fr")}
          className={`flex flex-col items-center justify-center rounded-2xl border p-4 w-32 transition
          ${
            locale === "fr"
              ? "border-[#d8bd8d] bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1]  text-white"
              : "border-black/10 bg-white text-black hover:bg-gray-100 cursor-pointer"
          }`}
        >
          <img
            src="/flags/fr.png"
            alt="French"
            className="h-10 w-10 object-cover rounded-full"
          />
          <span className="mt-2 text-sm font-medium">Français</span>
        </button>
      </div>

    </div>
  );
}