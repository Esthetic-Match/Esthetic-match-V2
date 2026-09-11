import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";

export const dynamic =
  "force-dynamic";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type QueryMode =
  "insensitive";

type StringFilter = {
  equals?: string;
  not?: string | null;
  mode?: QueryMode;
};

type NumberNullableFilter = {
  gte?: number;
  lte?: number;
};

type UserWhereInput = {
  role?: "DOCTOR";
  onboardingCompleted?: boolean;
};

type UserRelationFilter = {
  is?: UserWhereInput;
};

type DoctorProfileWhereInput = {
  slug?: StringFilter;
  city?: StringFilter;
  country?: StringFilter;
  workLatitude?: NumberNullableFilter;
  workLongitude?: NumberNullableFilter;
  user?: UserRelationFilter;
};

type GeocodeAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GeocodeResult = {
  address_components?: GeocodeAddressComponent[];
};

type GeocodeResponse = {
  status: string;
  results?: GeocodeResult[];
};

type DoctorsNearMeRequestBody = {
  latitude: number;
  longitude: number;
  locale?: string;
};

type TranslationRow = {
  localeCode: string;
  name: string;
};

type CatalogueItem = {
  id: string;
  name: string;
};

type DoctorNearMeResult = {
  id: string;

  slug: string | null;

  avatar: string | null;
  clinicName: string;

  city: string | null;
  country: string | null;

  /*
   * Legacy arrays kept only as migration
   * fallbacks / backwards compatibility.
   */
  specialtyIds: string[];
  procedureIds: string[];
  topThree: string[];

  yearsOfExperience: number | null;

  googleRating: number | null;
  googleReviewCount: number | null;

  inClinicPrice: number | null;
  onlineConsulPrice: number | null;

  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;

  currency: string;

  workLatitude: number | null;
  workLongitude: number | null;

  clinicBanner: string | null;

  user: {
    name: string | null;
    image: string | null;
  };

  specialties: {
    specialtyId: string;
    position: number;

    specialty: {
      id: string;
      isActive: boolean;

      translations: TranslationRow[];
    };
  }[];

  procedures: {
    procedureId: string;
    position: number;
    topRank: number | null;

    procedure: {
      id: string;
      isActive: boolean;

      translations: TranslationRow[];
    };
  }[];
};

type DoctorCardDto = {
  id: string;
  slug: string;
  name: string;

  avatar: string | null;
  clinicName: string;

  city: string | null;
  country: string | null;

  /*
   * New database-backed display values.
   */
  specialties: CatalogueItem[];
  topThreeProcedures: CatalogueItem[];

  /*
   * Keep these temporarily so any other
   * existing consumer of this endpoint
   * does not break.
   */
  specialtyIds: string[];
  procedureIds: string[];
  topThree: string[];

  yearsOfExperience: number | null;

  googleRating: number | null;
  googleReviewCount: number | null;

  inClinicPrice: number | null;
  onlineConsulPrice: number | null;

  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;

  currency: string;

  distanceKm: number | null;

  clinicBanner: string | null;

  workLatitude: number | null;
  workLongitude: number | null;
};

/* ═════════════════════════════════════
   PRISMA SELECT
═════════════════════════════════════ */

function createDoctorNearMeSelect(
  localeCandidates: string[],
) {
  return {
    id: true,

    slug: true,

    avatar: true,

    clinicName: true,

    city: true,
    country: true,

    /*
     * Transitional legacy arrays.
     */
    specialtyIds: true,
    procedureIds: true,
    topThree: true,

    yearsOfExperience: true,

    googleRating: true,
    googleReviewCount: true,

    inClinicPrice: true,
    onlineConsulPrice: true,

    stripeConnectOnboardingComplete:
      true,

    onlineActive: true,

    currency: true,

    workLatitude: true,
    workLongitude: true,

    clinicBanner: true,

    user: {
      select: {
        name: true,
        image: true,
      },
    },

    /* ───────────────────────────────
       NORMALIZED SPECIALTIES
    ─────────────────────────────── */

    specialties: {
      orderBy: {
        position: "asc" as const,
      },

      select: {
        specialtyId: true,
        position: true,

        specialty: {
          select: {
            id: true,
            isActive: true,

            translations: {
              where: {
                localeCode: {
                  in:
                    localeCandidates,
                },
              },

              select: {
                localeCode: true,
                name: true,
              },
            },
          },
        },
      },
    },

    /* ───────────────────────────────
       NORMALIZED PROCEDURES
    ─────────────────────────────── */

    procedures: {
      orderBy: {
        position: "asc" as const,
      },

      select: {
        procedureId: true,
        position: true,
        topRank: true,

        procedure: {
          select: {
            id: true,
            isActive: true,

            translations: {
              where: {
                localeCode: {
                  in:
                    localeCandidates,
                },
              },

              select: {
                localeCode: true,
                name: true,
              },
            },
          },
        },
      },
    },
  };
}

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null
  );
}

