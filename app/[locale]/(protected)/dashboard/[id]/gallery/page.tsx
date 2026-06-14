import EditGallery from "@/components/dashboard/profile/gallery/EditGallery";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { redirect } from "@/i18n/navigation";
import { headers } from "next/headers";

export default async function EditGalleryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (!userId) {
    redirect({
      href: "/sign-in",
      locale: "en",
    });

    return null;
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId,
    },
    select: {
      procedureIds: true,
    },
  });

  return (
    <EditGallery
      userId={userId}
      procedureIds={doctorProfile?.procedureIds ?? []}
    />
  );
}