"use client";

import { useState } from "react";
import {
  CalendarDays,
  Loader2,
  Pencil,
  ExternalLink,
  Link2,
  Check,
  X,
} from "lucide-react";
import CardTitle from "../UI/CardTitle";
import { useTranslations } from "next-intl";

type BookingLinksProps = {
  bookingLinks?: string[] | null;
};

function normalizeBookingLinks(bookingLinks?: string[] | null) {
  return [
    ...(bookingLinks ?? []),
    ...Array(Math.max(0, 3 - (bookingLinks?.length ?? 0))).fill(""),
  ].slice(0, 3);
}

export default function BookingLinks({
  bookingLinks,
}: BookingLinksProps) {
  const t = useTranslations("dashboard");

  const [links, setLinks] = useState<string[]>(() =>
    normalizeBookingLinks(bookingLinks)
  );

  const [editingIndexes, setEditingIndexes] = useState<boolean[]>(() =>
    normalizeBookingLinks(bookingLinks).map((link) => !link)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateLink(index: number, value: string) {
    setLinks((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  }

  function enableEdit(index: number) {
    setEditingIndexes((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? true : item
      )
    );
  }

  function cancelEdit(index: number) {
    const savedLink = normalizeBookingLinks(bookingLinks)[index];

    if (!savedLink) return;

    setLinks((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? savedLink : item
      )
    );

    setEditingIndexes((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? false : item
      )
    );
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const filteredLinks = links
        .map((link) => link.trim())
        .filter(Boolean);

      const res = await fetch("/api/doctor-profile/booking-links", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingLinks: filteredLinks,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || t("booking.saveError"));
      }

      const nextLinks = Array.isArray(data?.bookingLinks)
        ? normalizeBookingLinks(data.bookingLinks)
        : normalizeBookingLinks(filteredLinks);

      setLinks(nextLinks);
      setEditingIndexes(nextLinks.map((link) => !link));
      setSuccessMessage(t("booking.saveSuccess"));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("booking.saveError")
      );
    } finally {
      setIsSaving(false);
    }
  }

  const savedLinks = normalizeBookingLinks(bookingLinks);

  const hasAnyChanges = links.some(
    (link, index) => link.trim() !== savedLinks[index]
  );

  return (
    <div className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
      <CardTitle
        icon={<CalendarDays size={22} />}
        title={t("booking.title")}
      />

      <div className="mt-8 space-y-5">
        <p className="text-xs font-medium uppercase tracking-widest text-black/35">
          {t("booking.sectionLabel", {
            defaultValue: "Up to 3 booking links",
          })}
        </p>

        <div className="space-y-3">
          {links.map((link, index) => {
            const isEditing = editingIndexes[index];
            const hasLink = link.trim().length > 0;
            const savedLink = savedLinks[index];
            const isDirty = link.trim() !== savedLink;

            if (hasLink && !isEditing) {
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-2xl border border-[#283C5D]/10 bg-[#F4F6FA] px-4 py-3"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#283C5D]/8 text-[#283C5D]">
                    <ExternalLink size={16} />

                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm font-medium text-[#283C5D] underline-offset-4 hover:underline"
                  >
                    {link.replace(/^https?:\/\//, "")}
                  </a>

                  <button
                    type="button"
                    onClick={() => enableEdit(index)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#283C5D]/50 transition hover:bg-[#283C5D]/8 hover:text-[#283C5D]"
                    aria-label="Edit booking link"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`group flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${
                  hasLink
                    ? "border-[#283C5D]/20 bg-white ring-2 ring-[#283C5D]/10"
                    : "border-dashed border-black/15 bg-[#FAFAFA] hover:border-[#283C5D]/30 hover:bg-white"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                    hasLink
                      ? "bg-[#283C5D]/8 text-[#283C5D]"
                      : "bg-black/5 text-black/30 group-hover:bg-[#283C5D]/8 group-hover:text-[#283C5D]"
                  }`}
                >
                  <Link2 size={16} />
                </div>

                <input
                  type="url"
                  value={link}
                  onChange={(event) =>
                    updateLink(index, event.target.value)
                  }
                  placeholder={t("booking.linkPlaceholder", {
                    number: index + 1,
                    defaultValue: `Paste booking link ${index + 1}…`,
                  })}
                  className="w-full bg-transparent text-sm text-[#283C5D] outline-none placeholder:text-black/30"
                  autoFocus={hasLink}
                />

                {isDirty && hasLink && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                    Unsaved
                  </span>
                )}

                {savedLink && isEditing && (
                  <button
                    type="button"
                    onClick={() => cancelEdit(index)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-black/30 transition hover:bg-black/5 hover:text-black/60"
                    aria-label="Cancel edit"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <Check size={15} />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <p className="text-sm font-medium text-red-500">
            {errorMessage}
          </p>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasAnyChanges}
            className="inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("booking.saving")}
              </>
            ) : (
              t("booking.saveLinks")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}