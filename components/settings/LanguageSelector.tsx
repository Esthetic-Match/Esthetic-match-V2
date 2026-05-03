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
    <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className=" flex justify-center">
            <p className="text-lg font-normal">Please select a language</p>
        </div>
      
      {/* ENGLISH CARD */}
      <div className="flex flex-row gap-4 justify-center">
        <button
          type="button"
          onClick={() => handleSwitch("en")}
          className={`flex flex-col items-center justify-center rounded-2xl border p-4 w-32 transition
          ${
            locale === "en"
              ? "border-[#283C5D] bg-[#283C5D] text-white"
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
              ? "border-[#283C5D] bg-[#283C5D] text-white"
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