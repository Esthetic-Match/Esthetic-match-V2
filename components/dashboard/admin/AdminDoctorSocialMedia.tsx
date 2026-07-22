"use client";

import {
  ChevronDown,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const PLATFORM_OPTIONS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "X", label: "X" },
  { value: "SNAPCHAT", label: "Snapchat" },
  { value: "WEBSITE", label: "Website" },
  { value: "OTHER", label: "Other" },
] as const;

type SocialMediaPlatform = (typeof PLATFORM_OPTIONS)[number]["value"];

type DoctorSummary = {
  userId: string;
  doctorProfileId: string;
  name: string | null;
  email: string;
  clinicName: string | null;
  avatar: string | null;
};

type SocialMediaLink = {
  id: string;
  platform: SocialMediaPlatform;
  url: string;
  username: string | null;
  label: string | null;
  isVisible: boolean;
  sortOrder: number;
};

type DoctorListPayload = {
  doctors: DoctorSummary[];
};

type SocialLinksPayload = {
  links: SocialMediaLink[];
};

type SocialLinkPayload = {
  link: SocialMediaLink;
};

type ApiErrorPayload = {
  error?: string;
};

type NewLinkDraft = {
  platform: SocialMediaPlatform;
  url: string;
  username: string;
  label: string;
  isVisible: boolean;
};

const EMPTY_DRAFT: NewLinkDraft = {
  platform: "INSTAGRAM",
  url: "",
  username: "",
  label: "",
  isVisible: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readDoctors(payload: unknown): DoctorSummary[] {
  if (!isRecord(payload)) return [];

  const value = isRecord(payload.data) ? payload.data.doctors : payload.doctors;

  return Array.isArray(value) ? (value as DoctorSummary[]) : [];
}

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | null;

  return payload?.error?.trim() || fallback;
}

function getDoctorLabel(doctor: DoctorSummary) {
  return doctor.name?.trim() || doctor.clinicName?.trim() || doctor.email;
}

function getPlatformLabel(platform: SocialMediaPlatform) {
  return (
    PLATFORM_OPTIONS.find((option) => option.value === platform)?.label ??
    platform
  );
}

export default function AdminDoctorSocialMedia() {
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [selectedDoctorUserId, setSelectedDoctorUserId] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [doctorReloadKey, setDoctorReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDoctors() {
      try {
        const response = await fetch("/api/admin/doctors", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            await readError(response, "Could not load doctor accounts."),
          );
        }

        const payload: unknown = await response.json();

        if (controller.signal.aborted) return;

        const doctorList = readDoctors(payload);

        setDoctors(doctorList);
        setDoctorError(null);
        setSelectedDoctorUserId((currentId) => {
          if (doctorList.some((doctor) => doctor.userId === currentId)) {
            return currentId;
          }

          return doctorList[0]?.userId ?? "";
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setDoctors([]);
        setSelectedDoctorUserId("");
        setDoctorError(
          error instanceof Error
            ? error.message
            : "Could not load doctor accounts.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDoctors(false);
        }
      }
    }

    void loadDoctors();

    return () => controller.abort();
  }, [doctorReloadKey]);

  const selectedDoctor = doctors.find(
    (doctor) => doctor.userId === selectedDoctorUserId,
  );

  function retryDoctors() {
    setIsLoadingDoctors(true);
    setDoctorError(null);
    setDoctorReloadKey((current) => current + 1);
  }

  return (
    <section className="relative z-20 mx-auto my-6 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-[#283C5D]/10 bg-white shadow-lg">
      <div className="flex flex-col gap-4 border-b border-[#283C5D]/10 bg-[#283C5D] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#D8BD8D]">
            <Share2 size={19} />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D8BD8D]">
              Doctor accounts
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              Social media links
            </h2>
          </div>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <select
            value={selectedDoctorUserId}
            onChange={(event) => setSelectedDoctorUserId(event.target.value)}
            disabled={isLoadingDoctors || doctors.length === 0}
            aria-label="Select doctor"
            className="min-h-11 w-full appearance-none rounded-full border border-white/15 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/20 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isLoadingDoctors ? (
              <option value="">Loading doctors…</option>
            ) : doctors.length === 0 ? (
              <option value="">No doctors available</option>
            ) : (
              doctors.map((doctor) => (
                <option key={doctor.userId} value={doctor.userId}>
                  {getDoctorLabel(doctor)} — {doctor.email}
                </option>
              ))
            )}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#283C5D]/50"
          />
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {doctorError ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p>{doctorError}</p>
            <button
              type="button"
              onClick={retryDoctors}
              disabled={isLoadingDoctors}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 font-semibold transition hover:bg-red-100 disabled:opacity-60"
            >
              {isLoadingDoctors ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              Retry
            </button>
          </div>
        ) : null}

        {!isLoadingDoctors && !doctorError && doctors.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#283C5D]/15 bg-[#FAF9F7] px-5 py-8 text-center text-sm text-[#283C5D]/60">
            No doctor profiles were found.
          </p>
        ) : null}

        {selectedDoctor ? (
          <DoctorSocialLinksEditor
            key={selectedDoctor.userId}
            doctor={selectedDoctor}
          />
        ) : null}
      </div>
    </section>
  );
}

