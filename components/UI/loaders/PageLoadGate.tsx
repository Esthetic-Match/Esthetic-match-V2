"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Loading from "@/components/UI/loaders/Loading";

type PageLoadGateProps = {
  children: React.ReactNode;
};

export default function PageLoadGate({ children }: PageLoadGateProps) {
  const [loaded, setLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    let loaderTimer: ReturnType<typeof setTimeout>;

    const handleLoad = () => {
      setLoaded(true);

      loaderTimer = setTimeout(() => {
        setShowLoader(false);
      }, 700);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(loaderTimer);
    };
  }, []);

  return (
    <>
      <div
        className={[
          "transition-opacity duration-700 ease-out",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {children}
      </div>

      {showLoader && (
        <div
          className={[
            "fixed inset-0 z-[9999] flex items-center justify-center bg-[#FAF9F7]",
            "transition-all duration-700 ease-out",
            loaded
              ? "pointer-events-none opacity-0 scale-[1.02]"
              : "opacity-100 scale-100",
          ].join(" ")}
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <Image
              src="/logo.svg"
              alt="Esthetic Match"
              width={90}
              height={40}
              priority
              className="h-auto w-[90px] sm:w-[120px]"
            />
            <Loading variant="compact" label="Chargement…" />
          </div>
        </div>
      )}
    </>
  );
}