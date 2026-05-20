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
import { MessageCircle  } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function NavBarMain() {
  const locale = useLocale();
  const t = useTranslations("home.nav");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const navItems = [
    { name: t("doctors"), link: "/doctors" },
    { name: t("categories"), link: "/categories" },
    { name: t("contact"), link: "/contact" },
    { name: t("faq"), link: "/faq" },
  ];

  const authHref = session ? `/${locale}/dashboard` : `/${locale}/sign-in`;

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {!isPending && session ? (
              <NavbarButton
                href={authHref}
                variant="secondary"
                className="bg-white px-3"
              >
                <MessageCircle  size={22} className="text-[#283C5D]" />
              </NavbarButton>
            ) : (
              <NavbarButton
                href={authHref}
                variant="secondary"
                className="bg-white"
              >
                {t("signIn")}
              </NavbarButton>
            )}
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

              {!isPending && session ? (
                <NavbarButton
                  href={authHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="secondary"
                  className="flex w-full items-center justify-center gap-2 bg-white"
                >
                  <MessageCircle  size={20} />
                  {t("messages")}
                </NavbarButton>
              ) : (
                <NavbarButton
                  href={authHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="secondary"
                  className="w-full bg-white"
                >
                  {t("signIn")}
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}