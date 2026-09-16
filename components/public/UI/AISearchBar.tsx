"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowUp,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AnimatePresence,
  motion,
} from "motion/react";

type Props = {
  onSubmit: (
    query: string,
  ) => void;

  chatMode?: boolean;

  disabled?: boolean;
};

export default function AISearchBar({
  onSubmit,
  chatMode = false,
  disabled = false,
}: Props) {
  const t = useTranslations(
    "Emi.AISearchBar",
  );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    placeholderIndex,
    setPlaceholderIndex,
  ] = useState(0);

  const placeholders =
    useMemo(
      () =>
        t.raw(
          "aiPlaceholders",
        ) as string[],
      [t],
    );

  useEffect(() => {
    if (
      placeholders.length <= 1
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setPlaceholderIndex(
            (current) =>
              (current + 1) %
              placeholders.length,
          );
        },
        2800,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [placeholders]);

  function handleSearch() {
    const trimmedQuery =
      query.trim();

    if (
      !trimmedQuery ||
      disabled
    ) {
      return;
    }

    onSubmit(
      trimmedQuery,
    );

    setQuery("");
  }

  return (
    <motion.div
      initial={
        chatMode
          ? false
          : {
              maxWidth: 520,
              opacity: 0,
              scale: 0.97,
            }
      }
      animate={{
        maxWidth: 1024,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        maxWidth: {
          duration: 0.9,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        },

        opacity: {
          duration: 0.4,
        },

        scale: {
          duration: 0.7,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        },
      }}
      className="mx-auto w-full"
    >
      <motion.div
        animate={{
          borderRadius:
            chatMode
              ? 28
              : 32,
        }}
        transition={{
          duration: 0.6,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="
          flex
          w-full
          items-center
          gap-2
          border
          border-white/20
          bg-white
          p-2
          shadow-[0_20px_70px_rgba(3,18,32,0.18)]
          backdrop-blur-xl
        "
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.4rem] bg-[#FAF9F7] px-4 py-3.5 text-[#283C5D]">
          <Search
            size={18}
            strokeWidth={1.8}
            className="shrink-0 opacity-70"
          />

          <div className="relative min-w-0 flex-1">
            <AnimatePresence
              mode="wait"
            >
              {!query &&
                !disabled && (
                  <motion.span
                    key={
                      placeholderIndex
                    }
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 0.5,
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
                    className="pointer-events-none absolute inset-0 flex items-center truncate text-sm text-[#283C5D]"
                  >
                    {
                      placeholders[
                        placeholderIndex
                      ]
                    }
                  </motion.span>
                )}
            </AnimatePresence>

            {disabled &&
              !query && (
                <span className="pointer-events-none absolute inset-0 flex items-center truncate text-sm text-[#283C5D]/40">
                  ...
                </span>
              )}

            <input
              type="text"
              value={query}
              disabled={
                disabled
              }
              aria-label={t(
                "aiSearchLabel",
              )}
              onChange={(
                event,
              ) =>
                setQuery(
                  event.target
                    .value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  handleSearch();
                }
              }}
              className="
                relative
                z-10
                w-full
                bg-transparent
                text-sm
                text-[#283C5D]
                outline-none

                disabled:cursor-not-allowed
              "
            />
          </div>
        </div>

        {chatMode ? (
          <motion.button
            type="button"
            onClick={
              handleSearch
            }
            disabled={
              disabled ||
              !query.trim()
            }
            whileHover={
              disabled
                ? undefined
                : {
                    scale:
                      1.05,
                  }
            }
            whileTap={
              disabled
                ? undefined
                : {
                    scale:
                      0.93,
                  }
            }
            className="
              flex
              h-11
              w-11
              shrink-0
              cursor-pointer
              items-center
              justify-center
              rounded-full
              bg-[#D8BD8D]
              text-[#061A2D]
              transition-colors
              hover:bg-[#F4E4C6]

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ArrowUp
              size={19}
              strokeWidth={2}
            />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={
              handleSearch
            }
            disabled={
              disabled ||
              !query.trim()
            }
            whileHover={
              disabled
                ? undefined
                : {
                    scale:
                      1.02,
                  }
            }
            whileTap={
              disabled
                ? undefined
                : {
                    scale:
                      0.97,
                  }
            }
            className="
              shrink-0
              cursor-pointer
              rounded-full
              bg-[#D8BD8D]
              px-7
              py-3.5
              text-sm
              font-semibold
              text-[#061A2D]
              transition-colors
              hover:bg-[#F4E4C6]

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {t(
              "search",
            )}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}