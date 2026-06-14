"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

export function NavbarAuth() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Link href="/sign-in">Sign in</Link>;
  }

  return (
    <div className="flex items-center gap-3">
      <span>{session.user.email}</span>
      <Link href="/dashboard">Dashboard</Link>
    </div>
  );
}