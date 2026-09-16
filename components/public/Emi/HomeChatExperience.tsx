"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import AISearchBar from "../UI/AISearchBar";
import EmiAssistantResponse from "./EmiAssistantResponse";
import EmiLoadingDots from "./EmiLoadingDots";
import HeroIntro from "../UI/HeroIntro";

import type {
  EmiConversationTurn,
  EmiRecommendResponse,
} from "./types";

type Props = {
  eyebrow: string;
  line1: string;
  line2: string;
  line3: string;
};

const smoothEase = [
  0.22,
  1,
  0.36,
  1,
] as const;

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function HomeChatExperience({
  eyebrow,
  line1,
  line2,
  line3,
}: Props) {
  const locale =
    useLocale();

  const t = useTranslations(
    "Emi.EmiConversation",
  );

  const [
    turns,
    setTurns,
  ] = useState<
    EmiConversationTurn[]
  >([]);

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const isChat =
    turns.length > 0;

  const isLoading =
    turns.some(
      (turn) =>
        turn.status ===
        "loading",
    );

  const runQuery =
    useCallback(
      async (
        query: string,
      ) => {
        const trimmedQuery =
          query.trim();

        if (
          !trimmedQuery ||
          isLoading
        ) {
          return;
        }

        const id =
          createId();

        const newTurn: EmiConversationTurn =
          {
            id,
            query:
              trimmedQuery,
            status:
              "loading",
            response: null,
            error: null,
          };

        setTurns(
          (current) => [
            ...current,
            newTurn,
          ],
        );

        try {
          const response =
            await fetch(
              "/api/ai/recommend",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    {
                      query:
                        trimmedQuery,

                      locale,

                      procedureLimit:
                        5,

                      doctorLimit:
                        6,
                    },
                  ),
              },
            );

          const data =
            (await response.json()) as EmiRecommendResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.error ??
                t(
                  "searchError",
                ),
            );
          }

          setTurns(
            (current) =>
              current.map(
                (turn) =>
                  turn.id ===
                  id
                    ? {
                        ...turn,

                        status:
                          "complete",

                        response:
                          data,

                        error:
                          null,
                      }
                    : turn,
              ),
          );

          window.setTimeout(
            () => {
              bottomRef.current?.scrollIntoView(
                {
                  behavior:
                    "smooth",
                  block:
                    "end",
                },
              );
            },
            120,
          );
        } catch (
          error
        ) {
          console.error(
            "Emi request failed:",
            error,
          );

          setTurns(
            (current) =>
              current.map(
                (turn) =>
                  turn.id ===
                  id
                    ? {
                        ...turn,

                        status:
                          "error",

                        response:
                          null,

                        error:
                          error instanceof
                          Error
                            ? error.message
                            : t(
                                "genericError",
                              ),
                      }
                    : turn,
              ),
          );
        }
      },
      [
        isLoading,
        locale,
        t,
      ],
    );

  return (
    <motion.section
      animate={{
        backgroundColor:
          isChat
            ? "#040F1E"
            : "#07182A",
      }}
      transition={{
        duration: 1.15,
        ease: smoothEase,
      }}
      className="relative h-svh overflow-hidden text-white"
    >
      {/* =========================
          VIDEO
      ========================== */}

      <motion.div
        initial={false}
        animate={{
          opacity: isChat
            ? 0
            : 1,

          scale: isChat
            ? 1.06
            : 1,

          filter: isChat
            ? "blur(10px)"
            : "blur(0px)",
        }}
        transition={{
          duration: 1,
          ease: smoothEase,
        }}
        className="pointer-events-none absolute inset-0"
      >
        <video
          className="
            pointer-events-none
            h-full
            w-full
            object-cover
            object-start

            [&::-webkit-media-controls]:hidden
            [&::-webkit-media-controls-enclosure]:hidden
            [&::-webkit-media-controls-panel]:hidden
            [&::-webkit-media-controls-play-button]:hidden
            [&::-webkit-media-controls-start-playback-button]:hidden
          "
          src="/videos/hero-video.mp4"
          poster="/images/hero-bg.png"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={false}
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
        />
      </motion.div>

      {/* ORIGINAL DARK HERO OVERLAY */}

      <motion.div
        initial={false}
        animate={{
          opacity: isChat
            ? 0
            : 1,
        }}
        transition={{
          duration: 0.8,
          ease: smoothEase,
        }}
        className="pointer-events-none absolute inset-0 bg-[#07182A]/55"
      />

      {/* =========================
          ANIMATED CHAT BACKGROUND
      ========================== */}

      <motion.div
        initial={false}
        animate={{
          opacity: isChat
            ? 1
            : 0,
        }}
        transition={{
          duration: 1.3,
          ease: smoothEase,
        }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* TOP LEFT GLOW */}

        <motion.div
          animate={
            isChat
              ? {
                  x: [
                    0,
                    120,
                    50,
                    -60,
                    0,
                  ],

                  y: [
                    0,
                    70,
                    160,
                    80,
                    0,
                  ],

                  scale: [
                    1,
                    1.2,
                    0.95,
                    1.1,
                    1,
                  ],
                }
              : {}
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType:
              "mirror",
            ease:
              "easeInOut",
          }}
          className="
            absolute
            -left-40
            -top-40
            h-[38rem]
            w-[38rem]
            rounded-full
            bg-[#315C82]/45
            blur-[120px]
          "
        />

        {/* BOTTOM RIGHT GLOW */}

        <motion.div
          animate={
            isChat
              ? {
                  x: [
                    0,
                    -120,
                    -40,
                    70,
                    0,
                  ],

                  y: [
                    0,
                    -90,
                    -160,
                    -50,
                    0,
                  ],

                  scale: [
                    1,
                    1.15,
                    1.3,
                    1.05,
                    1,
                  ],
                }
              : {}
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType:
              "mirror",
            ease:
              "easeInOut",
          }}
          className="
            absolute
            -bottom-56
            right-[-10rem]
            h-[42rem]
            w-[42rem]
            rounded-full
            bg-[#0D416A]/60
            blur-[130px]
          "
        />

        {/* CENTER / FLOATING GLOW */}

        <motion.div
          animate={
            isChat
              ? {
                  x: [
                    "-50%",
                    "-35%",
                    "-60%",
                    "-45%",
                    "-50%",
                  ],

                  y: [
                    "-50%",
                    "-65%",
                    "-35%",
                    "-55%",
                    "-50%",
                  ],

                  scale: [
                    1,
                    1.25,
                    1.05,
                    1.2,
                    1,
                  ],

                  rotate: [
                    0,
                    25,
                    -15,
                    15,
                    0,
                  ],
                }
              : {}
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            ease:
              "easeInOut",
          }}
          className="
            absolute
            left-1/2
            top-1/2
            h-[46rem]
            w-[46rem]
            rounded-full
            bg-[#436D91]/25
            blur-[150px]
          "
        />

        {/* SUBTLE EXTRA BLUE GLOW */}

        <motion.div
          animate={
            isChat
              ? {
                  x: [
                    0,
                    180,
                    80,
                    0,
                  ],

                  y: [
                    0,
                    -100,
                    100,
                    0,
                  ],

                  scale: [
                    1,
                    1.35,
                    1.1,
                    1,
                  ],
                }
              : {}
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType:
              "mirror",
            ease:
              "easeInOut",
          }}
          className="
            absolute
            bottom-[10%]
            left-[15%]
            h-[28rem]
            w-[28rem]
            rounded-full
            bg-[#1B5D8F]/25
            blur-[130px]
          "
        />
      </motion.div>

      {/* =========================
          CONTENT
      ========================== */}

      <div className="relative z-10 h-full px-5 md:px-10 lg:px-16">
        <AnimatePresence
          mode="popLayout"
          initial={false}
        >
          {!isChat ? (
            /* =========================
               HERO STATE
            ========================== */

            <motion.div
              key="hero"
              initial={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                y: -45,
                scale: 0.97,

                filter:
                  "blur(8px)",
              }}
              transition={{
                duration: 0.65,
                ease: smoothEase,
              }}
              className="mx-auto flex h-full w-full max-w-6xl items-center justify-center"
            >
              <div className="flex w-full flex-col items-center text-center">
                <HeroIntro
                  eyebrow={
                    eyebrow
                  }
                  line1={
                    line1
                  }
                  line2={
                    line2
                  }
                  line3={
                    line3
                  }
                />

                <motion.div
                  layoutId="emi-search-bar"
                  transition={{
                    layout: {
                      duration:
                        0.9,

                      ease:
                        smoothEase,
                    },
                  }}
                  className="mt-8 w-full max-w-4xl"
                >
                  <AISearchBar
                    disabled={
                      isLoading
                    }
                    onSubmit={(
                      query,
                    ) => {
                      void runQuery(
                        query,
                      );
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* =========================
               CHAT STATE
            ========================== */

            <motion.div
              key="chat"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.25,
                duration: 0.6,
              }}
              className="mx-auto flex h-full w-full max-w-5xl flex-col"
            >
            {/* =====================
                CHAT AREA
            ====================== */}

            <div className="relative min-h-0 flex-1">
              {/* SCROLLABLE MESSAGES */}
            
              <div
                className="
                  emi-scrollbar-hidden
                  absolute
                  inset-0
                  overflow-y-auto
                  pb-40
                  pt-24
            
                  md:pb-44
                  md:pt-28
                "
              >
                <div className="space-y-10">
                  {turns.map(
                    (
                      turn,
                      index,
                    ) => (
                      <motion.div
                        key={turn.id}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        className="space-y-6"
                      >
                        {/* USER MESSAGE */}
                      
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 25,
                            scale: 0.96,
                            filter:
                              "blur(8px)",
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter:
                              "blur(0px)",
                          }}
                          transition={{
                            duration: 0.7,
                          
                            delay:
                              index === 0
                                ? 0.5
                                : 0,
                          
                            ease:
                              smoothEase,
                          }}
                          className="flex justify-end"
                        >
                          <div
                            className="
                              max-w-[85%]
                              rounded-[1.6rem]
                              rounded-br-md
                              bg-white
                              px-5
                              py-4
                              text-[15px]
                              leading-6
                              text-[#183B5D]
                              shadow-[0_16px_50px_rgba(4,20,35,0.14)]
                        
                              sm:max-w-[75%]
                              md:max-w-[65%]
                            "
                          >
                            {turn.query}
                          </div>
                        </motion.div>
                        
                        {/* AI LOADING */}
                        
                        {turn.status ===
                          "loading" && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 12,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                index === 0
                                  ? 0.75
                                  : 0.15,
                            
                              duration: 0.4,
                            }}
                          >
                              <EmiLoadingDots />
                          </motion.div>
                        )}

                        {/* AI RESPONSE */}
                      
                        {turn.status ===
                          "complete" &&
                          turn.response && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 24,
                                filter: "blur(6px)",
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                              }}
                              transition={{
                                duration: 0.7,
                                ease: smoothEase,
                              }}
                              className="
                                relative
                                overflow-hidden
                                rounded-[2rem]
                                border
                                border-white/15
                                bg-white/[0.08]
                                p-5
                                text-white
                                shadow-[0_20px_70px_rgba(0,0,0,0.18)]
                                backdrop-blur-2xl
                                backdrop-saturate-150
                            
                                before:pointer-events-none
                                before:absolute
                                before:inset-0
                                before:rounded-[inherit]
                                before:bg-gradient-to-br
                                before:from-white/[0.10]
                                before:via-white/[0.03]
                                before:to-transparent
                            
                                sm:p-6
                              "
                            >
                              <div className="relative z-10">
                                <EmiAssistantResponse
                                  response={turn.response}
                                />
                              </div>
                            </motion.div>
                          )}

                        {/* ERROR */}
                        
                        {turn.status ===
                          "error" && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 15,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.4,
                            }}
                            className="
                              max-w-xl
                              rounded-[1.5rem]
                              rounded-tl-md
                              border
                              border-red-300/20
                              bg-red-500/10
                              px-5
                              py-4
                              text-sm
                              leading-6
                              text-red-100
                              backdrop-blur-xl
                            "
                          >
                            {turn.error ??
                              t(
                                "fallbackError",
                              )}
                          </motion.div>
                        )}
                      </motion.div>
                    ),
                  )}

                  <div ref={bottomRef} />
                </div>
              </div>
                
              {/* =====================
                  FLOATING CHAT INPUT
              ====================== */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  z-20
                  rounded-t-[2rem]
                  bg-[#040F1E]
                  pb-5
                  md:pb-3
                "
              >
                <motion.div
                  layoutId="emi-search-bar"
                  transition={{
                    layout: {
                      duration: 0.95,
                      ease:
                        smoothEase,
                    },
                  }}
                  className="w-full"
                >
                  <AISearchBar
                    chatMode
                    disabled={isLoading}
                    onSubmit={(
                      query,
                    ) => {
                      void runQuery(
                        query,
                      );
                    }}
                  />
                </motion.div>
                  
                <p className="mt-2 text-center text-[11px] leading-4 text-white/30">
                  {t(
                    "disclaimer",
                  )}
                </p>
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}