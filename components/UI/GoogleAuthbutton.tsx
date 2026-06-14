"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import Image from "next/image";

type GoogleAuthButtonProps = {
  role: "PATIENT" | "DOCTOR";
};

function isAtLeast18(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

export default function GoogleAuthButton({ role }: GoogleAuthButtonProps) {
  const t = useTranslations("signUp.signUpForm");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");


  function handleOpenModal() {
    setError("");
    setIsModalOpen(true);
  }

  async function continueWithGoogle() {
    setError("");

    if (role === "PATIENT") {
      if (!dateOfBirth) {
        setError(t("errors.googleDobRequired"));
        return;
      }

      if (!isAtLeast18(dateOfBirth)) {
        setError(t("errors.googleAgeRequirement"));
        return;
      }
    }

    await authClient.signIn.social({
      provider: "google",
      callbackURL: `/auth/social-callback?role=${role}&dateOfBirth=${encodeURIComponent(
        dateOfBirth
      )}`,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-[#283C5D]/15 bg-white px-5 py-3 text-sm font-semibold text-[#283C5D] shadow-sm transition hover:bg-[#FAF9F7]"
      >
        <Image
          src="/icons/googleIcon.svg"
          alt="Google"
          width={18}
          height={18}
        />
      
        <span>{t("continueWithGoogle")}</span>
      </button>

{isModalOpen && typeof document !== "undefined"
  ? createPortal(
      <div className="fixed inset-0 z-[99999] flex min-h-screen w-screen items-center justify-center bg-black/50 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl shadow-[#283C5D]/20">
         <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
                  {t("googleDobModal.eyebrow")}
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#283C5D]">
                  {t("googleDobModal.title")}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
                  {t("googleDobModal.description")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={t("googleDobModal.close")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#283C5D]/5 text-[#283C5D]/60 transition hover:bg-[#283C5D]/10"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#283C5D]">
                {t("DOB")}
              </label>

              <div className="flex h-11 items-center gap-3 rounded-full bg-[#FAF9F7] px-4 ring-1 ring-[#283C5D]/5">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="w-full bg-transparent text-sm text-[#283C5D] outline-none"
                />

                <CalendarDays size={16} className="text-[#d8bd8d]" />
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={continueWithGoogle}
              className="mt-5 h-11 w-full rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6] text-sm font-semibold text-[#0f233f] shadow-sm transition hover:scale-[1.01] active:scale-[0.98]"
            >
              {t("googleDobModal.continue")}
            </button>
        </div>
      </div>,
      document.body
    )
  : null}
    </>
  );
}