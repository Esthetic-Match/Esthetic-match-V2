import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">
        Welcome {session.user.name}
      </h1>
      <p className="mt-2 text-sm text-gray-600">{session.user.email}</p>
    </main>
  );
}