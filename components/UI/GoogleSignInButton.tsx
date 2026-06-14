"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function GoogleSignInButton() {
  const t = useTranslations("signIn.SignIn");

  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-[#283C5D]/15 bg-white px-5 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-[#FAF9F7]"
    >
      <Image
        src="/icons/googleIcon.svg"
        alt="Google"
        width={18}
        height={18}
      />
      {t("continueWithGoogle")}
    </button>
  );
}