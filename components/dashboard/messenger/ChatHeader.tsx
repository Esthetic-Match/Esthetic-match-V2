"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreVertical, MessageCircleOff } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <div className="relative flex items-center justify-between border-b border-[#283C5D]/10 bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#283C5D]/10 text-[#283C5D]">
            {person?.image ? (
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#283C5D]/10 text-[#283C5D]">
                <Image
                  src={imageSrc}
                  alt={person?.name || t("profileAlt")}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <span className="text-sm font-bold">
                {getInitials(person?.name, person?.email)}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#283C5D]">
              {person?.name}
            </h2>
            <p className="text-sm text-[#283C5D]/50">{subtitle}</p>
          </div>
        </div>

        {canEndConversation && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#283C5D] transition hover:bg-[#283C5D]/10 cursor-pointer"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-2xl border border-[#283C5D]/10 bg-white shadow-xl">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsConfirmOpen(true);
                  }}
                  className=" flex flex-row justify-start items-center w-full px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
                >
                  <MessageCircleOff className="h-4 w-4 mr-2" />
                  {t("endConversation")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#283C5D]">
              {t("modalTitle")}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
              {t("modalDescription")}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-full border border-[#283C5D]/10 px-5 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D]/5 cursor-pointer"
              >
                {t("cancel")}
              </button>

              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  onEndConversation(conversation.id);
                }}
                className="rounded-full bg-[#A74848] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A74848]/90 cursor-pointer"
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