function parseDoctorsNearMeBody(
  body: unknown,
): DoctorsNearMeRequestBody | null {
  if (!isRecord(body)) {
    return null;
  }

  const {
    latitude,
    longitude,
    locale,
  } = body;

  if (
    typeof latitude !==
    "number"
  ) {
    return null;
  }

  if (
    typeof longitude !==
    "number"
  ) {
    return null;
  }

  return {
    latitude,
    longitude,

    locale:
      typeof locale ===
      "string"
        ? locale
        : undefined,
  };
}

function normalizeLocale(
  value: string | undefined,
) {
  const normalized = (
    value ?? "en"
  )
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

  if (
    /^[a-z]{2}(?:-[a-z0-9]{2,8})*$/.test(
      normalized,
    )
  ) {
    return normalized;
  }

  return "en";
}

function getLocaleCandidates(
  locale: string,
) {
  return Array.from(
    new Set([
      locale,
      locale.split("-")[0],
      "en",
    ]),
  );
}

function getTranslatedName(
  translations: TranslationRow[],
  localeCandidates: string[],
  fallback: string,
) {
  for (
    const localeCode of localeCandidates
  ) {
    const match =
      translations.find(
        (translation) =>
          translation.localeCode.toLowerCase() ===
          localeCode.toLowerCase(),
      );

    if (
      match?.name?.trim()
    ) {
      return match.name.trim();
    }
  }

  const anyTranslation =
    translations.find(
      (translation) =>
        translation.name?.trim(),
    );

  return (
    anyTranslation?.name?.trim() ??
    fallback
  );
}

function isValidCoordinate(
  latitude: number,
  longitude: number,
) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function toRadians(
  value: number,
) {
  return (
    (value * Math.PI) /
    180
  );
}

function calculateDistanceKm({
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
}: {
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
}) {
  const earthRadiusKm =
    6371;

  const dLat =
    toRadians(
      toLatitude -
        fromLatitude,
    );

  const dLon =
    toRadians(
      toLongitude -
        fromLongitude,
    );

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      toRadians(
        fromLatitude,
      ),
    ) *
      Math.cos(
        toRadians(
          toLatitude,
        ),
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return (
    earthRadiusKm *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    )
  );
}

function boundingBox(
  latitude: number,
  longitude: number,
  radiusKm: number,
) {
  const latDelta =
    radiusKm / 111.32;

  const latitudeCosine =
    Math.cos(
      toRadians(latitude),
    );

  /*
   * Avoid division by zero close
   * to the poles.
   */
  const safeCosine =
    Math.max(
      Math.abs(
        latitudeCosine,
      ),
      0.000001,
    );

  const lngDelta =
    radiusKm /
    (111.32 *
      safeCosine);

  return {
    minLat:
      latitude -
      latDelta,

    maxLat:
      latitude +
      latDelta,

    minLng:
      longitude -
      lngDelta,

    maxLng:
      longitude +
      lngDelta,
  };
}

function findAddressComponent(
  components: GeocodeAddressComponent[],
  acceptedTypes: string[],
) {
  return components.find(
    (
      component:
        GeocodeAddressComponent,
    ) =>
      acceptedTypes.every(
        (type: string) =>
          component.types.includes(
            type,
          ),
      ),
  )?.long_name;
}

/* ═════════════════════════════════════
   GOOGLE REVERSE GEOCODING
═════════════════════════════════════ */

async function reverseGeocodeCity({
  latitude,
  longitude,
  locale,
}: {
  latitude: number;
  longitude: number;
  locale: string;
}): Promise<{
  city: string | null;
  country: string | null;
}> {
  const apiKey =
    process.env
      .GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      city: null,
      country: null,
    };
  }

  try {
    const language =
      locale.startsWith(
        "fr",
      )
        ? "fr"
        : "en";

    const params =
      new URLSearchParams({
        latlng:
          `${latitude},${longitude}`,

        key:
          apiKey,

        language,
      });

    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(
        () =>
          controller.abort(),
        5_000,
      );

    const response =
      await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
        {
          cache:
            "no-store",

          signal:
            controller.signal,
        },
      ).finally(() =>
        clearTimeout(
          timeoutId,
        ),
      );

    if (!response.ok) {
      return {
        city: null,
        country: null,
      };
    }

    const data =
      (await response.json()) as
        GeocodeResponse;

    if (
      data.status !== "OK" ||
      !data.results?.length
    ) {
      return {
        city: null,
        country: null,
      };
    }

    const components =
      data.results.flatMap(
        (
          result:
            GeocodeResult,
        ) =>
          result.address_components ??
          [],
      );

    const city =
      findAddressComponent(
        components,
        [
          "locality",
          "political",
        ],
      ) ??
      findAddressComponent(
        components,
        [
          "postal_town",
        ],
      ) ??
      findAddressComponent(
        components,
        [
          "administrative_area_level_2",
          "political",
        ],
      ) ??
      findAddressComponent(
        components,
        [
          "sublocality",
          "political",
        ],
      ) ??
      null;

    const country =
      findAddressComponent(
        components,
        [
          "country",
          "political",
        ],
      ) ?? null;

    return {
      city,
      country,
    };
  } catch {
    return {
      city: null,
      country: null,
    };
  }
}

/* ═════════════════════════════════════
   FORMAT DOCTOR
═════════════════════════════════════ */

function formatDoctor({
  doctor,
  userLatitude,
  userLongitude,
  localeCandidates,
  legacySpecialtyMap,
  legacyProcedureMap,
}: {
  doctor: DoctorNearMeResult;

  userLatitude: number;
  userLongitude: number;

  localeCandidates: string[];

  legacySpecialtyMap: Map<
    string,
    CatalogueItem
  >;

  legacyProcedureMap: Map<
    string,
    CatalogueItem
  >;
}): DoctorCardDto {
  const distanceKm =
    doctor.workLatitude !==
      null &&
    doctor.workLongitude !==
      null
      ? calculateDistanceKm({
          fromLatitude:
            userLatitude,

          fromLongitude:
            userLongitude,

          toLatitude:
            doctor.workLatitude,

          toLongitude:
            doctor.workLongitude,
        })
      : null;

  /* ═══════════════════════════════════
     SPECIALTIES
  ═══════════════════════════════════ */

  const normalizedSpecialties =
    doctor.specialties
      .filter(
        (selection) =>
          selection.specialty
            .isActive,
      )
      .map(
        (selection) => ({
          id:
            selection.specialty
              .id,

          name:
            getTranslatedName(
              selection.specialty
                .translations,

              localeCandidates,

              selection.specialty
                .id,
            ),
        }),
      );

  const specialties =
    normalizedSpecialties.length >
    0
      ? normalizedSpecialties
      : doctor.specialtyIds
          .map((id) =>
            legacySpecialtyMap.get(
              id,
            ),
          )
          .filter(
            (
              item,
            ): item is CatalogueItem =>
              Boolean(item),
          );

  /* ═══════════════════════════════════
     TOP THREE PROCEDURES
  ═══════════════════════════════════ */

  const normalizedTopThree =
    doctor.procedures
      .filter(
        (
          selection,
        ): selection is typeof selection & {
          topRank: number;
        } =>
          selection.topRank !==
            null &&
          selection.procedure
            .isActive,
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.topRank -
          second.topRank,
      )
      .slice(0, 3)
      .map(
        (selection) => ({
          id:
            selection.procedure
              .id,

          name:
            getTranslatedName(
              selection.procedure
                .translations,

              localeCandidates,

              selection.procedure
                .id,
            ),
        }),
      );

  const topThreeProcedures =
    normalizedTopThree.length >
    0
      ? normalizedTopThree
      : doctor.topThree
          .slice(0, 3)
          .map((id) =>
            legacyProcedureMap.get(
              id,
            ),
          )
          .filter(
            (
              item,
            ): item is CatalogueItem =>
              Boolean(item),
          );

  return {
    id:
      doctor.id,

    slug:
      doctor.slug ?? "",

    name:
      doctor.user.name ??
      "Doctor",

    avatar:
      doctor.avatar ??
      doctor.user.image,

    clinicName:
      doctor.clinicName,

    city:
      doctor.city,

    country:
      doctor.country,

    /* NEW DATABASE-BACKED VALUES */

    specialties,

    topThreeProcedures,

    /*
     * Compatibility fields.
     *
     * These now mirror the normalized
     * relations whenever available.
     */
    specialtyIds:
      specialties.length > 0
        ? specialties.map(
            (specialty) =>
              specialty.id,
          )
        : doctor.specialtyIds,

    procedureIds:
      doctor.procedures.length >
      0
        ? doctor.procedures
            .filter(
              (selection) =>
                selection.procedure
                  .isActive,
            )
            .map(
              (selection) =>
                selection.procedureId,
            )
        : doctor.procedureIds,

    topThree:
      topThreeProcedures.length >
      0
        ? topThreeProcedures.map(
            (procedure) =>
              procedure.id,
          )
        : doctor.topThree,

    yearsOfExperience:
      doctor.yearsOfExperience,

    googleRating:
      doctor.googleRating,

    googleReviewCount:
      doctor.googleReviewCount,

    inClinicPrice:
      doctor.inClinicPrice,

    onlineConsulPrice:
      doctor.onlineConsulPrice,

    stripeConnectOnboardingComplete:
      doctor.stripeConnectOnboardingComplete,

    onlineActive:
      doctor.onlineActive,

    currency:
      doctor.currency,

    distanceKm:
      distanceKm !== null
        ? Number(
            distanceKm.toFixed(
              1,
            ),
          )
        : null,

    clinicBanner:
      doctor.clinicBanner,

    workLatitude:
      doctor.workLatitude,

    workLongitude:
      doctor.workLongitude,
  };
}

/* ═════════════════════════════════════
   POST
═════════════════════════════════════ */

export async function POST(
  req: Request,
) {
  try {
    /* ───────────────────────────────
       BODY
    ─────────────────────────────── */

    const rawBody =
      (await req
        .json()
        .catch(
          () => null,
        )) as unknown;

    const body =
      parseDoctorsNearMeBody(
        rawBody,
      );

    if (!body) {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      latitude,
      longitude,
    } = body;

    const locale =
      normalizeLocale(
        body.locale,
      );

    const localeCandidates =
      getLocaleCandidates(
        locale,
      );

    if (
      !isValidCoordinate(
        latitude,
        longitude,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid browser location.",
        },
        {
          status: 400,
        },
      );
    }

    /* ═════════════════════════════════
       LOCATION
    ═════════════════════════════════ */

    const {
      city,
      country,
    } =
      await reverseGeocodeCity({
        latitude,
        longitude,
        locale,
      });

    /* ═════════════════════════════════
       BASE DOCTOR FILTER
    ═════════════════════════════════ */

    const baseWhere: DoctorProfileWhereInput =
      {
        slug: {
          not: null,
        },

        user: {
          is: {
            role:
              "DOCTOR",

            onboardingCompleted:
              true,
          },
        },
      };

    const doctorNearMeSelect =
      createDoctorNearMeSelect(
        localeCandidates,
      );

    let doctors: DoctorNearMeResult[] =
      [];

    let matchMode:
      | "city"
      | "radius" =
      "city";

    const radiusKm =
      50;

    /* ═════════════════════════════════
       FIRST TRY: SAME CITY
    ═════════════════════════════════ */

    if (city) {
      doctors =
        (await prisma.doctorProfile.findMany({
          where: {
            ...baseWhere,

            city: {
              equals:
                city,

              mode:
                "insensitive",
            },

            ...(country
              ? {
                  country: {
                    equals:
                      country,

                    mode:
                      "insensitive",
                  },
                }
              : {}),
          },

          select:
            doctorNearMeSelect,

          take:
            60,
        })) as DoctorNearMeResult[];
    }

    /* ═════════════════════════════════
       FALLBACK: 50KM RADIUS
    ═════════════════════════════════ */

    if (
      doctors.length === 0
    ) {
      matchMode =
        "radius";

      const {
        minLat,
        maxLat,
        minLng,
        maxLng,
      } = boundingBox(
        latitude,
        longitude,
        radiusKm,
      );

      const candidates =
        (await prisma.doctorProfile.findMany({
          where: {
            ...baseWhere,

            workLatitude: {
              gte:
                minLat,

              lte:
                maxLat,
            },

            workLongitude: {
              gte:
                minLng,

              lte:
                maxLng,
            },
          },

          select:
            doctorNearMeSelect,

          take:
            120,
        })) as DoctorNearMeResult[];

      doctors =
        candidates
          .filter(
            (doctor) => {
              if (
                doctor.workLatitude ===
                  null ||
                doctor.workLongitude ===
                  null
              ) {
                return false;
              }

              return (
                calculateDistanceKm({
                  fromLatitude:
                    latitude,

                  fromLongitude:
                    longitude,

                  toLatitude:
                    doctor.workLatitude,

                  toLongitude:
                    doctor.workLongitude,
                }) <=
                radiusKm
              );
            },
          )
          .slice(
            0,
            60,
          );
    }

    /* ═════════════════════════════════
       LEGACY FALLBACK IDS

       Once every doctor has relational
       catalogue rows, this entire fallback
       block can eventually be removed.
    ═════════════════════════════════ */

    const legacySpecialtyIds =
      Array.from(
        new Set(
          doctors.flatMap(
            (doctor) =>
              doctor.specialties
                .length === 0
                ? doctor.specialtyIds
                : [],
          ),
        ),
      );

    const legacyProcedureIds =
      Array.from(
        new Set(
          doctors.flatMap(
            (doctor) => {
              const hasNormalizedTopThree =
                doctor.procedures.some(
                  (procedure) =>
                    procedure.topRank !==
                    null,
                );

              return hasNormalizedTopThree
                ? []
                : doctor.topThree;
            },
          ),
        ),
      );

    /* ═════════════════════════════════
       TRANSLATE LEGACY FALLBACKS
    ═════════════════════════════════ */

    const [
      legacySpecialties,
      legacyProcedures,
    ] =
      await Promise.all([
        legacySpecialtyIds.length >
        0
          ? prisma.specialty.findMany({
              where: {
                id: {
                  in:
                    legacySpecialtyIds,
                },

                isActive:
                  true,
              },

              select: {
                id: true,

                translations: {
                  where: {
                    localeCode: {
                      in:
                        localeCandidates,
                    },
                  },

                  select: {
                    localeCode:
                      true,

                    name:
                      true,
                  },
                },
              },
            })
          : Promise.resolve(
              [],
            ),

        legacyProcedureIds.length >
        0
          ? prisma.procedure.findMany({
              where: {
                id: {
                  in:
                    legacyProcedureIds,
                },

                isActive:
                  true,
              },

              select: {
                id: true,

                translations: {
                  where: {
                    localeCode: {
                      in:
                        localeCandidates,
                    },
                  },

                  select: {
                    localeCode:
                      true,

                    name:
                      true,
                  },
                },
              },
            })
          : Promise.resolve(
              [],
            ),
      ]);

    const legacySpecialtyMap =
      new Map<
        string,
        CatalogueItem
      >(
        legacySpecialties.map(
          (specialty) => [
            specialty.id,

            {
              id:
                specialty.id,

              name:
                getTranslatedName(
                  specialty.translations,

                  localeCandidates,

                  specialty.id,
                ),
            },
          ],
        ),
      );

    const legacyProcedureMap =
      new Map<
        string,
        CatalogueItem
      >(
        legacyProcedures.map(
          (procedure) => [
            procedure.id,

            {
              id:
                procedure.id,

              name:
                getTranslatedName(
                  procedure.translations,

                  localeCandidates,

                  procedure.id,
                ),
            },
          ],
        ),
      );

    /* ═════════════════════════════════
       FORMAT + SORT
    ═════════════════════════════════ */

    const formattedDoctors =
      doctors
        .map(
          (doctor) =>
            formatDoctor({
              doctor,

              userLatitude:
                latitude,

              userLongitude:
                longitude,

              localeCandidates,

              legacySpecialtyMap,

              legacyProcedureMap,
            }),
        )
        .sort(
          (
            firstDoctor,
            secondDoctor,
          ) => {
            const firstDistance =
              firstDoctor.distanceKm ??
              Number.MAX_SAFE_INTEGER;

            const secondDistance =
              secondDoctor.distanceKm ??
              Number.MAX_SAFE_INTEGER;

            if (
              firstDistance !==
              secondDistance
            ) {
              return (
                firstDistance -
                secondDistance
              );
            }

            return (
              (secondDoctor.googleRating ??
                0) -
              (firstDoctor.googleRating ??
                0)
            );
          },
        );

    /* ═════════════════════════════════
       RESPONSE
    ═════════════════════════════════ */

    return NextResponse.json({
      city,
      country,

      matchMode,
      radiusKm,

      locale,

      doctors:
        formattedDoctors,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "[DOCTORS_NEAR_ME_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Could not load doctors near you.",
      },
      {
        status: 500,
      },
    );
  }
}