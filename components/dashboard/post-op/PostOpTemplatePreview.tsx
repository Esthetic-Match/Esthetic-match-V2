"use client";

import {
  CalendarDays,
  Check,
  CircleAlert,
  CircleX,
  Info,
} from "lucide-react";

export type PostOpReminderDto = {
  id: string;

  stepId: string | null;

  type:
    | "DO"
    | "DONT"
    | "GENERAL";

  text: string;

  startsAfterHours: number;
  endsAfterHours: number | null;

  notificationsEnabled: boolean;
  repeatEveryHours: number | null;

  isPinned: boolean;

  sortOrder: number;
};

export type PostOpBlockDto = {
  id: string;

  type:
    | "TEXT"
    | "IMAGE"
    | "VIDEO"
    | "BOOKING";

  text: string | null;

  objectPath: string | null;
  externalUrl: string | null;
  mediaAlt: string | null;

  bookingType:
    | "IN_CLINIC"
    | "ONLINE"
    | "EITHER"
    | null;

  bookingUrl: string | null;
  buttonLabel: string | null;

  sortOrder: number;
};

export type PostOpStepDto = {
  id: string;

  title: string;
  description: string | null;

  startsAfterHours: number;
  completesAfterHours: number | null;

  completionMode:
    | "TIME_BASED"
    | "MANUAL";

  sortOrder: number;

  blocks: PostOpBlockDto[];
  reminders: PostOpReminderDto[];
};

export type PostOpTemplateDto = {
  id: string;

  title: string;
  description: string | null;

  procedureId: string;
  localeCode: string;

  version: number;
  isActive: boolean;

  steps: PostOpStepDto[];

  reminders: PostOpReminderDto[];
};

function getYoutubeEmbedUrl(
  url: string,
) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes(
        "youtube.com",
      )
    ) {
      const id =
        parsed.searchParams.get("v");

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (
      parsed.hostname.includes(
        "youtu.be",
      )
    ) {
      const id =
        parsed.pathname.replace("/", "");

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function Reminder({
  reminder,
}: {
  reminder: PostOpReminderDto;
}) {
  if (reminder.type === "DO") {
    return (
      <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
        <Check className="mt-0.5 size-4 shrink-0" />

        <p>{reminder.text}</p>
      </div>
    );
  }

  if (reminder.type === "DONT") {
    return (
      <div className="flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-950">
        <CircleX className="mt-0.5 size-4 shrink-0" />

        <p>{reminder.text}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-2xl bg-[#283C5D]/5 p-4 text-sm text-[#283C5D]">
      <Info className="mt-0.5 size-4 shrink-0" />

      <p>{reminder.text}</p>
    </div>
  );
}

function Block({
  block,
}: {
  block: PostOpBlockDto;
}) {
  if (
    block.type === "TEXT" &&
    block.text
  ) {
    return (
      <p className="whitespace-pre-line text-[15px] leading-7 text-neutral-700">
        {block.text}
      </p>
    );
  }

  if (block.type === "IMAGE") {
    const src =
      block.externalUrl ?? "";

    if (!src) {
      return (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-5 text-center text-sm text-neutral-400">
          Image preview unavailable
          <br />
          {block.objectPath}
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={
            block.mediaAlt ??
            "PostOp instruction"
          }
          className="h-auto w-full object-cover"
        />
      </div>
    );
  }

  if (
    block.type === "VIDEO" &&
    block.externalUrl
  ) {
    const embed =
      getYoutubeEmbedUrl(
        block.externalUrl,
      );

    if (embed) {
      return (
        <div className="aspect-video overflow-hidden rounded-2xl bg-black">
          <iframe
            src={embed}
            title={
              block.mediaAlt ??
              "PostOp video"
            }
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video
        src={block.externalUrl}
        controls
        className="w-full rounded-2xl"
      />
    );
  }

  if (block.type === "BOOKING") {
    return (
      <div className="rounded-2xl border border-[#D8BD8D]/40 bg-[#D8BD8D]/10 p-5">
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-5 text-[#B4945A]" />

          <div>
            <p className="font-medium text-[#283C5D]">
              Follow-up appointment
            </p>

            <p className="mt-1 text-sm text-neutral-600">
              {block.bookingType ===
              "IN_CLINIC"
                ? "In-clinic consultation"
                : block.bookingType ===
                    "ONLINE"
                  ? "Online consultation"
                  : "Online or in-clinic consultation"}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-4 rounded-xl bg-[#283C5D] px-4 py-2.5 text-sm font-medium text-white opacity-80"
        >
          {block.buttonLabel ??
            "Book follow-up"}
        </button>
      </div>
    );
  }

  return null;
}

export default function PostOpTemplatePreview({
  template,
}: {
  template: PostOpTemplateDto;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-[0_20px_60px_rgba(40,60,93,0.08)]">
        <div className="border-b border-neutral-100 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4945A]">
            Your recovery
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#283C5D]">
            {template.title}
          </h2>

          {template.description && (
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {template.description}
            </p>
          )}
        </div>

        {template.reminders.length >
          0 && (
          <div className="space-y-2 border-b border-neutral-100 p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <CircleAlert className="size-4 text-[#B4945A]" />

              <p className="text-sm font-semibold text-[#283C5D]">
                Important reminders
              </p>
            </div>

            {template.reminders.map(
              (reminder) => (
                <Reminder
                  key={reminder.id}
                  reminder={reminder}
                />
              ),
            )}
          </div>
        )}

        <div className="space-y-8 p-6 md:p-8">
          {template.steps.map(
            (step, index) => (
              <section
                key={step.id}
                className="relative pl-8"
              >
                <div className="absolute left-0 top-1 flex size-6 items-center justify-center rounded-full bg-[#283C5D] text-xs font-semibold text-white">
                  {index + 1}
                </div>

                {index <
                  template.steps.length -
                    1 && (
                  <div className="absolute bottom-[-2rem] left-[11px] top-8 w-px bg-[#283C5D]/10" />
                )}

                <h3 className="font-semibold text-[#283C5D]">
                  {step.title}
                </h3>

                <p className="mt-1 text-xs text-neutral-400">
                  Starts after{" "}
                  {step.startsAfterHours}h
                  {step.completesAfterHours !==
                    null &&
                    ` • Until ${step.completesAfterHours}h`}
                </p>

                {step.description && (
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {step.description}
                  </p>
                )}

                <div className="mt-5 space-y-5">
                  {step.blocks.map(
                    (block) => (
                      <Block
                        key={block.id}
                        block={block}
                      />
                    ),
                  )}

                  {step.reminders.length >
                    0 && (
                    <div className="space-y-2">
                      {step.reminders.map(
                        (reminder) => (
                          <Reminder
                            key={
                              reminder.id
                            }
                            reminder={
                              reminder
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
              </section>
            ),
          )}
        </div>
      </div>
    </div>
  );
}