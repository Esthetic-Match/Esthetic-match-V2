"use client";

import { authClient } from "@/lib/auth/auth-client";

export function UserSession() {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Failed to load session.</p>;
  if (!session) return <p>Not signed in.</p>;

  return <p>Signed in as {session.user.email}</p>;
}