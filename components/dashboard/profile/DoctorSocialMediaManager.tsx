"use client";

import {
  AtSign,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const PLATFORM_OPTIONS = [
  { value: "INSTAGRAM", labelKey: "platforms.instagram" },
  { value: "FACEBOOK", labelKey: "platforms.facebook" },
  { value: "TIKTOK", labelKey: "platforms.tiktok" },
  { value: "YOUTUBE", labelKey: "platforms.youtube" },
  { value: "LINKEDIN", labelKey: "platforms.linkedin" },
  { value: "X", labelKey: "platforms.x" },
  { value: "SNAPCHAT", labelKey: "platforms.snapchat" },
  { value: "WEBSITE", labelKey: "platforms.website" },
  { value: "OTHER", labelKey: "platforms.other" },
] as const;

type SocialMediaPlatform = (typeof PLATFORM_OPTIONS)[number]["value"];

type SocialMediaLink = {
  id: string;
  platform: SocialMediaPlatform;
  url: string;
  username: string | null;
  label: string | null;
  isVisible: boolean;
  sortOrder: number;
};

type LinksResponse = {
  links: SocialMediaLink[];
};

type LinkResponse = {
  link: SocialMediaLink;
};

type ApiErrorResponse = {
  error?: string;
};

type SocialMediaDraft = {
  platform: SocialMediaPlatform;
  url: string;
  username: string;
  label: string;
  isVisible: boolean;
};

const EMPTY_DRAFT: SocialMediaDraft = {
  platform: "INSTAGRAM",
  url: "",
  username: "",
  label: "",
  isVisible: true,
};

async function getErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error?.trim() || fallback;
}

