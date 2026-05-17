"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function EmptyChatHero() {
  return (
    <main className="flex h-full items-center justify-center bg-[#FAF9F7] p-6">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] border border-[#d8bd8d]/30 bg-gradient-to-br from-[#d8bd8d] via-[#f4e4c6] to-[#FAF9F7] shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(40,60,93,0.18),transparent_40%)]" />

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.85,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative flex flex-col items-center justify-center text-center"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative h-40 w-40 md:h-56 md:w-56"
          >
            <Image
              src="/logoBlue.svg"
              alt="Default"
              fill
              priority
              className="rounded-2xl object-contain drop-shadow-xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}