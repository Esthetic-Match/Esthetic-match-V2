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
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Layers2,
  LogOut,
  MessageCircle,
  UserRoundPen,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import {
  Link,
  useRouter,
} from "@/i18n/navigation";

export function NavBarMain() {
  const t = useTranslations("home.nav");
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] =
    useState(false);

  const { data: session, isPending } =
    authClient.useSession();

  const navItems = [
    {
      name: t("doctors"),
      link: "/doctors",
      subItems: [
        {
          name: t("allDoctors"),
          link: "/doctors",
        },
        {
          name: t("surgicalDoctors"),
          link: "/doctors/surgical",
        },
        {
          name: t("nonSurgicalDoctors"),
          link: "/doctors/non-surgical",
        },
        {
          name: t("doctorsNearMe"),
          link: "/doctors/nearme",
        },
      ],
    },
    {
      name: t("Emi"),
      link: "/Emi",
    },
    {
      name: t("categories"),
      link: "/categories",
    },
    {
      name: t("faq"),
      link: "/faq",
    },
  ];

  const authHref = session
    ? "/dashboard"
    : "/sign-in";

  const userId = session?.user?.id;

  async function handleLogout() {
    await authClient.signOut();

    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <NavbarLogo />

          <NavItems items={navItems} />

          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            <LanguageSwitcher />

            {!isPending && session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsUserMenuOpen(
                      (prev) => !prev,
                    )
                  }
                  className="flex h-10 cursor-pointer items-center justify-center rounded-full bg-white px-3 shadow-sm transition hover:scale-[0.95] hover:bg-[#283C5D] hover:text-white active:scale-[1.01]"
                >
                  <Layers2
                    size={22}
                    className="text-[#283C5D] hover:text-white"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 z-[9999] w-56 overflow-hidden rounded-2xl border border-[#283C5D]/10 bg-white p-2 shadow-xl shadow-[#283C5D]/15">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);

                        router.push(
                          "/dashboard/messenger",
                        );
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
                    >
                      <MessageCircle className="h-5 w-5" />

                      {t("messages")}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);

                        router.push(
                          `/dashboard/${userId}`,
                        );
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
                    >
                      <UserRoundPen className="h-5 w-5" />

                      {t("profile")}
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <LogOut className="h-5 w-5" />

                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavbarButton
                href={authHref}
                variant="secondary"
                className="cursor-pointer border border-black/10 bg-white hover:bg-[#283C5D] hover:text-white active:scale-[0.97]"
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
              onClick={() =>
                setIsMobileMenuOpen(
                  !isMobileMenuOpen,
                )
              }
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() =>
              setIsMobileMenuOpen(false)
            }
          >
            {navItems.map((item, idx) =>
              item.subItems ? (
                <div
                  key={`mobile-link-${idx}`}
                  className="flex w-full flex-col gap-2 border-b border-neutral-100 pb-4"
                >
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    {item.name}
                  </span>

                  {item.subItems.map(
                    (sub, subIdx) => (
                      <Link
                        key={subIdx}
                        href={sub.link}
                        onClick={() =>
                          setIsMobileMenuOpen(
                            false,
                          )
                        }
                        className="flex items-center gap-2 rounded-xl bg-[#283C5D]/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#283C5D] hover:text-white"
                      >
                        <span>
                          {sub.name}
                        </span>
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <Link
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className="relative text-white"
                >
                  <span className="block">
                    {item.name}
                  </span>
                </Link>
              ),
            )}

            <div className="flex w-full flex-col gap-4">
              <LanguageSwitcher />

              {!isPending && session ? (
                <div className="flex w-full flex-col gap-2 rounded-2xl border border-[#283C5D]/10 bg-white p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);

                      router.push(
                        "/dashboard",
                      );
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-[#FAF9F7]"
                  >
                    <MessageCircle size={20} />

                    {t("messages")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);

                      router.push(
                        `/dashboard/${userId}`,
                      );
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-[#FAF9F7]"
                  >
                    <UserRoundPen size={20} />

                    {t("profile")}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={20} />

                    {t("logout")}
                  </button>
                </div>
              ) : (
                <NavbarButton
                  href={authHref}
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
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