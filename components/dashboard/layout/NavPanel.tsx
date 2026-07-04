"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/UI/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconShieldLock,
} from "@tabler/icons-react";
import { History } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
});

type NavPanelProps = {
  children: ReactNode;
};

type SidebarItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export function NavPanel({ children }: NavPanelProps) {
  const t = useTranslations("dashboard.dashboardLayout");
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const { data: session } = authClient.useSession();

  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const isAdmin = userRole === "ADMIN";
  const isPatient = userRole === "PATIENT";
  const showUserDashboardLinks = Boolean(userId) && !isAdmin;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  const links: SidebarItem[] = [
    ...(showUserDashboardLinks
      ? [
          {
            label: t("sidebar.messages"),
            href: "/dashboard/messages",
            icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-white" />,
          },
          {
            label: t("sidebar.profile"),
            href: `/dashboard/${userId}`,
            icon: <IconUserBolt className="h-5 w-5 shrink-0 text-white" />,
          },
        ]
      : []),

    ...(isPatient
      ? [
          {
            label: t("sidebar.bookingHistory"),
            href: "/dashboard/bookingHistory",
            icon: <History className="h-5 w-5 shrink-0 text-white" />,
          },
        ]
      : []),


        ...(isAdmin
    ? [
        {
          label: t("sidebar.adminPanel"),
          href: "/dashboard/adminPanel",
          icon: <IconShieldLock className="h-5 w-5 shrink-0 text-white" />,
        },
      ]
    : []),

    {
      label: t("sidebar.settings"),
      href: "/dashboard/settings",
      icon: <IconSettings className="h-5 w-5 shrink-0 text-white" />,
    },

    {
      label: t("sidebar.logout"),
      href: "/",
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-white" />,
    },
  ];

  return (
    <div className={`flex min-h-screen w-full bg-[#283C5D] ${dmSans.className}`}>
      <aside className="sticky top-0 z-25 h-screen shrink-0">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}

              <div className="mt-8 flex flex-col gap-2">
                {links.map((link: SidebarItem) => (
                  <SidebarLink
                    key={link.href}
                    link={link}
                    onClick={
                      link.label === t("sidebar.logout")
                        ? handleSignOut
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </aside>

      <main className="min-h-screen flex-1 overflow-x-hidden rounded-tl-2xl bg-white">
        {children}
      </main>
    </div>
  );
}

export const Logo = () => {
  const t = useTranslations("dashboard.dashboardLayout");

  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white"
    >
      <Image
        src="/logo.svg"
        alt={t("logoAlt")}
        width={28}
        height={28}
        className="mb-2"
      />

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-thin text-white"
      >
        {t("brandName")}
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white"
    >
      <Image
        src="/logo.svg"
        alt="Esthetic Match"
        width={28}
        height={28}
        className="mb-2"
      />
    </Link>
  );
};