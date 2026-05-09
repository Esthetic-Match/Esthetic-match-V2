"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden 
      bg-[#FAF9F7] px-6 py-12"
    >
      {/* Background Blur */}
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] 
        -translate-x-1/2 -translate-y-1/2 rounded-full 
        bg-[#283C5D]/5 blur-3xl"
      />

      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        <Image
          src="/images/404.svg"
          alt="Page not found"
          width={320}
          height={320}
          priority
          className="h-auto w-64 md:w-80"
        />

        <p className="mt-8 text-sm uppercase tracking-[0.25em] text-[#283C5D]/50">
          404 Error
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#283C5D] md:text-5xl">
          Page not found
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-[#283C5D]/60 md:text-base">
          The page you are looking for does not exist or may have been moved.
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-8 inline-flex items-center gap-2 rounded-full 
          bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] 
          px-6 py-3 text-sm font-medium text-white shadow-md 
          transition hover:opacity-90 active:scale-[0.98]"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </main>
  );
}