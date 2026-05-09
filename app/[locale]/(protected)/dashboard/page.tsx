import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "@/i18n/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: "en" | "fr" }>;
}) {
  const { locale } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect({
      href: "/sign-in",
      locale,
    });
  }

  if (
    session?.user.role === "DOCTOR" &&
    !session.user.onboardingCompleted
  ) {
    redirect({
      href: "/dashboard/onboarding",
      locale,
    });
  }

  return <main>
    <div className="relative overflow-hidden rounded-2xl border border-[#d8bd8d]/30 bg-gradient-to-br from-[#283C5D] via-[#35445D] to-[#1f2d46] p-10 shadow-2xl">
  {/* Background Glow */}
  <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#d8bd8d]/20 blur-3xl" />
  <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

  <div className="relative z-10 flex flex-col items-center text-center">
    {/* Icon */}
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-10 w-10 text-[#f4e4c6]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21h9A2.25 2.25 0 0018.75 18.75V6.75A2.25 2.25 0 0016.5 4.5h-9A2.25 2.25 0 005.25 6.75v12A2.25 2.25 0 007.5 21z"
        />
      </svg>
    </div>

    {/* Title */}
    <h2 className="text-3xl font-semibold tracking-tight text-white">
      Messenger
    </h2>

    {/* Badge */}
    <div className="mt-4 rounded-full border border-[#d8bd8d]/30 bg-[#d8bd8d]/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-[#f4e4c6]">
      Under Construction
    </div>

    {/* Description */}
    <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70">
      Our secure doctor-patient messaging experience is currently being built.
      Soon you’ll be able to communicate, share updates, and send images directly
      through the platform.
    </p>

    {/* Decorative line */}
    <div className="mt-8 h-px w-32 bg-gradient-to-r from-transparent via-[#d8bd8d]/50 to-transparent" />

    {/* Coming Soon */}
    <p className="mt-4 text-sm font-medium text-[#f4e4c6]">
      Coming Soon
    </p>
  </div>
</div>
  </main>;
}