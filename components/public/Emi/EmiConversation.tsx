"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  RotateCcw,
} from "lucide-react";
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

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

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

  const runQuery =
    useCallback(
      async (
        query: string,
      ) => {
        const id =
          createId();

        const newTurn: EmiConversationTurn =
          {
            id,
            query,
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
                      query,
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

  /*
   * Restore the current browser
   * session and process the pending
   * homepage search.
   */
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

  /*
   * Cache completed conversation in
   * this browser tab/session.
   */
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

  /*
   * Keep latest response visible.
   */
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

  if (!initialized) {
    return (
      <main className="min-h-screen bg-[#FAF9F7]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <EmiLoadingDots />
        </div>
      </main>
    );
  }

  return (
    <main className="mt-10 min-h-screen bg-[#FAF9F7]">
      <div className="border-b border-[#283C5D]/8 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[#061A2D]">
                Emi
              </h1>

              <p className="text-xs text-[#283C5D]/55">
                {t(
                  "subtitle",
                )}
              </p>
            </div>
          </div>

          {turns.length >
            0 && (
            <button
              type="button"
              disabled={
                isLoading
              }
              onClick={
                clearConversation
              }
              className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[#283C5D]/60 transition hover:bg-[#283C5D]/5 hover:text-[#283C5D] disabled:opacity-40"
            >
              <RotateCcw
                size={14}
              />

              {t(
                "newSearch",
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex-1 py-8 sm:py-10">
          {turns.length ===
          0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center sm:py-24">
              <div className="relative h-16 w-16 overflow-hidden rounded-[1.25rem] shadow-lg shadow-[#283C5D]/15">
                <Image
                  src="/images/Emi.png"
                  alt="Emi"
                  fill
                  className="object-cover"
                  sizes="64px"
                  priority
                />
              </div>

              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#061A2D] sm:text-3xl">
                {t(
                  "emptyTitle",
                )}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#283C5D]/60 sm:text-base">
                {t(
                  "emptyDescription",
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {turns.map(
                (turn) => (
                  <div
                    key={
                      turn.id
                    }
                    className="space-y-6"
                  >
                    <div className="flex justify-end">
                      <div className="max-w-[88%] rounded-[1.5rem] rounded-tr-md bg-[#283C5D] px-5 py-3.5 text-sm leading-6 text-white shadow-sm sm:max-w-[72%] sm:text-[15px]">
                        {
                          turn.query
                        }
                      </div>
                    </div>

                    {turn.status ===
                      "loading" && (
                      <EmiLoadingDots />
                    )}

                    {turn.status ===
                      "complete" &&
                      turn.response && (
                        <EmiAssistantResponse
                          response={
                            turn.response
                          }
                        />
                      )}

                    {turn.status ===
                      "error" && (
                      <div className="flex items-start gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm">
                          <Image
                            src="/images/Emi.png"
                            alt="Emi"
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>

                        <div className="rounded-[1.4rem] rounded-tl-md border border-red-200 bg-white px-5 py-4 text-sm text-red-700 shadow-sm">
                          {turn.error ??
                            t(
                              "fallbackError",
                            )}
                        </div>
                      </div>
                    )}
                  </div>
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

        <div className="sticky bottom-0 bg-gradient-to-t from-[#FAF9F7] via-[#FAF9F7] to-transparent pb-5 pt-6 sm:pb-7">
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

            <p className="mt-2 text-center text-[11px] leading-4 text-[#283C5D]/40">
              {t(
                "disclaimer",
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}