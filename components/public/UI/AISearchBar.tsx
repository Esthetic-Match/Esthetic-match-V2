"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Search } from "lucide-react";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import { useRouter } from "@/i18n/navigation";

const PENDING_QUERY_KEY =
  "lumi:pending-query";

export default function AISearchBar() {
  const t = useTranslations("lumi.AISearchBar")

  const locale = useLocale();
  const router = useRouter();

  const [query, setQuery] =
    useState("");

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

    if (!trimmedQuery) {
      return;
    }

    sessionStorage.setItem(
      PENDING_QUERY_KEY,
      JSON.stringify({
        query: trimmedQuery,
        locale,
      }),
    );

    router.push("/lumi");
  }

  return (
    <motion.div
      initial={{
        maxWidth: 520,
        opacity: 0,
        scale: 0.97,
      }}
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
      className="w-full"
    >
      <div className="flex w-full flex-col gap-3 rounded-[2rem] bg-white p-3 shadow-2xl shadow-[#283C5D]/10 md:flex-row md:items-center md:rounded-full">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-[#FAF9F7] px-4 py-3 text-[#283C5D]">
          <Search
            size={18}
            className="shrink-0"
          />

          <div className="relative min-w-0 flex-1">
            <AnimatePresence
              mode="wait"
            >
              {!query && (
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
                    duration: 0.25,
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

            <input
              type="text"
              value={query}
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
                  "Enter"
                ) {
                  handleSearch();
                }
              }}
              className="relative z-10 w-full bg-transparent text-sm text-[#283C5D] outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleSearch
          }
          disabled={
            !query.trim()
          }
          className="shrink-0 cursor-pointer rounded-full bg-[#D8BD8D] px-7 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-[#F4E4C6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("search")}
        </button>
      </div>
    </motion.div>
  );
}