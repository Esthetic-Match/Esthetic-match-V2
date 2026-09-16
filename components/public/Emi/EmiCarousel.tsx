"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  type ReactNode,
  useRef,
} from "react";
import { useTranslations } from "next-intl";

type Props = {
  children: ReactNode;
};

export default function EmiCarousel({
  children,
}: Props) {
  const t = useTranslations(
    "Emi.EmiCarousel",
  );

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  function scroll(
    direction: "left" | "right",
  ) {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left:
        direction === "right"
          ? 340
          : -340,

      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      {/* CAROUSEL VIEWPORT */}
      <div className="px-0 md:px-12">
        <div
          ref={containerRef}
          className="
            flex
            snap-x
            snap-mandatory
            gap-4
            overflow-x-auto
            scroll-smooth
            pb-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {children}
        </div>
      </div>

      {/* LEFT */}
      <button
        type="button"
        onClick={() =>
          scroll("left")
        }
        aria-label={t(
          "scrollLeft",
        )}
        className="
          absolute
          left-1
          top-1/2
          z-20
          hidden
          h-9
          w-9
          -translate-y-1/2
          cursor-pointer
          items-center
          justify-center
          rounded-full
          border
          border-[#283C5D]/10
          bg-white
          text-[#283C5D]
          shadow-[0_8px_24px_rgba(4,15,30,0.16)]
          transition

          hover:bg-[#283C5D]
          hover:text-white

          md:flex
        "
      >
        <ChevronLeft
          size={17}
        />
      </button>

      {/* RIGHT */}
      <button
        type="button"
        onClick={() =>
          scroll("right")
        }
        aria-label={t(
          "scrollRight",
        )}
        className="
          absolute
          right-1
          top-1/2
          z-20
          hidden
          h-9
          w-9
          -translate-y-1/2
          cursor-pointer
          items-center
          justify-center
          rounded-full
          border
          border-[#283C5D]/10
          bg-white
          text-[#283C5D]
          shadow-[0_8px_24px_rgba(4,15,30,0.16)]
          transition

          hover:bg-[#283C5D]
          hover:text-white

          md:flex
        "
      >
        <ChevronRight
          size={17}
        />
      </button>
    </div>
  );
}