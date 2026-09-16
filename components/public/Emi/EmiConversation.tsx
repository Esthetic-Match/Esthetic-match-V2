"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import { RotateCcw } from "lucide-react";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import Image from "next/image";

import EmiAssistantResponse from "./EmiAssistantResponse";
import EmiComposer from "./EmiComposer";
import EmiLoadingDots from "./EmiLoadingDots";

import type {
  EmiConversationTurn,
  EmiRecommendResponse,
} from "./types";

const PENDING_QUERY_KEY =
  "Emi:pending-query";

const CONVERSATION_KEY =
  "Emi:conversation";

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

/* ═════════════════════════════════════
   ANIMATED EMI BACKGROUND
═════════════════════════════════════ */

function AnimatedBlueBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* TOP LEFT GLOW */}

      <motion.div
        animate={{
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
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
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
        animate={{
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
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
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

      {/* CENTER FLOATING GLOW */}

      <motion.div
        animate={{
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
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
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

      {/* EXTRA BLUE GLOW */}

      <motion.div
        animate={{
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
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
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
    </div>
  );
}

/* ═════════════════════════════════════
   COMPONENT
═════════════════════════════════════ */

export default function EmiConversation() {
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

  const [
    initialized,
    setInitialized,
  ] = useState(false);

  const initializedRef =
    useRef(false);

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const isLoading =
    turns.some(
      (turn) =>
        turn.status ===
        "loading",
    );

  /* ═════════════════════════════════════
     RUN AI QUERY
  ═════════════════════════════════════ */

  const runQuery =
    useCallback(
      async (
        query: string,
      ) => {
        const trimmedQuery =
          query.trim();

        if (!trimmedQuery) {
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
            response:
              null,
            error:
              null,
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

                        error:
                          error instanceof
                          Error
                            ? error.message
                            : t(
                                "genericError",
                              ),

                        response:
                          null,
                      }
                    : turn,
              ),
          );
        }
      },
      [
        locale,
        t,
      ],
    );

  /* ═════════════════════════════════════
     RESTORE CONVERSATION
  ═════════════════════════════════════ */

  useEffect(() => {
    if (
      initializedRef.current
    ) {
      return;
    }

    initializedRef.current =
      true;

    let restoredTurns: EmiConversationTurn[] =
      [];

    try {
      const cached =
        sessionStorage.getItem(
          CONVERSATION_KEY,
        );

      if (cached) {
        const parsed =
          JSON.parse(cached);

        if (
          Array.isArray(
            parsed,
          )
        ) {
          restoredTurns =
            parsed;
        }
      }
    } catch {
      sessionStorage.removeItem(
        CONVERSATION_KEY,
      );
    }

    setTurns(
      restoredTurns,
    );

    const pendingRaw =
      sessionStorage.getItem(
        PENDING_QUERY_KEY,
      );

    sessionStorage.removeItem(
      PENDING_QUERY_KEY,
    );

    if (pendingRaw) {
      try {
        const pending =
          JSON.parse(
            pendingRaw,
          ) as {
            query?: string;
          };

        const query =
          pending.query?.trim();

        if (query) {
          setTurns([]);

          void runQuery(
            query,
          );
        }
      } catch {
        // Invalid pending payload.
      }
    }

    setInitialized(true);
  }, [runQuery]);

  /* ═════════════════════════════════════
     CACHE CONVERSATION
  ═════════════════════════════════════ */

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const cacheable =
      turns.filter(
        (turn) =>
          turn.status !==
          "loading",
      );

    sessionStorage.setItem(
      CONVERSATION_KEY,
      JSON.stringify(
        cacheable,
      ),
    );
  }, [
    initialized,
    turns,
  ]);

  /* ═════════════════════════════════════
     AUTO SCROLL
  ═════════════════════════════════════ */

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
        block: "end",
      },
    );
  }, [turns]);

  function clearConversation() {
    sessionStorage.removeItem(
      CONVERSATION_KEY,
    );

    sessionStorage.removeItem(
      PENDING_QUERY_KEY,
    );

    setTurns([]);
  }

  /* ═════════════════════════════════════
     INITIAL LOADING
  ═════════════════════════════════════ */

  if (!initialized) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#040F1E] text-white">
        <AnimatedBlueBackground />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="inline-flex rounded-[1.5rem] border border-white/10 bg-white/[0.07] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
            <EmiLoadingDots />
          </div>
        </div>
      </main>
    );
  }

  /* ═════════════════════════════════════
     PAGE
  ═════════════════════════════════════ */

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#040F1E] text-white">
      {/* BACKGROUND */}

      <AnimatedBlueBackground />

      {/* =========================
          PAGE CONTENT
      ========================== */}

      <div className="relative z-10 pt-10">
        {/* =========================
            HEADER
        ========================== */}

        <div
          className="
            sticky
            top-0
          "
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <AnimatePresence>
              {turns.length >
                0 && (
                <motion.button
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -5,
                  }}
                  transition={{
                    duration:
                      0.25,
                  }}
                  type="button"
                  disabled={
                    isLoading
                  }
                  onClick={
                    clearConversation
                  }
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.05]
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-white/55
                    backdrop-blur-xl
                    transition

                    hover:border-white/15
                    hover:bg-white/10
                    hover:text-white

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <RotateCcw
                    size={14}
                  />

                  {t(
                    "newSearch",
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* =========================
            CONVERSATION
        ========================== */}

        <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
          <div className="flex-1 py-8 sm:py-10">
            {turns.length ===
            0 ? (
              /* =====================
                 EMPTY STATE
              ====================== */

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                  filter:
                    "blur(8px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter:
                    "blur(0px)",
                }}
                transition={{
                  duration: 0.8,
                  ease:
                    smoothEase,
                }}
                className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center sm:py-24"
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1,
                    ease:
                      smoothEase,
                  }}
                  className="
                    relative
                    h-20
                    w-20
                    overflow-hidden
                    rounded-[1.6rem]
                    border
                    border-white/10
                    bg-white/[0.06]
                    shadow-[0_18px_55px_rgba(0,0,0,0.28)]
                    backdrop-blur-xl
                  "
                >
                  <Image
                    src="/images/Emi.png"
                    alt="Emi"
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                </motion.div>

                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {t(
                    "emptyTitle",
                  )}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
                  {t(
                    "emptyDescription",
                  )}
                </p>
              </motion.div>
            ) : (
              /* =====================
                 CONVERSATION TURNS
              ====================== */

              <div className="space-y-10">
                {turns.map(
                  (
                    turn,
                    index,
                  ) => (
                    <motion.div
                      key={
                        turn.id
                      }
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
                          y: 20,
                          scale:
                            0.97,
                          filter:
                            "blur(6px)",
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          filter:
                            "blur(0px)",
                        }}
                        transition={{
                          duration:
                            0.6,

                          delay:
                            index ===
                            0
                              ? 0.15
                              : 0,

                          ease:
                            smoothEase,
                        }}
                        className="flex justify-end"
                      >
                        <div
                          className="
                            max-w-[88%]
                            rounded-[1.5rem]
                            rounded-br-md
                            border
                            border-white/15
                            bg-white
                            px-5
                            py-3.5
                            text-sm
                            leading-6
                            text-[#183B5D]
                            shadow-[0_16px_45px_rgba(0,0,0,0.14)]

                            sm:max-w-[72%]
                            sm:text-[15px]
                          "
                        >
                          {
                            turn.query
                          }
                        </div>
                      </motion.div>

                      {/* LOADING */}

                      {turn.status ===
                        "loading" && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration:
                              0.4,
                          }}
                          className="
                            inline-flex
                            rounded-[1.5rem]
                            border
                            border-white/10
                            bg-white/[0.08]
                            px-5
                            py-4
                            shadow-[0_16px_45px_rgba(0,0,0,0.15)]
                            backdrop-blur-2xl
                          "
                        >
                          <EmiLoadingDots />
                        </motion.div>
                      )}

                      {/* ASSISTANT RESPONSE */}

                      {turn.status ===
                        "complete" &&
                        turn.response && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 24,
                              filter:
                                "blur(6px)",
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              filter:
                                "blur(0px)",
                            }}
                            transition={{
                              duration:
                                0.7,

                              ease:
                                smoothEase,
                            }}
                          >
                            <EmiAssistantResponse
                              response={
                                turn.response
                              }
                            />
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
                          className="flex items-start gap-3"
                        >
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 shadow-sm">
                            <Image
                              src="/images/Emi.png"
                              alt="Emi"
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          </div>

                          <div
                            className="
                              rounded-[1.4rem]
                              rounded-tl-md
                              border
                              border-red-300/20
                              bg-red-500/10
                              px-5
                              py-4
                              text-sm
                              text-red-100
                              shadow-[0_16px_45px_rgba(0,0,0,0.15)]
                              backdrop-blur-xl
                            "
                          >
                            {turn.error ??
                              t(
                                "fallbackError",
                              )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ),
                )}

                <div
                  ref={
                    bottomRef
                  }
                />
              </div>
            )}
          </div>

          {/* =========================
              COMPOSER
          ========================== */}

          <div
            className="
              sticky
              bottom-0
              z-20
              pb-5
              pt-10

              sm:pb-7
            "
          >
            <div className="mx-auto max-w-3xl">
              <EmiComposer
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

              <p className="mt-2 text-center text-[11px] leading-4 text-white/30">
                {t(
                  "disclaimer",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}