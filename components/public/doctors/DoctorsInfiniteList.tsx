"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DoctorCards from "../UI/DoctorCards";
import type { CardTranslations, SpecialtyTranslations, DoctorCardData } from "../UI/DoctorCards";
import { Check } from "lucide-react";

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
  t: CardTranslations;
  specialtyT: SpecialtyTranslations;
};

export default function DoctorsInfiniteList({
  initialDoctors,
  initialHasMore,
  filters,
  limit,
  t,
  specialtyT,
}: Props) {
  const [doctors, setDoctors] = useState<DoctorCardData[]>(initialDoctors);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const params = new URLSearchParams();
    if (filters?.q)                          params.set("q", filters.q);
    if (filters?.specialty)                  params.set("specialty", filters.specialty);
    if (filters?.category)                   params.set("category", filters.category);
    if (filters?.procedures)                 params.set("procedures", filters.procedures);
    if (filters?.location)                   params.set("location", filters.location);
    if (filters?.minRating)                  params.set("minRating", filters.minRating);
    if (filters?.topThreeOnly)               params.set("topThreeOnly", filters.topThreeOnly);
    if (filters?.maxInClinicPrice)           params.set("maxInClinicPrice", filters.maxInClinicPrice);
    if (filters?.maxOnlineConsultationPrice) params.set("maxOnlineConsultationPrice", filters.maxOnlineConsultationPrice);
    params.set("page", String(page));
    params.set("limit", String(limit));

    try {
      const res = await fetch(`/api/public-pages/doctor-profile?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const newDoctors: DoctorCardData[] = Array.isArray(data)
        ? data
        : (data.doctors ?? []);
      const more: boolean = Array.isArray(data)
        ? data.length === limit
        : Boolean(data.hasMore);

      setDoctors((prev) => [...prev, ...newDoctors]);
      setHasMore(more);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, filters, limit]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchMore]);

  return (
    <>
      <div className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <DoctorCards
            key={doctor.id}
            doctor={doctor}
            t={t}
            specialtyT={specialtyT}
          />
        ))}
      </div>

      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d8bd8d] border-t-transparent" />
        </div>
      )}

      {!hasMore && doctors.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-yellow">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#283C5D] text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </div>
      )}

      {/* Sentinel — triggers infinite load when scrolled into view */}
      <div ref={sentinelRef} className="h-1" />
    </>
  );
}
