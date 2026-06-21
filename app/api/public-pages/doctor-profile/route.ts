import { prisma } from "@/lib/database/prisma";
import type { Prisma } from "@prisma/client";
import { apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "_");
}

function parseList(value: string | null) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  // ── Search / text ──────────────────────────────────────────────────────
  const q = searchParams.get("q")?.trim();
  const specialties = parseList(searchParams.get("specialty"));

  // ── Taxonomy filters ───────────────────────────────────────────────────
  const categories = parseList(searchParams.get("category"));
  const procedures = parseList(searchParams.get("procedures"));

  // ── Quick filters ──────────────────────────────────────────────────────
  const location = searchParams.get("location")?.trim();
  const minRating = parseNumber(searchParams.get("minRating"));

  // ── New filters ────────────────────────────────────────────────────────
  // "topThreeOnly" — show doctors where at least one selected procedure
  // appears in their topThree[] field.
  const topThreeOnly = searchParams.get("topThreeOnly") === "true";

  // Price ceilings — only applied when the param is present.
  const maxInClinicPrice = parseNumber(searchParams.get("maxInClinicPrice"));
  const maxOnlineConsultationPrice = parseNumber(
    searchParams.get("maxOnlineConsultationPrice")
  );

  // ── Pagination ─────────────────────────────────────────────────────────
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || "10"), 1),
    50
  );
  const skip = (page - 1) * limit;

  // ── Normalized variants for search ────────────────────────────────────
  const normalizedQ = q ? normalize(q) : undefined;
  const normalizedSpecialties =
  specialties && specialties.length > 0
    ? specialties.flatMap((item) => [item, normalize(item)])
    : [];

  // ── Build the WHERE clause ─────────────────────────────────────────────
  //
  // Strategy:
  //   • "Search-or" conditions (q, specialty, category, procedures) are
  //     combined with OR — a doctor matches if ANY of them hit.
  //   • Hard filters (location, rating, price, topThreeOnly) are ANDed on
  //     top so they always narrow results regardless of search.
  //
  // NOTE on topThreeOnly:
  //   When active AND procedures are selected, we intersect the selected
  //   procedure ids with the doctor's topThree[] field.
  //   We still keep the regular `procedures` OR clause so that doctors who
  //   have those procedures (but not in top-3) are in the search-or pool —
  //   the topThreeOnly AND filter then narrows to top-3 only.
  //   If topThreeOnly is on but NO procedures are selected we skip the
  //   filter (nothing to intersect against).

const searchOrFiltersRaw: (Prisma.DoctorProfileWhereInput | null)[] = [
  q
    ? {
        OR: [
          { user: { name: { contains: q, mode: "insensitive" } } },
          { clinicName: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { country: { contains: q, mode: "insensitive" } },
          {
            specialtyIds: {
              hasSome: [q, normalizedQ].filter(
                (v): v is string => Boolean(v)
              ),
            },
          },
          {
            subcategoryIds: {
              hasSome: [q, normalizedQ].filter(
                (v): v is string => Boolean(v)
              ),
            },
          },
          {
            procedureIds: {
              hasSome: [q, normalizedQ].filter(
                (v): v is string => Boolean(v)
              ),
            },
          },
        ],
      }
    : null,

  specialties && specialties.length > 0
    ? {
        specialtyIds: {
          hasSome: normalizedSpecialties,
        },
      }
    : null,

  categories && categories.length > 0
    ? { subcategoryIds: { hasSome: categories } }
    : null,

  procedures && procedures.length > 0
    ? topThreeOnly
      ? { topThree: { hasSome: procedures } }
      : { procedureIds: { hasSome: procedures } }
    : null,
];

  const searchOrFilters = searchOrFiltersRaw.filter(
    (f): f is Prisma.DoctorProfileWhereInput => f !== null
  );

  
  const publicProfileFilter: Prisma.DoctorProfileWhereInput = {
  slug: {
    not: null,
  },
  user: {
    is: {
      role: "DOCTOR",
      onboardingCompleted: true,
    },
  },
};

  const andFilters: Prisma.DoctorProfileWhereInput[] = [
  publicProfileFilter,

  ...(searchOrFilters.length > 0 ? [{ OR: searchOrFilters }] : []),

    // Location — city OR country, case-insensitive
    ...(location
      ? [
          {
            OR: [
              { city: { contains: location, mode: "insensitive" as const } },
              { country: { contains: location, mode: "insensitive" as const } },
            ],
          },
        ]
      : []),

    // Minimum Google rating
    ...(minRating !== null
      ? [{ googleRating: { gte: minRating, not: null } }]
      : []),

    // Top-3 filter: already baked into the search-or block above when
    // topThreeOnly is true — no separate AND needed here.

    // Max in-clinic price.
    // { not: null, lte: X } is NOT valid Prisma syntax on Float? fields —
    // the two conditions must be expressed as separate AND clauses.
    // We use gt: -1 to guarantee the field is non-null (prices are always ≥ 0).
    ...(maxInClinicPrice !== null
      ? [
          {
            AND: [
              { inClinicPrice: { gt: -1 } },
              { inClinicPrice: { lte: maxInClinicPrice } },
            ],
          },
        ]
      : []),

    // Max online consultation price (same logic)
    ...(maxOnlineConsultationPrice !== null
      ? [
          {
            AND: [
              { onlineConsulPrice: { gt: -1 } },
              { onlineConsulPrice: { lte: maxOnlineConsultationPrice } },
            ],
          },
        ]
      : []),
  ];


  const where: Prisma.DoctorProfileWhereInput =
    andFilters.length > 0 ? { AND: andFilters } : {};

  // ── Query ──────────────────────────────────────────────────────────────

  const doctors = await prisma.doctorProfile.findMany({
    skip,
    take: limit + 1, // fetch one extra to determine hasMore
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      avatar: true,
      specialtyIds: true,
      city: true,
      country: true,
      yearsOfExperience: true,
      inClinicPrice: true,
      onlineConsulPrice: true,
      currency: true,
      googleRating: true,
      googleReviewCount: true,
      stripeConnectOnboardingComplete: true,
      onlineActive: true,
      clinicBanner: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  const hasMore = doctors.length > limit;

  const formattedDoctors = doctors.slice(0, limit).map((doctor) => ({
    id: doctor.id,
    slug: doctor.slug,
    name: doctor.user.name ?? "Doctor",
    specialtyIds: doctor.specialtyIds,
    city: doctor.city,
    country: doctor.country,
    googleRating: doctor.googleRating,
    googleReviewCount: doctor.googleReviewCount,
    yearsOfExperience: doctor.yearsOfExperience,
    inClinicPrice: doctor.inClinicPrice,
    onlineConsulPrice: doctor.onlineConsulPrice,
    currency: doctor.currency,
    stripeConnectOnboardingComplete: doctor.stripeConnectOnboardingComplete,
    onlineActive: doctor.onlineActive,
    avatar: doctor.avatar ?? doctor.user.image ?? "/images/default-doctor.png",
    clinicBanner: doctor.clinicBanner,
  }));

  return apiSuccess({ doctors: formattedDoctors, page, limit, hasMore });
});
