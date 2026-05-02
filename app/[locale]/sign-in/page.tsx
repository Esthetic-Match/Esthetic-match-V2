"use client";
import BlueBanner from "@/components/UI/BlueBanner";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import WhiteshadowBackground from "@/components/UI/WhiteShadowBackground";
import { useTranslations, useLocale } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("signIn.SignIn");
  const router = useRouter();
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Invalid credentials.");
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-black">
      <WhiteshadowBackground/>
      
      <BlueBanner />

      <section className="relative mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex flex-1 flex-col px-3 pt-5">

          <div className="mb-7 text-center">
            <h1 className="text-[21px] font-thin leading-tight text-black">
              {t("SignIn")}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[15px] font-medium text-black">
                {t("Email")}
              </label>

              <div className="flex h-9 items-center rounded-full bg-white/60 px-4 shadow-sm">
                <input
                  className="w-full bg-transparent text-sm text-black placeholder:text-black/50 outline-none"
                  placeholder={t("EmailDescription")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Mail size={16} className="text-[#d8bd8d]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-medium text-black">
                {t("Password")}
              </label>

              <div className="flex h-9 items-center rounded-full bg-white/60 px-4 shadow-sm">
                <input
                  className="w-full bg-transparent text-sm text-black placeholder:text-black/40 outline-none"
                  placeholder={t("PasswordDescription")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-[#d8bd8d]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeClosed size={17}  className="hover:scale-[1.05] cursor-pointer"/> : <Eye size={17} className="hover:scale-[1.05] cursor-pointer" />}
                </button>
              </div>

              <div className="mt-2 text-right">
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-[#ead3a5] underline underline-offset-2"
                >
                  {t("ForgotPassword")}
                </Link>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-lg bg-[#94604C] px-3 py-2 text-sm text-[#FDFDFD]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full cursor-pointer rounded-full bg-gradient-to-r 
              from-[#d8bd8d] to-[#f4e4c6] text-sm font-semibold text-[#0f233f] transition-transform 
              duration-200 hover:scale-[1.02] disabled:opacity-60 shadow-sm"
            >
              {isLoading ? t("SigningIn") : t("SignInButton")}
            </button>
          </form>

          <p className="mt-7 text-center text-sm">
            {t("NoAccount")}{" "}
            <Link href={`/${locale}/sign-up`} className="underline underline-offset-2">
              {t("SignUp")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}