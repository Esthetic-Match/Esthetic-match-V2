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
  className="
    inline-flex items-center justify-center gap-2 rounded-full
    bg-gradient-to-r from-[#d8bd8d] via-[#f4e4c6] to-[#c9a46a]
    px-5 py-3 text-sm font-medium text-black
    shadow-md shadow-[#d8bd8d]/30
    transition-all duration-200
    hover:scale-[1.02] hover:shadow-lg hover:shadow-[#d8bd8d]/40
    active:scale-[0.98]
    disabled:cursor-not-allowed disabled:opacity-60
  "
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