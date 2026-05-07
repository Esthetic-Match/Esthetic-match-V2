"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/UI/resizable-navbar";
import LanguageSwitcher from "./UI/LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export function NavBarMain() {
  const locale = useLocale();
  const t = useTranslations("home.nav");

  const navItems = [
    {
      name: t("doctors"),
      link: "/doctors",
    },
    {
      name: t("categories"),
      link: "/categories",
    },
    {
      name: t("contact"),
      link: "/contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <NavbarButton
              href={`/${locale}/sign-in`}
              variant="secondary"
              className="bg-white"
            >
              {t("signIn")}
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={`/${locale}${item.link}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}

            <div className="flex w-full flex-col gap-4">
              <LanguageSwitcher />
              <NavbarButton
                href={`/${locale}/sign-in`}
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full bg-white"
              >
                {t("signIn")}
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}