export default function DoctorSocialMediaManager() {
  const t = useTranslations("doctor.socialMedia");
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [draft, setDraft] = useState<SocialMediaDraft>(EMPTY_DRAFT);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLinks() {
      try {
        const response = await fetch("/api/doctor-profile/social-media", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response,
              t("errors.load"),
            ),
          );
        }

        const data = (await response.json()) as LinksResponse;

        if (controller.signal.aborted) return;

        setLinks(data.links);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) return;

        setLinks([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : t("errors.load"),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchLinks();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  function updateLink(
    id: string,
    changes: Partial<Omit<SocialMediaLink, "id">>,
  ) {
    setLinks((currentLinks) =>
      currentLinks.map((link) =>
        link.id === id ? { ...link, ...changes } : link,
      ),
    );
  }

  function retryLoading() {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    setReloadKey((currentKey) => currentKey + 1);
  }

  async function createLink() {
    setBusyId("new");
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/doctor-profile/social-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...draft,
          sortOrder: links.length,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, t("errors.add")),
        );
      }

      const data = (await response.json()) as LinkResponse;

      setLinks((currentLinks) => [...currentLinks, data.link]);
      setDraft(EMPTY_DRAFT);
      setIsAdding(false);
      setNotice(t("notices.added"));
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : t("errors.add"),
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
      const response = await fetch("/api/doctor-profile/social-media", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(link),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, t("errors.update")),
        );
      }

      const data = (await response.json()) as LinkResponse;

      setLinks((currentLinks) =>
        currentLinks.map((currentLink) =>
          currentLink.id === data.link.id ? data.link : currentLink,
        ),
      );
      setNotice(t("notices.updated"));
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t("errors.update"),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteLink(link: SocialMediaLink) {
    const platformOption = PLATFORM_OPTIONS.find(
      (option) => option.value === link.platform,
    );
    const platformLabel = platformOption
      ? t(platformOption.labelKey)
      : link.platform;

    const confirmed = window.confirm(
      t("confirmDelete", { platform: platformLabel }),
    );

    if (!confirmed) return;

    setBusyId(link.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/doctor-profile/social-media?id=${encodeURIComponent(link.id)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, t("errors.delete")),
        );
      }

      setLinks((currentLinks) =>
        currentLinks.filter((currentLink) => currentLink.id !== link.id),
      );
      setNotice(t("notices.removed"));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : t("errors.delete"),
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="relative z-20 mx-auto my-4 mt-6 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-gray-300/10 bg-white shadow-lg">
      <div className="relative overflow-hidden border-b border-[#283C5D]/10 bg-[#283C5D] px-6 py-6 sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#D8BD8D]/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#D8BD8D]">
              <Share2 size={21} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8BD8D]">
                {t("eyebrow")}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {t("title")}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setError(null);
              setNotice(null);
            }}
            disabled={isLoading || isAdding}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#F7F3EA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={17} />
            {t("actions.add")}
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-6 text-neutral-500">
          {t("description")}
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {notice}
          </div>
        ) : null}

        {isAdding ? (
          <div className="mt-6 rounded-[1.6rem] border border-[#D8BD8D]/45 bg-[#D8BD8D]/[0.08] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#283C5D]">
                  {t("newLink.title")}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {t("newLink.description")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDraft(EMPTY_DRAFT);
                  setIsAdding(false);
                }}
                disabled={busyId === "new"}
                aria-label={t("actions.closeNewLink")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#283C5D]/55 transition hover:bg-white hover:text-[#283C5D] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <SocialMediaFields
              platform={draft.platform}
              url={draft.url}
              username={draft.username}
              label={draft.label}
              isVisible={draft.isVisible}
              disabled={busyId === "new"}
              onPlatformChange={(platform) =>
                setDraft((currentDraft) => ({ ...currentDraft, platform }))
              }
              onUrlChange={(url) =>
                setDraft((currentDraft) => ({ ...currentDraft, url }))
              }
              onUsernameChange={(username) =>
                setDraft((currentDraft) => ({ ...currentDraft, username }))
              }
              onLabelChange={(label) =>
                setDraft((currentDraft) => ({ ...currentDraft, label }))
              }
              onVisibilityChange={(isVisible) =>
                setDraft((currentDraft) => ({ ...currentDraft, isVisible }))
              }
            />

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => void createLink()}
                disabled={busyId === "new" || !draft.url.trim()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f304c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === "new" ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                {t("actions.saveLink")}
              </button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-8 flex min-h-40 items-center justify-center rounded-[1.6rem] border border-[#283C5D]/10 bg-[#283C5D]/[0.025]">
            <div className="flex items-center gap-3 text-sm font-medium text-[#283C5D]/65">
              <Loader2 size={18} className="animate-spin" />
              {t("loading")}
            </div>
          </div>
        ) : error && links.length === 0 ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={retryLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#283C5D]/15 px-5 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D]/5"
            >
              <RefreshCw size={16} />
              {t("actions.retry")}
            </button>
          </div>
        ) : links.length === 0 ? (
          <div className="mt-8 rounded-[1.6rem] border border-dashed border-[#283C5D]/15 bg-[#283C5D]/[0.025] px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8BD8D]/15 text-[#B89558]">
              <Link2 size={21} />
            </span>
            <p className="mt-4 text-sm font-semibold text-[#283C5D]">
              {t("empty.title")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {t("empty.description")}
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {links.map((link) => {
              const isBusy = busyId === link.id;
              const platformOption = PLATFORM_OPTIONS.find(
                (option) => option.value === link.platform,
              );
              const platformLabel = platformOption
                ? t(platformOption.labelKey)
                : link.platform;

              return (
                <article
                  key={link.id}
                  className="rounded-[1.6rem] border border-[#283C5D]/10 bg-white p-5 shadow-[0_12px_35px_rgba(40,60,93,0.05)] sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#283C5D]">
                        {platformLabel}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {link.isVisible
                          ? t("visibility.visible")
                          : t("visibility.hidden")}
                      </p>
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#283C5D]/65 transition hover:text-[#283C5D]"
                    >
                      {t("actions.preview")}
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <SocialMediaFields
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

                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => void deleteLink(link)}
                      disabled={isBusy}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {t("actions.delete")}
                    </button>

                    <button
                      type="button"
                      onClick={() => void saveLink(link)}
                      disabled={isBusy || !link.url.trim()}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#283C5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f304c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {t("actions.saveChanges")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

type SocialMediaFieldsProps = {
  platform: SocialMediaPlatform;
  url: string;
  username: string;
  label: string;
  isVisible: boolean;
  disabled: boolean;
  onPlatformChange: (platform: SocialMediaPlatform) => void;
  onUrlChange: (url: string) => void;
  onUsernameChange: (username: string) => void;
  onLabelChange: (label: string) => void;
  onVisibilityChange: (isVisible: boolean) => void;
};

function SocialMediaFields({
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
}: SocialMediaFieldsProps) {
  const t = useTranslations("doctor.socialMedia");

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#283C5D]/60">
          {t("fields.platform")}
        </span>
        <select
          value={platform}
          onChange={(event) =>
            onPlatformChange(event.target.value as SocialMediaPlatform)
          }
          disabled={disabled}
          className="mt-2 min-h-12 w-full rounded-2xl border border-[#283C5D]/15 bg-white px-4 py-3 text-sm font-medium text-[#283C5D] outline-none transition focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/15 disabled:cursor-not-allowed disabled:bg-neutral-50"
        >
          {PLATFORM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#283C5D]/60">
          {t("fields.profileUrl")}
        </span>
        <div className="relative mt-2">
          <Link2
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#283C5D]/40"
          />
          <input
            type="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://..."
            disabled={disabled}
            className="min-h-12 w-full rounded-2xl border border-[#283C5D]/15 bg-white py-3 pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-neutral-400 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/15 disabled:cursor-not-allowed disabled:bg-neutral-50"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#283C5D]/60">
          {t("fields.username")}
        </span>
        <div className="relative mt-2">
          <AtSign
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#283C5D]/40"
          />
          <input
            type="text"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder={t("placeholders.username")}
            disabled={disabled}
            maxLength={100}
            className="min-h-12 w-full rounded-2xl border border-[#283C5D]/15 bg-white py-3 pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-neutral-400 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/15 disabled:cursor-not-allowed disabled:bg-neutral-50"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#283C5D]/60">
          {t("fields.displayLabel")}
        </span>
        <div className="relative mt-2">
          <Globe2
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#283C5D]/40"
          />
          <input
            type="text"
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder={
              platform === "OTHER"
                ? t("placeholders.otherLabel")
                : t("placeholders.optional")
            }
            disabled={disabled}
            maxLength={100}
            className="min-h-12 w-full rounded-2xl border border-[#283C5D]/15 bg-white py-3 pl-11 pr-4 text-sm text-[#283C5D] outline-none transition placeholder:text-neutral-400 focus:border-[#D8BD8D] focus:ring-4 focus:ring-[#D8BD8D]/15 disabled:cursor-not-allowed disabled:bg-neutral-50"
          />
        </div>
      </label>

      <label className="md:col-span-2 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#283C5D]/10 bg-[#283C5D]/[0.025] px-4 py-3">
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#283C5D] shadow-sm">
            {isVisible ? <Eye size={17} /> : <EyeOff size={17} />}
          </span>
          <span>
            <span className="block text-sm font-semibold text-[#283C5D]">
              {t("fields.showOnProfile")}
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              {t("fields.visibilityHelp")}
            </span>
          </span>
        </span>

        <input
          type="checkbox"
          checked={isVisible}
          onChange={(event) => onVisibilityChange(event.target.checked)}
          disabled={disabled}
          className="h-5 w-5 rounded border-[#283C5D]/25 text-[#283C5D] focus:ring-[#D8BD8D] disabled:cursor-not-allowed"
        />
      </label>
    </div>
  );
}