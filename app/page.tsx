export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#061b3a] text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12 lg:flex-row lg:justify-between lg:px-16">
        <div className="max-w-xl text-center lg:text-left">
          <div className="mb-8">
            <div className="mb-4 flex justify-center lg:justify-start">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-4xl font-bold tracking-wider">
                M
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-[0.25em] text-[#f1e3db] sm:text-4xl">
              ESTHETIC MATCH
            </h1>
          </div>

          <div className="mb-8 h-px w-full max-w-xs bg-white/40 mx-auto lg:mx-0" />

          <p className="mb-10 text-lg leading-8 text-white/90 sm:text-xl">
            Find the right aesthetic practitioner according to your needs.
          </p>

          <div className="inline-flex rounded-full border border-[#f1e3db]/30 bg-white/5 px-6 py-3 text-sm font-medium tracking-[0.2em] text-[#f1e3db] uppercase">
            Under Development
          </div>
        </div>

        <div className="mt-14 flex w-full max-w-md justify-center lg:mt-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-[2.5rem] bg-white/10 blur-2xl" />
            <div className="relative w-[280px] rounded-[2.5rem] border border-white/10 bg-[#0b2144] p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[2rem] bg-[#f3e8df]">
                <div className="flex items-center justify-between bg-[#0b2144] px-5 py-3 text-xs text-white/80">
                  <span>9:41</span>
                  <span>◦◦◦</span>
                </div>

                <div className="flex h-[260px] items-center justify-center bg-gradient-to-b from-[#15345f] to-[#0b2144]">
                  <div className="text-center text-white/80">
                    <div className="mb-3 text-6xl">✨</div>
                    <p className="text-sm">Esthetic Match App Preview</p>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-6 text-[#1e2c3f]">
                  <div>
                    <h2 className="text-xl font-semibold leading-tight">
                      Welcome to Esthetic Match
                    </h2>
                    <p className="mt-2 text-sm text-[#5f6b7a]">
                      Our platform is currently being developed and will launch
                      soon.
                    </p>
                  </div>

                  <button className="w-full rounded-full bg-[#112f5c] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90">
                    Coming Soon
                  </button>

                  <p className="text-center text-xs text-[#7a8491]">
                    Esthetic Match © 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}