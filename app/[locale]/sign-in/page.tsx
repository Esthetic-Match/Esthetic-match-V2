"use client";

import BlueBanner from "@/components/UI/BlueBanner";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Eye, EyeClosed, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import WhiteshadowBackground from "@/components/UI/WhiteShadowBackground";
import { useTranslations, useLocale } from "next-intl";
import GoogleSignInButton from "@/components/UI/GoogleSignInButton";
import InputField from "@/components/UI/InputField";

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
  
    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Invalid credentials.");
      return;
    }
  
    const session = await authClient.getSession();
    const userId = session.data?.user?.id;
  
    setIsLoading(false);
  
    if (!userId) {
      router.push("/dashboard/settings");
      router.refresh();
      return;
    }
  
    router.push(`/dashboard/${userId}`);
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-black">
      <WhiteshadowBackground />
      <BlueBanner />

      <section className="relative z-10 mx-auto flex  max-w-md items-start px-6 py-10">
        <div className="w-full mt-6 rounded-[2rem] border border-white/40 bg-white/75 p-6 shadow-2xl shadow-[#283C5D]/10 backdrop-blur-md">
          <div className="mb-7 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#d8bd8d]">
              Esthetic Match
            </p>

            <h1 className="text-2xl font-semibold leading-tight text-[#283C5D]">
              {t("SignIn")}
            </h1>
          </div>

          <GoogleSignInButton />

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#283C5D]/10" />
            <span className="text-xs font-medium text-[#283C5D]/45">
              {t("or")}
            </span>
            <div className="h-px flex-1 bg-[#283C5D]/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label={t("Email")}
              placeholder={t("EmailDescription")}
              type="email"
              value={email}
              onChange={setEmail}
              icon={<Mail size={15} />}
            />

            <div>
              <InputField
                label={t("Password")}
                placeholder={t("PasswordDescription")}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-[#d8bd8d] transition hover:scale-[1.05]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeClosed size={17} /> : <Eye size={17} />}
                  </button>
                }
              />

              <div className="mt-2 text-right">
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs font-medium text-[#d8bd8d] underline underline-offset-2"
                >
                  {t("ForgotPassword")}
                </Link>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full cursor-pointer rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6] text-sm font-semibold text-[#0f233f] shadow-sm transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t("SigningIn") : t("SignInButton")}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#283C5D]/60">
            {t("NoAccount")}{" "}
            <Link
              href={`/${locale}/sign-up`}
              className="font-semibold text-[#283C5D] underline underline-offset-2"
            >
              {t("SignUp")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}