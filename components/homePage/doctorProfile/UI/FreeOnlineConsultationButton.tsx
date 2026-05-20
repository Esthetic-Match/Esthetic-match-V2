// components/homePage/UI/FreeOnlineConsultationButton.tsx
"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type FreeOnlineConsultationButtonProps = {
  doctorProfileId: string;
};

export default function FreeOnlineConsultationButton({
  doctorProfileId,
}: FreeOnlineConsultationButtonProps) {
  const t = useTranslations("doctor.doctor.profile.consultationPrices");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleStartConversation() {
    try {
      setIsLoading(true);

      const res = await fetch("/api/consultations/free-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorProfileId }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Could not start conversation.");
      }

      router.push("/dashboard/messages");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleStartConversation}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#283C5D] 
      px-5 py-3 text-sm font-normal text-white transition hover:bg-[#1f2f49] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <MessageCircle size={20} />
      )}
      {t("messageNow")}
    </button>
  );
}