"use client";

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/UI/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { authClient } from "@/lib/auth-client";
import { useRouter, Link } from "@/i18n/navigation";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
});

type NavPanelProps = {
  children: React.ReactNode;
};

export function NavPanel({ children }: NavPanelProps) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const { data: session } = authClient.useSession();

  const userId = session?.user?.id;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  const links = [
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Profile",
      href: `/dashboard/${userId}`,
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <IconSettings className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Logout",
      href: "/",
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-white" />,
    },
  ];

  return (
    <div className={`flex min-h-screen w-full bg-[#283C5D] ${dmSans.className}`}>
      <aside className="sticky top-0 h-screen shrink-0 z-25">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}

              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={link}
                    onClick={
                      link.label === "Logout" ? handleSignOut : undefined
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <SidebarLink
                link={{
                  label: "regard Debo, I'm a lobster !",
                  href: userId ? `/dashboard/${userId}` : "/dashboard",
                  icon: (
                    <img
                      src="/pp.png"
                      className="h-7 w-7 shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
              />
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

//////////////////////////////////////////////////////////////////////////////////////LOGO///////////////////////////////////////////////////////////////////////
export const Logo = () => {
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

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-thin text-white"
      >
        Esthetic Match
      </motion.span>
    </Link>
  );
};

///////////////////////////////////////////////////////////////////////////////////// LOGO ICON /////////////////////////////////////////////////////////////////////////
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