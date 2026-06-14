"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/auth-client";

export default function EmptyChatHero() {
  const t = useTranslations("dashboard.messages");
  const { data: session } = authClient.useSession();

  const userName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "";

  return (
    <main className="flex h-full items-center justify-center bg-white p-6">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 16,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="relative h-24 w-24 md:h-32 md:w-32">
          <Image
            src="/logo.svg"
            alt="Esthetic Match"
            fill
            priority
            className="object-contain"
          />
        </div>

        <h1 className="mt-6 text-xl font-semibold text-[#283C5D] md:text-2xl">
          {userName ? `${t("welcome")}, ${userName}` : t("welcome")}
        </h1>

        <p className="mt-2 text-sm font-medium text-[#283C5D]/60 md:text-base">
          {t("noMessagesYet")}
        </p>
      </motion.div>
    </main>
  );
}