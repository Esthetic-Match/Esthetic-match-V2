"use client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("home.footer");

  return (
    <footer className="relative overflow-hidden bg-[#1a2d4a] text-white">
      {/* Subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Soft radial glow for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.05),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-10 md:px-12 lg:px-20">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="relative h-12 w-48">
              <Image
                src="/logoBlue.svg"
                alt="Esthetic Match"
                fill
                className="object-contain object-left brightness-0 invert"
              />
            </div>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              Find trusted aesthetic doctors, compare procedures, and book consultations with confidence.
            </p>
            {/* Instagram */}
            <Link
              href="https://www.instagram.com/estheticmatch/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-sm text-white/60 transition-all duration-300 hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10">
                <Image
                  src="/icons/igIcon.svg"
                  alt="Instagram"
                  width={16}
                  height={16}
                  className="h-4 w-4 opacity-70 transition group-hover:opacity-100"
                />
              </span>
              {t("followUs")}
            </Link>
          </div>

          {/* Doctors column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Doctors
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: "All Doctors", href: "/doctors" },
                { label: "Surgical Doctors", href: "/doctors/surgical" },
                { label: "Non-Surgical Doctors", href: "/doctors/non-surgical" },
                { label: "Doctors Near Me", href: "/doctors/nearme" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2 text-sm text-white/60 transition-all duration-200 hover:text-white"
                >
                  <span className="h-px w-4 bg-white/20 transition-all duration-300 group-hover:w-6 group-hover:bg-white/60" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Explore column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Explore
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Categories", href: "/categories" },
                { label: t("faqs"), href: "/faq" },
                { label: t("contactUs"), href: "/contact" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2 text-sm text-white/60 transition-all duration-200 hover:text-white"
                >
                  <span className="h-px w-4 bg-white/20 transition-all duration-300 group-hover:w-6 group-hover:bg-white/60" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              {t("contact")}
            </h4>
            <div className="flex flex-col gap-3 text-sm text-white/60">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span>Tallinn, Estonia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-white/35 md:flex-row">
          <p>{t("copyright")}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="transition duration-200 hover:text-white/70">
              {t("privacyPolicy")}
            </Link>
            <span className="text-white/15">|</span>
            <Link href="/terms-of-use" className="transition duration-200 hover:text-white/70">
              {t("termsOfUse")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}