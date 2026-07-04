"use client";

import { useState } from "react";
import { Search, Star, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type GooglePlaceMatch = {
  id: string;
  name: string;
  displayName: {
    text: string;
  };
  formattedAddress?: string | null;
  rating?: number | null;
  userRatingCount?: number | null;
  googleMapsUri?: string | null;
};

type GooglePlaceDetails = {
  id: string | null;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsUri: string | null;
};

type GoogleReviewsButtonProps = {
  clinicName?: string | null;
  workLatitude?: number | null;
  workLongitude?: number | null;
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  onSaved?: (data: {
    googlePlaceId: string | null;
    googleRating: number | null;
    googleReviewCount: number | null;
    googleMapsUri: string | null;
  }) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed;
  } catch {
    return { error: raw };
  }
}

function normalizePlaceMatch(value: unknown): GooglePlaceMatch | null {
  if (!isRecord(value)) return null;

  const rawId = readNullableString(value.id);
  const rawName = readNullableString(value.name);
  const id = rawId ?? rawName;
  const name = rawName ?? rawId;

  if (!id || !name) return null;

  const displayName = isRecord(value.displayName)
    ? readNullableString(value.displayName.text)
    : null;

  if (!displayName) return null;

  return {
    id,
    name,
    displayName: {
      text: displayName,
    },
    formattedAddress: readNullableString(value.formattedAddress),
    rating: readNullableNumber(value.rating),
    userRatingCount: readNullableNumber(value.userRatingCount),
    googleMapsUri: readNullableString(value.googleMapsUri),
  };
}

function getPlacesFromPayload(payload: unknown): GooglePlaceMatch[] {
  if (!isRecord(payload) || !Array.isArray(payload.places)) return [];

  return payload.places.reduce<GooglePlaceMatch[]>((places, place) => {
    const normalizedPlace = normalizePlaceMatch(place);

    if (normalizedPlace) {
      places.push(normalizedPlace);
    }

    return places;
  }, []);
}

function getPlaceDetailsFromPayload(payload: unknown): GooglePlaceDetails | null {
  if (!isRecord(payload) || !isRecord(payload.place)) return null;

  return {
    id: readNullableString(payload.place.id),
    rating: readNullableNumber(payload.place.rating),
    userRatingCount: readNullableNumber(payload.place.userRatingCount),
    googleMapsUri: readNullableString(payload.place.googleMapsUri),
  };
}

function GoogleRatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {[0, 1, 2, 3, 4].map((starIndex: number) => {
        const fillPercentage =
          Math.min(Math.max(rating - starIndex, 0), 1) * 100;

        return (
          <span key={starIndex} className="relative h-6 w-6">
            <Star
              size={24}
              className="absolute left-0 top-0 fill-[#E9E1D4] text-[#E9E1D4] transition-colors duration-700 ease-out group-hover:fill-[#283C5D]/20 group-hover:text-[#283C5D]/20"
            />

            <span
              className="absolute left-0 top-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                size={24}
                className="fill-[#D8BD8D] text-[#D8BD8D] transition-colors duration-700 ease-out group-hover:fill-[#283C5D] group-hover:text-[#283C5D]"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function GoogleReviewsButton({
  clinicName,
  workLatitude,
  workLongitude,
  googlePlaceId,
  googleRating,
  googleReviewCount,
  onSaved,
}: GoogleReviewsButtonProps) {
  const t = useTranslations("dashboard");

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(clinicName ?? "");
  const [matches, setMatches] = useState<GooglePlaceMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    googlePlaceId ?? null
  );
  const [savedRating, setSavedRating] = useState<number | null>(
    googleRating ?? null
  );
  const [savedReviewCount, setSavedReviewCount] = useState<number | null>(
    googleReviewCount ?? null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayedRating = savedRating ?? googleRating;
  const displayedReviewCount = savedReviewCount ?? googleReviewCount;
  const isConnected = selectedPlaceId != null;

  async function handleSearch(nextQuery?: string): Promise<void> {
    const cleanQuery = (nextQuery ?? query).trim();

    if (!cleanQuery) {
      setMatches([]);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/google-places/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicName: cleanQuery,
          workLatitude,
          workLongitude,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        console.error("Google autocomplete failed:", data);
        setMatches([]);
        setErrorMessage("Could not search Google businesses.");
        return;
      }

      setMatches(getPlacesFromPayload(data));
    } catch (error) {
      console.error("Google autocomplete request failed:", error);
      setMatches([]);
      setErrorMessage("Could not connect to Google Places.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSelectPlace(place: GooglePlaceMatch): Promise<void> {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const detailsResponse = await fetch("/api/google-places/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: place.name || place.id,
        }),
      });

      const detailsData = await parseJsonResponse(detailsResponse);

      if (!detailsResponse.ok) {
        console.error("Google details failed:", detailsData);
        throw new Error("Could not fetch Google rating.");
      }

      const details = getPlaceDetailsFromPayload(detailsData);

      if (!details) {
        throw new Error("Google place details response was invalid.");
      }

      const payload = {
        googlePlaceId: details.id ?? place.id,
        googleRating: details.rating,
        googleReviewCount: details.userRatingCount,
        googleMapsUri: details.googleMapsUri,
      };

      const saveResponse = await fetch("/api/doctor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const saveData = await parseJsonResponse(saveResponse);

      if (!saveResponse.ok) {
        console.error("Saving Google rating failed:", saveData);
        throw new Error("Could not save Google rating.");
      }

      setSelectedPlaceId(payload.googlePlaceId);
      setSavedRating(payload.googleRating);
      setSavedReviewCount(payload.googleReviewCount);

      onSaved?.(payload);

      setIsOpen(false);
    } catch (error) {
      console.error("Could not save Google business:", error);
      setErrorMessage("Could not save this Google business rating.");
    } finally {
      setIsSaving(false);
    }
  }

  function openPicker(): void {
    const initialQuery = clinicName ?? "";

    setIsOpen(true);
    setQuery(initialQuery);

    if (initialQuery.trim()) {
      void handleSearch(initialQuery);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="group relative mb-4 flex w-full overflow-hidden rounded-[1.75rem] border border-[#d8bd8d]/70 bg-[#283C5D] p-[1px] shadow-[0_22px_55px_rgba(40,60,93,0.22)] transition-all duration-700 ease-out hover:border-[#F6C467]/90 hover:bg-[#d8bd8d] hover:shadow-[0_28px_70px_rgba(216,189,141,0.36)] active:scale-[0.99]"
      >
        <span className="relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[1.70rem] bg-[linear-gradient(135deg,#283C5D_0%,#334B70_55%,#1F2F49_100%)] px-5 py-5 text-left text-white md:px-6 md:py-6">
          <span className="absolute inset-0 bg-[linear-gradient(135deg,#F7E1AA_0%,#D8BD8D_50%,#B99045_100%)] opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" />
        
          <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#d8bd8d]/20 blur-2xl transition-all duration-700 ease-out group-hover:bg-white/25" />
          <span className="absolute -bottom-14 left-14 h-28 w-28 rounded-full bg-white/10 blur-2xl transition-all duration-700 ease-out group-hover:bg-[#283C5D]/10" />
        
          {displayedRating != null && displayedReviewCount != null ? (
            <span className="relative z-10 flex w-full flex-col items-center justify-center py-3 text-center">
              <span className="mb-8 flex w-full items-center justify-center gap-3 text-center">
                <Star
                  size={18}
                  className="fill-[#D8BD8D] text-[#D8BD8D] transition-colors duration-700 ease-out group-hover:fill-[#283C5D] group-hover:text-[#283C5D]"
                />
      
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-white transition-colors duration-700 ease-out group-hover:text-[#283C5D]">
                  {t("googleReviews.googleBusiness")}
                </span>
              </span>
          
              <GoogleRatingStars rating={displayedRating} />
          
              <span className="mt-5 flex items-end justify-center gap-1">
                <span className="text-4xl font-bold leading-none text-white transition-colors duration-700 ease-out group-hover:text-[#283C5D]">
                  {displayedRating.toFixed(1)}
                </span>
          
                <span className="pb-1 text-base font-semibold text-white/55 transition-colors duration-700 ease-out group-hover:text-[#283C5D]/55">
                  / 5
                </span>
              </span>
          
              <span className="mt-4 text-sm text-white/65 transition-colors duration-700 ease-out group-hover:text-[#283C5D]/65">
                Basé sur {displayedReviewCount} avis Google
              </span>
            </span>
          ) : (
            <>
              <span className="relative z-10 flex min-w-0 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_14px_35px_rgba(0,0,0,0.18)] transition-all duration-700 ease-out group-hover:shadow-[0_14px_35px_rgba(40,60,93,0.18)]">
                  <Image
                    src="/icons/googleIcon.svg"
                    alt="Google"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </span>
          
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.26em] text-[#F6C467] transition-colors duration-700 ease-out group-hover:text-[#283C5D]">
                    {t("googleReviews.googleBusiness")}
                  </span>
          
                  <span className="mt-1 block text-base font-semibold leading-snug text-white transition-colors duration-700 ease-out group-hover:text-black md:text-lg">
                    {t("googleReviews.connect")}
                  </span>
          
                  <span className="mt-1 block text-sm text-white/70 transition-colors duration-700 ease-out group-hover:text-black/60">
                    {t("googleReviews.selectClinic")}
                  </span>
                </span>
              </span>
          
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-inner transition-all duration-700 ease-out group-hover:border-[#283C5D]/15 group-hover:bg-white/70 group-hover:text-[#283C5D]">
                <Search size={20} />
              </span>
            </>
          )}
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
                  {t("googleReviews.googleBusiness")}
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
                  {t("googleReviews.selectClinic")}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center cursor-pointer justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 bg-[#FAF9F7] p-6">
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleSearch();
                    }
                  }}
                  placeholder={t("googleReviews.searchPlaceholder")}
                  className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none focus:border-[#d8bd8d]"
                />

                <button
                  type="button"
                  onClick={() => void handleSearch()}
                  disabled={isSearching}
                  className="rounded-full bg-[#283C5D] cursor-pointer px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSearching
                    ? t("googleReviews.searching")
                    : t("googleReviews.search")}
                </button>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="max-h-[420px] space-y-3 overflow-y-auto">
                {matches.length > 0 ? (
                  matches.map((place: GooglePlaceMatch) => (
                    <button
                      key={place.name || place.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => void handleSelectPlace(place)}
                      className="w-full rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:border-[#d8bd8d] hover:bg-[#fffaf1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[#283C5D]">
                            {place.displayName.text}
                          </h3>

                          {place.formattedAddress ? (
                            <p className="mt-1 text-sm text-[#283C5D]/60">
                              {place.formattedAddress}
                            </p>
                          ) : null}
                        </div>

                        {typeof place.rating === "number" ? (
                          <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#FAF9F7] px-3 py-1 text-xs font-semibold text-[#283C5D]">
                            <Star
                              size={13}
                              className="fill-[#d8bd8d] text-[#d8bd8d]"
                            />
                            {place.rating}
                            <span className="font-normal text-[#283C5D]/50">
                              ({place.userRatingCount ?? 0})
                            </span>
                          </div>
                        ) : (
                          <span className="shrink-0 rounded-full bg-[#FAF9F7] px-3 py-1 text-xs text-[#283C5D]/50">
                            {t("googleReviews.selectToFetchRating")}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/10 bg-white p-5 text-sm text-[#283C5D]/60">
                    {t("googleReviews.emptySearchHint")}
                  </div>
                )}
              </div>

              {isSaving ? (
                <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 size={16} />
                  {t("googleReviews.saving")}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}