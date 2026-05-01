import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function HomePageTemplate() {
    const t = useTranslations("home.Home");

    return (
        <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12 lg:flex-row lg:justify-between lg:px-16">
          <div className="max-w-xl text-center lg:text-left">
            <div className="mb-8">
              <div className="mb-4 flex justify-center lg:justify-start">
                <div className="flex h-30 w-30 items-center justify-center rounded-2xl border border-[#283C5D]/15 bg-white shadow-[0_8px_30px_rgba(40,60,93,0.08)]">
                  <Image
                    src="/logo.svg"
                    alt="Esthetic Match"
                    width={72}
                    height={72}
                    className="mb-2"
                  />
                </div>
              </div>
            
              <h1 className="text-3xl font-semibold tracking-[0.25em] text-[#283C5D] sm:text-4xl">
                ESTHETIC MATCH
              </h1>
            </div>
            
            <div className="mx-auto mb-8 h-px w-full max-w-xs bg-[#283C5D]/20 lg:mx-0" />
            
            <p className="mb-10 text-lg leading-8 text-[#283C5D]/80 sm:text-xl">
              {t("subtitle")}
            </p>
            
            <div className="inline-flex rounded-full border border-[#283C5D]/20 bg-white px-6 py-3 text-sm font-medium tracking-[0.2em] uppercase text-[#283C5D] shadow-sm">
              {t("statement")}
            </div>
          </div>
            
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <div className="flex gap-4">
              <Link
                href="/sign-in"
                className="rounded-full border border-[#283C5D]/30 px-6 py-3 text-sm font-medium tracking-[0.2em] uppercase text-[#283C5D] transition hover:bg-[#283C5D]/5"
              >
                {t("Sign In")}
              </Link>
            
              <Link
                href="/sign-up"
                className="rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold tracking-[0.2em] uppercase text-white transition hover:opacity-90"
              >
                {t("signUp")}
              </Link>
            </div>
            
            <div className="text-xs uppercase tracking-[0.2em] text-[#283C5D]/60">
              Dashboard creation
            </div>
          </div>
        </section>
    )
}