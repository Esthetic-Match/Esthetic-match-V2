"use client";

import { useEffect, useState } from "react";
import {
  RadioTower,
  Link2,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

type InstagramReelRecord = {
  id: string;
  url: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ReelDraft = {
  url: string;
  sortOrder: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseReels(payload: unknown): InstagramReelRecord[] {
  if (!isRecord(payload)) {
    return [];
  }

  const possibleReels = Array.isArray(payload.reels)
    ? payload.reels
    : isRecord(payload.data) && Array.isArray(payload.data.reels)
      ? payload.data.reels
      : [];

  return possibleReels.reduce<InstagramReelRecord[]>(
    (records, item: unknown) => {
      if (!isRecord(item)) {
        return records;
      }

      if (
        typeof item.id !== "string" ||
        typeof item.url !== "string" ||
        typeof item.sortOrder !== "number"
      ) {
        return records;
      }

      records.push({
        id: item.id,
        url: item.url,
        sortOrder: item.sortOrder,
        createdAt:
          typeof item.createdAt === "string"
            ? item.createdAt
            : "",
        updatedAt:
          typeof item.updatedAt === "string"
            ? item.updatedAt
            : "",
      });

      return records;
    },
    []
  );
}

async function parseJsonResponse(
  response: Response
): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed;
  } catch {
    return {
      error: raw,
    };
  }
}

export default function InstagramReelsAdmin() {
  const [reels, setReels] = useState<InstagramReelRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ReelDraft>>(
    {}
  );

  const [newUrl, setNewUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  async function loadReels(): Promise<void> {
    try {
      const response = await fetch("/api/instagram-reels", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error("Could not load Instagram Reels.");
      }

      const nextReels = parseReels(payload);

      const nextDrafts = nextReels.reduce<Record<string, ReelDraft>>(
        (
          result: Record<string, ReelDraft>,
          reel: InstagramReelRecord
        ) => {
          result[reel.id] = {
            url: reel.url,
            sortOrder: reel.sortOrder,
          };

          return result;
        },
        {}
      );

      setReels(nextReels);
      setDrafts(nextDrafts);
    } catch (error) {
      console.error("Could not load Instagram Reels:", error);
      setErrorMessage("Could not load Instagram Reels.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReels();
  }, []);

  function updateDraft(
    id: string,
    field: keyof ReelDraft,
    value: string | number
  ): void {
    setDrafts((current: Record<string, ReelDraft>) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function handleCreate(): Promise<void> {
    const cleanUrl = newUrl.trim();

    if (!cleanUrl) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/instagram-reels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanUrl,
        }),
      });

      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        console.error("Create Reel failed:", payload);
        throw new Error("Could not add Instagram Reel.");
      }

      setNewUrl("");
      await loadReels();
    } catch (error) {
      console.error("Could not create Instagram Reel:", error);
      setErrorMessage("Could not add Instagram Reel.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSave(id: string): Promise<void> {
    const draft = drafts[id];

    if (!draft) {
      return;
    }

    setBusyId(id);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/instagram-reels", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          url: draft.url,
          sortOrder: draft.sortOrder,
        }),
      });

      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        console.error("Update Reel failed:", payload);
        throw new Error("Could not update Instagram Reel.");
      }

      await loadReels();
    } catch (error) {
      console.error("Could not update Instagram Reel:", error);
      setErrorMessage("Could not update Instagram Reel.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setBusyId(id);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/instagram-reels", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        console.error("Delete Reel failed:", payload);
        throw new Error("Could not delete Instagram Reel.");
      }

      await loadReels();
    } catch (error) {
      console.error("Could not delete Instagram Reel:", error);
      setErrorMessage("Could not delete Instagram Reel.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-[#E7DDD0] bg-white p-5 shadow-[0_24px_70px_rgba(40,60,93,0.10)] md:p-8">
      <div className="flex flex-col gap-6 border-b border-[#E7DDD0] pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#283C5D] text-[#D8BD8D] shadow-[0_12px_30px_rgba(40,60,93,0.20)]">
            <RadioTower  size={22} />
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D8BD8D]">
              Social content
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#283C5D]">
              Instagram Reels
            </h2>

            <p className="mt-1 text-sm text-[#283C5D]/55">
              Manage the Reels displayed on Esthetic Match.
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-[#E7DDD0] bg-[#FAF9F7] px-4 py-2 text-xs font-semibold text-[#283C5D]/65">
          {reels.length} {reels.length === 1 ? "Reel" : "Reels"}
        </span>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[#E7DDD0] bg-[#FAF9F7] p-4 md:p-5">
        <label
          htmlFor="new-instagram-reel"
          className="text-sm font-semibold text-[#283C5D]"
        >
          Add Instagram Reel
        </label>

        <p className="mt-1 text-xs text-[#283C5D]/50">
          Paste the complete public Instagram Reel URL.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Link2
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8BD8D]"
            />

            <input
              id="new-instagram-reel"
              type="url"
              value={newUrl}
              onChange={(event) => setNewUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCreate();
                }
              }}
              placeholder="https://www.instagram.com/reel/..."
              className="h-12 w-full rounded-full border border-[#E7DDD0] bg-white pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/30 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/10"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={isCreating || !newUrl.trim()}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-6 text-sm font-semibold text-white transition duration-300 hover:bg-[#D8BD8D] hover:text-[#283C5D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Plus size={17} />
            )}

            Add Reel
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <>
            {[0, 1, 2].map((item: number) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-[1.5rem] bg-[#FAF9F7]"
              />
            ))}
          </>
        ) : null}

        {!isLoading && reels.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#D8BD8D]/60 bg-[#FAF9F7] px-6 py-12 text-center">
            <RadioTower 
              size={26}
              className="mx-auto text-[#D8BD8D]"
            />

            <p className="mt-3 font-semibold text-[#283C5D]">
              No Instagram Reels yet
            </p>

            <p className="mt-1 text-sm text-[#283C5D]/50">
              Add the first Reel using the field above.
            </p>
          </div>
        ) : null}

        {reels.map((reel: InstagramReelRecord) => {
          const draft = drafts[reel.id];

          if (!draft) {
            return null;
          }

          const isBusy = busyId === reel.id;

          return (
            <div
              key={reel.id}
              className="flex flex-col gap-3 rounded-[1.5rem] border border-[#E7DDD0] bg-[#FAF9F7] p-4 transition hover:border-[#D8BD8D] md:flex-row md:items-center"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-[#D8BD8D]">
                <RadioTower  size={17} />
              </span>

              <input
                type="url"
                value={draft.url}
                onChange={(event) =>
                  updateDraft(reel.id, "url", event.target.value)
                }
                className="h-11 min-w-0 flex-1 rounded-full border border-[#E7DDD0] bg-white px-4 text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D]"
              />

              <input
                type="number"
                min={0}
                value={draft.sortOrder}
                onChange={(event) =>
                  updateDraft(
                    reel.id,
                    "sortOrder",
                    Number(event.target.value)
                  )
                }
                className="h-11 w-full rounded-full border border-[#E7DDD0] bg-white px-4 text-center text-sm text-[#283C5D] outline-none transition focus:border-[#D8BD8D] md:w-20"
                aria-label="Sort order"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSave(reel.id)}
                  disabled={isBusy}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-4 text-sm font-semibold text-white transition hover:bg-[#D8BD8D] hover:text-[#283C5D] disabled:opacity-50 md:flex-none"
                >
                  {isBusy ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  Save
                </button>

                <button
                  type="button"
                  onClick={() => void handleDelete(reel.id)}
                  disabled={isBusy}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  aria-label="Delete Reel"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}