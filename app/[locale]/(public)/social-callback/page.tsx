// app/[locale]/auth/social-callback/page.tsx
import { redirect } from "@/i18n/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type SocialCallbackPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    role?: string;
    dateOfBirth?: string;
  }>;
};

export default async function SocialCallbackPage({
  params,
  searchParams,
}: SocialCallbackPageProps) {
  const { locale } = await params;
  const { role, dateOfBirth } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (!userId) {
    redirect({
      href: "/sign-in",
      locale,
    });
  }

  if (role === "PATIENT") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "PATIENT",
        emailVerified: true,
        dateOfBirth: dateOfBirth || null,
      },
    });

    await prisma.patientProfile.upsert({
      where: {
        userId,
      },
      update: {
        avatar: session?.user.image || null,
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        avatar: session?.user.image || null,
        favorite: [],
      },
    });

    redirect({
      href: "/dashboard",
      locale,
    });
  }

  redirect({
    href: "/dashboard",
    locale,
  });
}