function DoctorSocialLinksEditor({ doctor }: { doctor: DoctorSummary }) {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [draft, setDraft] = useState<NewLinkDraft>(EMPTY_DRAFT);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const endpoint = `/api/admin/doctors/${encodeURIComponent(
    doctor.userId,
  )}/social-media`;

  useEffect(() => {
    const controller = new AbortController();

    async function loadLinks() {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            await readError(response, "Could not load social media links."),
          );
        }

        const payload = (await response.json()) as SocialLinksPayload;

        if (controller.signal.aborted) return;

        setLinks(payload.links);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) return;

        setLinks([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load social media links.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadLinks();

    return () => controller.abort();
  }, [endpoint, reloadKey]);

  function retryLinks() {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    setReloadKey((current) => current + 1);
  }

  function updateLink(id: string, changes: Partial<SocialMediaLink>) {
    setLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, ...changes } : link)),
    );
  }

  async function createLink() {
    setBusyId("new");
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          sortOrder: links.length,
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response, "Could not add this link."));
      }

      const payload = (await response.json()) as SocialLinkPayload;

      setLinks((current) => [...current, payload.link]);
      setDraft(EMPTY_DRAFT);
      setIsAdding(false);
      setNotice("Social media link added.");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not add this link.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function saveLink(link: SocialMediaLink) {
    setBusyId(link.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(link),
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "Could not update this link."),
        );
      }

      const payload = (await response.json()) as SocialLinkPayload;

      setLinks((current) =>
        current.map((item) =>
          item.id === payload.link.id ? payload.link : item,
        ),
      );
      setNotice("Social media link updated.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update this link.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteLink(link: SocialMediaLink) {
    const confirmed = window.confirm(
      `Remove ${getPlatformLabel(link.platform)} from ${getDoctorLabel(doctor)}?`,
    );

    if (!confirmed) return;

    setBusyId(link.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `${endpoint}?id=${encodeURIComponent(link.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Could not delete this link."),
        );
      }

      setLinks((current) => current.filter((item) => item.id !== link.id));
      setNotice("Social media link removed.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this link.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#283C5D]">
            {getDoctorLabel(doctor)}
          </p>
          <p className="mt-1 text-xs text-[#283C5D]/55">
            {links.length} saved {links.length === 1 ? "link" : "links"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setError(null);
            setNotice(null);
          }}
          disabled={isLoading || isAdding}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f304c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          Add link
        </button>
      </div>

      {error ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>
          {links.length === 0 ? (
            <button
              type="button"
              onClick={retryLinks}
              disabled={isLoading}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 font-semibold"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {notice ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}

      {isAdding ? (
        <div className="mt-4 rounded-2xl border border-[#D8BD8D]/45 bg-[#D8BD8D]/[0.08] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#283C5D]">New link</p>
            <button
              type="button"
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setIsAdding(false);
              }}
              disabled={busyId === "new"}
              aria-label="Close new link form"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#283C5D]/55 transition hover:bg-white"
            >
              <X size={16} />
            </button>
          </div>

          <CompactLinkFields
            platform={draft.platform}
            url={draft.url}
            username={draft.username}
            label={draft.label}
            isVisible={draft.isVisible}
            disabled={busyId === "new"}
            onPlatformChange={(platform) =>
              setDraft((current) => ({ ...current, platform }))
            }
            onUrlChange={(url) =>
              setDraft((current) => ({ ...current, url }))
            }
            onUsernameChange={(username) =>
              setDraft((current) => ({ ...current, username }))
            }
            onLabelChange={(label) =>
              setDraft((current) => ({ ...current, label }))
            }
            onVisibilityChange={(isVisible) =>
              setDraft((current) => ({ ...current, isVisible }))
            }
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => void createLink()}
              disabled={busyId === "new" || !draft.url.trim()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busyId === "new" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Save link
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5 flex min-h-28 items-center justify-center rounded-2xl bg-[#FAF9F7] text-sm text-[#283C5D]/60">
          <Loader2 size={17} className="mr-2 animate-spin" />
          Loading links…
        </div>
      ) : links.length === 0 && !error ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#283C5D]/15 bg-[#FAF9F7] px-5 py-8 text-center">
          <Link2 size={20} className="mx-auto text-[#D8BD8D]" />
          <p className="mt-3 text-sm font-semibold text-[#283C5D]">
            No social links added
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {links.map((link) => {
            const isBusy = busyId === link.id;

            return (
              <article
                key={link.id}
                className="rounded-2xl border border-[#283C5D]/10 bg-[#FAF9F7] p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#283C5D]">
                    {getPlatformLabel(link.platform)}
                  </p>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#283C5D]/55 transition hover:text-[#283C5D]"
                  >
                    Preview
                    <ExternalLink size={13} />
                  </a>
                </div>

                <CompactLinkFields
                  platform={link.platform}
                  url={link.url}
                  username={link.username ?? ""}
                  label={link.label ?? ""}
                  isVisible={link.isVisible}
                  disabled={isBusy}
                  onPlatformChange={(platform) =>
                    updateLink(link.id, { platform })
                  }
                  onUrlChange={(url) => updateLink(link.id, { url })}
                  onUsernameChange={(username) =>
                    updateLink(link.id, { username })
                  }
                  onLabelChange={(label) => updateLink(link.id, { label })}
                  onVisibilityChange={(isVisible) =>
                    updateLink(link.id, { isVisible })
                  }
                />

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void deleteLink(link)}
                    disabled={isBusy}
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => void saveLink(link)}
                    disabled={isBusy || !link.url.trim()}
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {isBusy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

type CompactLinkFieldsProps = {
  platform: SocialMediaPlatform;
  url: string;
  username: string;
  label: string;
  isVisible: boolean;
  disabled: boolean;
  onPlatformChange: (value: SocialMediaPlatform) => void;
  onUrlChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onVisibilityChange: (value: boolean) => void;
};

function CompactLinkFields({
  platform,
  url,
  username,
  label,
  isVisible,
  disabled,
  onPlatformChange,
  onUrlChange,
  onUsernameChange,
  onLabelChange,
  onVisibilityChange,
}: CompactLinkFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select
        value={platform}
        onChange={(event) =>
          onPlatformChange(event.target.value as SocialMediaPlatform)
        }
        disabled={disabled}
        aria-label="Platform"
        className="min-h-10 rounded-xl border border-[#283C5D]/15 bg-white px-3 py-2 text-sm text-[#283C5D] outline-none focus:border-[#D8BD8D] disabled:bg-neutral-50"
      >
        {PLATFORM_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input
        type="url"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="https://..."
        disabled={disabled}
        aria-label="Profile URL"
        className="min-h-10 rounded-xl border border-[#283C5D]/15 bg-white px-3 py-2 text-sm text-[#283C5D] outline-none placeholder:text-neutral-400 focus:border-[#D8BD8D] disabled:bg-neutral-50 lg:col-span-2"
      />

      <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[#283C5D]/10 bg-white px-3 py-2 text-xs font-semibold text-[#283C5D]">
        Visible
        <input
          type="checkbox"
          checked={isVisible}
          onChange={(event) => onVisibilityChange(event.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-[#283C5D]/25 text-[#283C5D] focus:ring-[#D8BD8D]"
        />
      </label>

      <input
        type="text"
        value={username}
        onChange={(event) => onUsernameChange(event.target.value)}
        placeholder="Username"
        disabled={disabled}
        maxLength={100}
        className="min-h-10 rounded-xl border border-[#283C5D]/15 bg-white px-3 py-2 text-sm text-[#283C5D] outline-none placeholder:text-neutral-400 focus:border-[#D8BD8D] disabled:bg-neutral-50 sm:col-span-1 lg:col-span-2"
      />

      <input
        type="text"
        value={label}
        onChange={(event) => onLabelChange(event.target.value)}
        placeholder="Display label (optional)"
        disabled={disabled}
        maxLength={100}
        className="min-h-10 rounded-xl border border-[#283C5D]/15 bg-white px-3 py-2 text-sm text-[#283C5D] outline-none placeholder:text-neutral-400 focus:border-[#D8BD8D] disabled:bg-neutral-50 sm:col-span-1 lg:col-span-2"
      />
    </div>
  );
}