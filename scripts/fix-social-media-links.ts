// scripts/fix-social-media-links.ts
import { prisma } from "@/lib/database/prisma";

async function main() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }

  const profiles = await prisma.doctorProfile.findMany({
    where: {
      socialMediaLink: {
        contains: "/doctors/",
      },
      slug: {
        not: null,
      },
    },
    select: {
      id: true,
      slug: true,
      socialMediaLink: true,
    },
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const profile of profiles) {
    if (!profile.socialMediaLink || !profile.slug) {
      skippedCount++;
      continue;
    }

    const currentUrl = new URL(profile.socialMediaLink);
    const segments = currentUrl.pathname.split("/").filter(Boolean);

    const locale = segments[0] || "en";
    const currentLastSegment = segments[segments.length - 1];

    // Skip links that are already correct
    if (currentLastSegment === profile.slug) {
      skippedCount++;
      continue;
    }

    // Only fix links that currently use the doctorProfile id
    if (currentLastSegment !== profile.id) {
      skippedCount++;
      continue;
    }

    await prisma.doctorProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        socialMediaLink: `${appUrl}/${locale}/doctors/${profile.slug}`,
      },
    });

    updatedCount++;
  }

  console.log(`Updated ${updatedCount} broken social media links.`);
  console.log(`Skipped ${skippedCount} links.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });