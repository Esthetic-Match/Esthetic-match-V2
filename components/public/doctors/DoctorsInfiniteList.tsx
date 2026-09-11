"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check } from "lucide-react";

import DoctorCardsHorizontal, {
  type DoctorCardData,
} from "../UI/DoctorCardsHorizontal";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type DoctorFilters = {
  q?: string;
  specialty?: string;
  category?: string;
  procedures?: string;
  location?: string;
  minRating?: string;
  topThreeOnly?: string;
  maxInClinicPrice?: string;
  maxOnlineConsultationPrice?: string;
};

type Props = {
  initialDoctors: DoctorCardData[];
  initialHasMore: boolean;
  filters?: DoctorFilters;
  limit: number;

  /*
   * Passed by DoctorsListSection.
   * Required so every additional page uses
   * the correct DB catalogue translations.
   */
  locale: string;
};

type DoctorsApiResponse = {
  doctors?: DoctorCardData[];
  hasMore?: boolean;
};

/* ═════════════════════════════════════
   COMPONENT
═════════════════════════════════════ */

export default function DoctorsInfiniteList({
  initialDoctors,
  initialHasMore,
  filters,
  limit,
  locale,
}: Props) {
  const [
    doctors,
    setDoctors,
  ] = useState<DoctorCardData[]>(
    initialDoctors,
  );

  const [
    page,
    setPage,
  ] = useState(2);

  const [
    hasMore,
    setHasMore,
  ] = useState(
    initialHasMore,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const sentinelRef =
    useRef<HTMLDivElement>(
      null,
    );

  /* ═══════════════════════════════════
     FETCH NEXT PAGE
  ═══════════════════════════════════ */

  const fetchMore =
    useCallback(
      async () => {
        if (
          loading ||
          !hasMore
        ) {
          return;
        }

        setLoading(true);

        const params =
          new URLSearchParams();

        /* ─────────────────────────────
           FILTERS
        ───────────────────────────── */

        if (filters?.q) {
          params.set(
            "q",
            filters.q,
          );
        }

        if (
          filters?.specialty
        ) {
          params.set(
            "specialty",
            filters.specialty,
          );
        }

        if (
          filters?.category
        ) {
          params.set(
            "category",
            filters.category,
          );
        }

        if (
          filters?.procedures
        ) {
          params.set(
            "procedures",
            filters.procedures,
          );
        }

        if (
          filters?.location
        ) {
          params.set(
            "location",
            filters.location,
          );
        }

        if (
          filters?.minRating
        ) {
          params.set(
            "minRating",
            filters.minRating,
          );
        }

        if (
          filters?.topThreeOnly
        ) {
          params.set(
            "topThreeOnly",
            filters.topThreeOnly,
          );
        }

        if (
          filters?.maxInClinicPrice
        ) {
          params.set(
            "maxInClinicPrice",
            filters.maxInClinicPrice,
          );
        }

        if (
          filters?.maxOnlineConsultationPrice
        ) {
          params.set(
            "maxOnlineConsultationPrice",
            filters.maxOnlineConsultationPrice,
          );
        }

        /* ─────────────────────────────
           DATABASE CATALOGUE LOCALE
        ───────────────────────────── */

        params.set(
          "locale",
          locale,
        );

        /* ─────────────────────────────
           PAGINATION
        ───────────────────────────── */

        params.set(
          "page",
          String(page),
        );

        params.set(
          "limit",
          String(limit),
        );

        try {
          const response =
            await fetch(
              `/api/public-pages/doctor-profile?${params.toString()}`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
              },
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch doctors.",
            );
          }

          const data =
            (await response.json()) as
              | DoctorsApiResponse
              | DoctorCardData[];

          /*
           * Compatibility with the old API
           * response shape.
           *
           * New endpoint:
           * {
           *   doctors: [...],
           *   hasMore: true
           * }
           *
           * Old endpoint:
           * [...]
           */

          const newDoctors: DoctorCardData[] =
            Array.isArray(
              data,
            )
              ? data
              : Array.isArray(
                    data.doctors,
                  )
                ? data.doctors
                : [];

          const more =
            Array.isArray(
              data,
            )
              ? data.length ===
                limit
              : data.hasMore ===
                true;

          /*
           * Prevent accidental duplicate cards
           * if the same doctor appears in two
           * subsequent responses.
           */
          setDoctors(
            (previous) => {
              const existingIds =
                new Set(
                  previous.map(
                    (doctor) =>
                      doctor.id,
                  ),
                );

              const uniqueNewDoctors =
                newDoctors.filter(
                  (doctor) =>
                    !existingIds.has(
                      doctor.id,
                    ),
                );

              return [
                ...previous,
                ...uniqueNewDoctors,
              ];
            },
          );

          setHasMore(
            more,
          );

          setPage(
            (previous) =>
              previous + 1,
          );
        } catch (error) {
          console.error(
            "[DOCTORS_INFINITE_LIST_ERROR]",
            error,
          );
        } finally {
          setLoading(false);
        }
      },
      [
        loading,
        hasMore,
        page,
        filters,
        limit,
        locale,
      ],
    );

  /* ═══════════════════════════════════
     INTERSECTION OBSERVER
  ═══════════════════════════════════ */

  useEffect(() => {
    const element =
      sentinelRef.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            entry?.isIntersecting
          ) {
            void fetchMore();
          }
        },
        {
          rootMargin:
            "200px",
        },
      );

    observer.observe(
      element,
    );

    return () => {
      observer.disconnect();
    };
  }, [fetchMore]);

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  return (
    <>
      {/* Doctor cards */}

      <div className="grid gap-5 p-4 sm:grid-cols-1">
        {doctors.map(
          (doctor) => (
            <DoctorCardsHorizontal
              key={
                doctor.id
              }
              doctor={
                doctor
              }
            />
          ),
        )}
      </div>

      {/* Loading */}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d8bd8d] border-t-transparent" />
        </div>
      ) : null}

      {/* End of list */}

      {!hasMore &&
      doctors.length >
        0 ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-yellow">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#283C5D] text-white">
            <Check
              className="h-3.5 w-3.5"
              strokeWidth={
                3
              }
            />
          </span>
        </div>
      ) : null}

      {/* Infinite scroll sentinel */}

      {hasMore ? (
        <div
          ref={
            sentinelRef
          }
          className="h-1"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}