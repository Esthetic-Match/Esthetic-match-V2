import "dotenv/config";

import { prisma } from "@/lib/prisma";
import slugify from "slugify";

async function main() {
  const doctors = await prisma.doctorProfile.findMany({
    include: {
      user: true,
    },
  });

  for (const doctor of doctors) {
    if (!doctor.slug && doctor.clinicName) {
      const baseSlug = slugify(doctor.user.name || doctor.clinicName, {
        lower: true,
        strict: true,
      });

      let slug = baseSlug;
      let counter = 1;

      while (
        await prisma.doctorProfile.findFirst({
          where: {
            slug,
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      await prisma.doctorProfile.update({
        where: {
          id: doctor.id,
        },

        data: {
          slug,
        },
      });

      console.log(`Created slug: ${slug}`);
    }
  }
}

main()
  .then(() => {
    console.log("Done generating slugs");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });