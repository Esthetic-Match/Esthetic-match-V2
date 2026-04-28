"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#35445D] text-white">
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12 lg:flex-row lg:justify-between lg:px-16">
        <div className="max-w-xl text-center lg:text-left">
          <div className="mb-8">
            <div className="mb-4 flex justify-center lg:justify-start">
              <div className="flex h-30 w-30 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-4xl font-bold tracking-wider">
                <Image
                  src="/logo.svg"
                  alt="Esthetic Match"
                  width={72}
                  height={72}
                  className="mb-2"
                />
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-[0.25em] text-[#f1e3db] sm:text-4xl">
              ESTHETIC MATCH
            </h1>
          </div>

          <div className="mx-auto mb-8 h-px w-full max-w-xs bg-white/40 lg:mx-0" />

          <p className="mb-10 text-lg leading-8 text-white/90 sm:text-xl">
            Find the right aesthetic practitioner according to your needs.
          </p>

          <div className="inline-flex rounded-full border border-[#f1e3db]/30 bg-white/5 px-6 py-3 text-sm font-medium tracking-[0.2em] uppercase text-[#f1e3db]">
            Under Development
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="rounded-full border border-[#f1e3db]/40 px-6 py-3 text-sm font-medium tracking-[0.2em] uppercase text-[#f1e3db] transition hover:bg-white/10"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="rounded-full bg-[#f1e3db] px-6 py-3 text-sm font-semibold tracking-[0.2em] uppercase text-[#061b3a] transition hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>

          <div className="text-xs uppercase tracking-[0.2em] text-[#f1e3db]/70">
            security testing
          </div>
        </div>
      </section>
    </main>
  );
}