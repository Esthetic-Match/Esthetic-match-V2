"use client";

import { useState } from "react";
import { Search, Star, X, CheckCircle2 } from "lucide-react";

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

type GoogleReviewsPickerProps = {
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

async function parseJsonResponse(res: Response) {
  const raw = await res.text();

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return { error: raw };
  }
}

export default function GoogleReviewsPicker({
  clinicName,
  workLatitude,
  workLongitude,
  googlePlaceId,
  googleRating,
  googleReviewCount,
  onSaved,
}: GoogleReviewsPickerProps) {
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

  async function handleSearch(nextQuery = query) {
    const cleanQuery = nextQuery.trim();

    if (!cleanQuery) {
      setMatches([]);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/google-places/search", {
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

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        console.error("Google autocomplete failed:", data);
        setMatches([]);
        setErrorMessage("Could not search Google businesses.");
        return;
      }

      setMatches(data.places ?? []);
    } catch (error) {
      console.error("Google autocomplete request failed:", error);
      setMatches([]);
      setErrorMessage("Could not connect to Google Places.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSelectPlace(place: GooglePlaceMatch) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const detailsRes = await fetch("/api/google-places/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: place.name ?? place.id,
        }),
      });

      const detailsData = await parseJsonResponse(detailsRes);

      if (!detailsRes.ok) {
        console.error("Google details failed:", detailsData);
        throw new Error("Could not fetch Google rating.");
      }

      const details = detailsData.place;

      const payload = {
        googlePlaceId: details.id ?? place.id,
        googleRating:
          typeof details.rating === "number" ? details.rating : null,
        googleReviewCount:
          typeof details.userRatingCount === "number"
            ? details.userRatingCount
            : null,
        googleMapsUri: details.googleMapsUri ?? null,
      };

      const saveRes = await fetch("/api/doctor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const saveData = await parseJsonResponse(saveRes);

      if (!saveRes.ok) {
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

  function openPicker() {
    setIsOpen(true);
    setQuery(clinicName ?? "");

    if (clinicName) {
      handleSearch(clinicName);
    }
  }
  const displayedRating = savedRating ?? googleRating;
  const displayedReviewCount =
    savedReviewCount ?? googleReviewCount;
  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="flex w-full mb-3 items-center justify-between rounded-full border border-[#F6C467] 
        bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6] px-4 py-2 text-sm text-[#283C5D] transition hover:opacity-90 active:scale-[0.98]"
      >
        <span>
          {displayedRating != null &&
          displayedReviewCount != null
            ? `Google Rating: ${displayedRating} ★ (${displayedReviewCount} reviews)`
            : "Connect Google Rating"}
        </span>
        {selectedPlaceId? "":<Search size={16} />}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8bd8d]">
                  Google Business
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#283C5D]">
                  Select your clinic listing
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
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
                      handleSearch();
                    }
                  }}
                  placeholder="Search exact Google business name"
                  className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[#283C5D] outline-none focus:border-[#d8bd8d]"
                />

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="rounded-full bg-[#283C5D] px-5 py-3 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="max-h-[420px] space-y-3 overflow-y-auto">
                {matches.length > 0 ? (
                  matches.map((place) => (
                    <button
                      key={place.name ?? place.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSelectPlace(place)}
                      className="w-full rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:border-[#d8bd8d] hover:bg-[#fffaf1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[#283C5D]">
                            {place.displayName?.text ?? "Unnamed business"}
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
                            Select to fetch rating
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/10 bg-white p-5 text-sm text-[#283C5D]/60">
                    Search for the exact Google Maps business name, not the
                    address.
                  </div>
                )}
              </div>

              {isSaving ? (
                <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 size={16} />
                  Saving Google rating...
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}