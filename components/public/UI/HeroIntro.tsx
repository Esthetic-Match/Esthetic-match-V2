"use client";

import { motion } from "motion/react";

type Props = {
  eyebrow: string;
  line1: string;
  line2: string;
  line3: string;
};

export default function HeroIntro({
  eyebrow,
  line1,
  line2,
  line3,
}: Props) {
  return (
    <>
      <motion.p
        initial={{
          opacity: 0,
          y: 14,
          filter: "blur(6px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.15,
        }}
        className="mb-4 text-sm font-light uppercase tracking-[0.25em] text-[#d8bd8d]"
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl text-4xl font-light uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl"
      >
        <motion.span
          variants={{
            hidden: {
              opacity: 0,
              y: 24,
              filter: "blur(8px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.8,
                delay: 0.45,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
          className="block"
        >
          {line1}
        </motion.span>

        <motion.span
          variants={{
            hidden: {
              opacity: 0,
              y: 24,
              filter: "blur(8px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.8,
                delay: 0.62,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
          className="block"
        >
          {line2}
        </motion.span>

        <motion.span
          variants={{
            hidden: {
              opacity: 0,
              y: 24,
              filter: "blur(8px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.8,
                delay: 0.79,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
          className="block text-[#d8bd8d]"
        >
          {line3}
        </motion.span>
      </motion.h1>
    </>
  );
}