"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import type { Message, MessageAttachment } from "./types";
import { formatMessageTime } from "./utils";

type MessageBubbleProps = {
  message: Message;
  isMine: boolean;
};

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const [selectedImage, setSelectedImage] =
    useState<MessageAttachment | null>(null);

  const hasText = Boolean(message.text?.trim());
  const hasAttachments = Boolean(message.attachments?.length);

  return (
    <>
      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[75%] overflow-hidden rounded-3xl shadow-sm ${
            isMine
              ? "rounded-br-md bg-[#283C5D] text-white"
              : "rounded-bl-md bg-white text-[#283C5D]"
          }`}
        >
          {hasAttachments && (
            <div className="space-y-2 p-2">
              {message.attachments.map((attachment) => (
                <button
                  key={attachment.id}
                  type="button"
                  onClick={() => setSelectedImage(attachment)}
                  className="relative h-56 w-56 overflow-hidden rounded-2xl bg-black/5 cursor-pointer"
                >
                  <Image
                    src={attachment.readUrl}
                    alt={attachment.fileName || "Message image"}
                    fill
                    className="object-cover transition hover:scale-105"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {hasText && (
            <p className="whitespace-pre-wrap px-5 pt-3 text-sm leading-relaxed">
              {message.text}
            </p>
          )}

          <p
            className={`px-5 pb-3 pt-2 text-right text-[10px] ${
              isMine ? "text-white/50" : "text-[#283C5D]/40"
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </p>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-[#283C5D]">
                {selectedImage.fileName || "Image"}
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={selectedImage.readUrl}
                  download={selectedImage.fileName || "message-image"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#283C5D] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F3F5] text-[#283C5D] transition hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl bg-black/5">
              <Image
                src={selectedImage.readUrl}
                alt={selectedImage.fileName || "Message image"}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}