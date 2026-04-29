"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed, Mail, ChevronLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Invalid credentials.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-black">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,_rgba(53,68,93,0.12),_transparent_60%),radial-gradient(circle_at_85%_75%,_rgba(53,68,93,0.08),_transparent_60%)] blur-3xl" />
        
        {/* Top Blue Banner */}
        <div className="relative w-full bg-[#35445D] py-10 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_70%)]" />
          
          <div className="relative flex flex-col items-center">
            <Image
              src="/logo.svg"
              alt="Esthetic Match"
              width={80}
              height={80}
              className="mb-3"
            />
        
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Esthetic Match
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="absolute left-6 top-6 flex items-center gap-2 text-sm text-white transition 
            hover:scale-[1.02] hover:bg-white hover:text-black border border-white/40 rounded-full px-2 pr-5 py-1 cursor-pointer"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        </div>

      <section className="relative mx-auto flex min-h-screen max-w-md flex-col">

        <div className="flex flex-1 flex-col px-3 pt-5">

          <div className="mb-7 text-center">
            <h1 className="text-[21px] font-semibold leading-tight text-black">
              Login To Esthetic Match
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[15px] font-medium text-black">
                Email Address
              </label>

              <div className="flex h-9 items-center rounded-full bg-[#d8bd8d] px-4">
                <input
                  className="w-full bg-transparent text-sm text-black placeholder:text-black/50 outline-none"
                  placeholder="Enter Your Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Mail size={16} className="text-black/60" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-medium text-black">
                Password
              </label>

              <div className="flex h-9 items-center rounded-full bg-white/60 px-4">
                <input
                  className="w-full bg-transparent text-sm text-black placeholder:text-black/40 outline-none"
                  placeholder="Enter Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-[#d8bd8d]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeClosed size={17}  className="hover:scale-[1.05] cursor-pointer"/> : <Eye size={17} className="hover:scale-[1.05] cursor-pointer" />}
                </button>
              </div>

              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#ead3a5] underline underline-offset-2"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-lg bg-[#94604C] px-3 py-2 text-sm text-[#FDFDFD]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full cursor-pointer rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6] text-sm font-semibold text-[#0f233f] transition-transform duration-200 hover:scale-[1.02] disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline underline-offset-2">
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}