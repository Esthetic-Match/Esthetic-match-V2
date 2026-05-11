"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Plus, Pencil, ExternalLink } from "lucide-react";
import CardTitle from "../UI/CardTitle";
import PremiumLockedContent from "../UI/PremiumLockedContent";
import { useTranslations } from "next-intl";

type BookingLinksProps = {
  paidPlan?: string | null;
  bookingLinks?: string[] | null;
};

export default function BookingLinks({
  paidPlan,
  bookingLinks,
}: BookingLinksProps) {
  const t = useTranslations("dashboard");
  const isStandard = paidPlan === "standard";

  const initialLinks =
    bookingLinks && bookingLinks.length > 0
      ? [...bookingLinks, ...Array(Math.max(0, 3 - bookingLinks.length)).fill("")]
      : ["", "", ""];

  const [links, setLinks] = useState<string[]>(initialLinks.slice(0, 3));
  const [editingIndexes, setEditingIndexes] = useState<boolean[]>(
    initialLinks.slice(0, 3).map((link) => !link)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateLink(index: number, value: string) {
    setLinks((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? value : item
      )
    );
  }

  function enableEdit(index: number) {
    setEditingIndexes((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? true : item
      )
    );
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const filteredLinks = links.map((link) => link.trim()).filter(Boolean);

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

      const nextLinks =
        data?.bookingLinks && Array.isArray(data.bookingLinks)
          ? [
              ...data.bookingLinks,
              ...Array(Math.max(0, 3 - data.bookingLinks.length)).fill(""),
            ].slice(0, 3)
          : links;

      setLinks(nextLinks);
      setEditingIndexes(nextLinks.map((link) => !link));
      setSuccessMessage(t("booking.saveSuccess"));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("booking.saveError")
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
      <CardTitle
        icon={<CalendarDays size={22} />}
        title={t("booking.title")}
      />

      {!isStandard ? (
        <div className="mt-10">
          <PremiumLockedContent
            title={t("booking.hiddenTitle")}
            description={t("booking.hiddenDescription")}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="space-y-3">
            {links.slice(0, 3).map((link, index) => {
              const isEditing = editingIndexes[index];
              const hasLink = link.trim().length > 0;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#283C5D]">
                    {hasLink && !isEditing ? (
                      <ExternalLink size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </div>

                  {hasLink && !isEditing ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[#283C5D] underline-offset-4 hover:underline"
                    >
                      {link}
                    </a>
                  ) : (
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      placeholder={t("booking.linkPlaceholder", {
                        number: index + 1,
                      })}
                      className="w-full bg-transparent text-sm text-[#283C5D] outline-none placeholder:text-black/25"
                    />
                  )}

                  {hasLink && !isEditing ? (
                    <button
                      type="button"
                      onClick={() => enableEdit(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
                      aria-label="Edit booking link"
                    >
                      <Pencil size={16} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {successMessage ? (
            <p className="text-sm font-medium text-green-600">
              {successMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="text-sm font-medium text-red-500">
              {errorMessage}
            </p>
          ) : null}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
      )}
    </div>
  );
}