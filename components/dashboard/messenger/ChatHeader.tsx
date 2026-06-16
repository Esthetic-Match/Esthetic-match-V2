"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircleOff } from "lucide-react";
import type { Conversation, MeUser, OtherPerson } from "./types";
import { getInitials } from "./utils";
import { useTranslations } from "next-intl";

type ChatHeaderProps = {
  person: OtherPerson | null;
  subtitle: string;
  me: MeUser;
  conversation: Conversation;
  onEndConversation: (conversationId: string) => void;
};

export default function ChatHeader({
  person,
  subtitle,
  me,
  conversation,
  onEndConversation,
}: ChatHeaderProps) {
  const t = useTranslations("messages.messages.chatHeader");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fallbackImage = "/images/default-doctor.png";

  const imageSrc =
    !imageError && person?.image
      ? person.image
      : fallbackImage;

  const canEndConversation =
    me.role === "DOCTOR" && conversation.status === "ACTIVE";

  return (
    <>
      <div className="relative flex items-center justify-between gap-3 border-b border-[#283C5D]/10 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#283C5D]/10 text-[#283C5D] sm:h-12 sm:w-12">
            {person?.image && !imageError ? (
              <Image
                src={imageSrc}
                alt={person?.name || t("profileAlt")}
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xs font-bold sm:text-sm">
                {getInitials(person?.name, person?.email)}
              </span>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-[#283C5D] sm:text-lg">
              {person?.name}
            </h2>
          
            <p className="truncate text-xs text-[#283C5D]/50 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>
          
        {canEndConversation && (
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            aria-label={t("endConversation")}
            title={t("endConversation")}
            className="
              inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full
              border border-red-200 bg-red-50 text-red-600
              transition-all duration-200
              hover:scale-[1.03] hover:bg-red-100
              active:scale-[0.97]
              sm:h-auto sm:w-auto sm:px-4 sm:py-2.5
            "
          >
            <MessageCircleOff className="h-4 w-4" />
        
            <span className="hidden text-sm font-semibold sm:inline">
              {t("endConversation")}
            </span>
          </button>
        )}
      </div>
      
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#283C5D]">
              {t("modalTitle")}
            </h3>
      
            <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
              {t("modalDescription")}
            </p>
      
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-full border border-[#283C5D]/10 px-5 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D]/5"
              >
                {t("cancel")}
              </button>
      
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  onEndConversation(conversation.id);
                }}
                className="rounded-full bg-[#A74848] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A74848]/90"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}