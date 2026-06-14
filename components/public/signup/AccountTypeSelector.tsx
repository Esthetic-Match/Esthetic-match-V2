"use client";

import { useState } from "react";
import Image from "next/image";

import MessageText from "@/components/UI/MessageText";
import BackButton from "@/components/UI/BackButton";
import type { AccountTypeSelectorProps } from "@/app/[locale]/(public)/sign-up/types";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type TransitionTarget = "patient" | "doctor" | null;

export default function AccountTypeSelector({
  infoMessage,
  onSelectPatient,
  onSelectDoctor,
}: AccountTypeSelectorProps) {
  const t = useTranslations("signUp.SelectionPage");

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (selectedTarget: Exclude<TransitionTarget, null>) => {
    if (isTransitioning) return;


    setIsTransitioning(true);

    setTimeout(() => {
      if (selectedTarget === "doctor") {
        onSelectDoctor();
      } else {
        onSelectPatient();
      }
    }, 850);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#263F63]">
      {/* WIPE LAYER */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 bg-white transition-transform duration-600 ease-in-out ${
          isTransitioning
            ? "translate-x-0"
            : "-translate-x-full"
        } w-full`}
      />

      <div
        className={`relative z-20 min-h-screen grid md:grid-cols-2 transition-opacity duration-200 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <BackButton variant="dark" />

        {/* LEFT SIDE (WHITE) */}
        <div className="flex flex-col items-center justify-center bg-white px-8 py-12 text-center max-md:hidden z-9999">
          <h1 className="mb-4 text-2xl font-thin text-black leading-tight">
            {t("title")}
          </h1>

          <div className="border border-gray-300 px-20 pt-6 rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6]">
            <Image
              src="/images/home/signup/signUpImage.png"
              alt="Esthetic Match"
              width={220}
              height={220}
              priority
              className="rounded-[2rem] object-cover"
            />
          </div>

          <p className="mt-4 max-w-xs text-sm text-gray-400 leading-tight">
            {t("subtitle")}
          </p>
        </div>

        {/* RIGHT SIDE (BLUE) */}
        <div className="flex flex-col items-center justify-center bg-[#263F63] px-8 py-12 text-white">
          <h2 className="mb-6 text-lg font-semibold">
            {t("chooseRole")}
          </h2>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelect("doctor")}
              className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-xl bg-[#EED8B5] text-black transition hover:scale-[1.03] active:scale-[0.98] cursor-pointer disabled:pointer-events-none"
            >
              <div className="flex h-[40px] items-center justify-center">
                <Image
                  src="/images/home/signup/signupDoctor.svg"
                  alt=""
                  width={30}
                  height={30}
                />
              </div>

              <span className="mt-3 text-center text-md font-normal leading-tight">
                {t("Healthcare Provider")}
              </span>
            </button>

            <button
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelect("patient")}
              className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-xl bg-[#EED8B5] text-black transition hover:scale-[1.03] active:scale-[0.98] cursor-pointer disabled:pointer-events-none"
            >
              <div className="flex h-[40px] items-center justify-center">
                <Image
                  src="/images/home/signup/signupPatient.svg"
                  alt=""
                  width={30}
                  height={30}
                />
              </div>

              <span className="mt-3 text-center text-md font-normal leading-tight">
                {t("Patient")}
              </span>
            </button>
          </div>

          <h2 className="mt-6 text-sm font-thin">
            {t("signInMessage")}
            <Link href="/sign-in"
              className="text-sm font-semibold text-white underline"
            >
              {t("signIn")}
            </Link>
          </h2>

          <div className="mt-6">
            <MessageText message={infoMessage} variant="info" />
          </div>
        </div>
      </div>
    </div>
  );
}