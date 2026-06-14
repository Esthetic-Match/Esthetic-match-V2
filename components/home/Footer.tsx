"use client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("home.footer");

  return (
    <footer className="bg-[#283c5d] px-6 py-2 text-white md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 md:flex-row lg:justify-between">
        {/* Left Links */}
        <div className="flex flex-col gap-1">
          <p className="text-lg font-light tracking-tight transition hover:opacity-80">
            {t("learnMore")}
          </p>

          <div className="mt-2 flex flex-col gap-2 text-md text-white/95">
            <Link href="/faq" className="transition hover:opacity-80">
              {t("faqs")}
            </Link>

            <Link href="/contact" className="transition hover:opacity-80">
              {t("contactUs")}
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-md">
          <h3 className="text-2xl font-light tracking-tight">
            {t("contact")}
          </h3>

          <div className="mt-2 space-y-2 text-white/95">
            <p className="font-normal text-md">
              {t("location")}: Tallinn, Estonia
            </p>

            <Link
              href="https://www.instagram.com/estheticmatch/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition hover:opacity-80"
            >
              <Image
                src="/icons/igIcon.svg"
                alt="Instagram Logo"
                width={20}
                height={20}
                className="h-5 w-5"
              />

              {t("followUs")}
            </Link>
          </div>
        </div>

        {/* Logo */}
        <div className="relative h-16 w-[320px] shrink-0">
          <Image
            src="/logoBlue.svg"
            alt="Esthetic Match"
            fill
            className="object-contain object-right"
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-6 border-white/10 pt-6 text-sm text-white/90 md:flex-row">
        <p>{t("copyright")}</p>

        <div className="flex items-center gap-3">
          <Link
            href="/privacy-policy"
            className="transition hover:opacity-80"
          >
            {t("privacyPolicy")}
          </Link>

          <span>|</span>

          <Link href="/terms-of-use" className="transition hover:opacity-80">
            {t("termsOfUse")}
          </Link>
        </div>
      </div>
    </footer>
  );
}