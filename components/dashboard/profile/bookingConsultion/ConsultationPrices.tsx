"use client";

import { useState } from "react";
import { Check, Pencil, WalletCards, X } from "lucide-react";
import CardTitle from "@/components/dashboard/profile/UI/CardTitle";
import PriceRow from "@/components/dashboard/profile/UI/PriceRow";
import type { DoctorProfileData } from "../types";
import { useTranslations } from "next-intl";

type ConsultationPricesProps = {
  inClinicPrice?: number | null;
  onlineConsulPrice?: number | null;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void | Promise<void>;
};

export default function ConsultationPrices({
  inClinicPrice,
  onlineConsulPrice,
  onUpdateProfile,
}: ConsultationPricesProps) {
  const t = useTranslations("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [clinicPriceValue, setClinicPriceValue] = useState(
    inClinicPrice?.toString() || ""
  );
  const [onlinePriceValue, setOnlinePriceValue] = useState(
    onlineConsulPrice?.toString() || ""
  );

  function handleCancel() {
    setClinicPriceValue(inClinicPrice?.toString() || "");
    setOnlinePriceValue(onlineConsulPrice?.toString() || "");
    setIsEditing(false);
  }

  async function handleSave() {
    await onUpdateProfile({
      inClinicPrice: clinicPriceValue ? Number(clinicPriceValue) : null,
      onlineConsulPrice: onlinePriceValue ? Number(onlinePriceValue) : null,
    });

    setIsEditing(false);
  }

  return (
    <div className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
      <div className="flex items-center justify-between gap-4">
        <CardTitle
          icon={<WalletCards size={22} />}
          title={t("consultationPrices.title")}
        />

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer bg-gray-400 text-white transition hover:bg-[#283C5D] active:scale-[0.98]"
            >
              <Check size={16} />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer bg-red-30 text-red-500 transition hover:bg-gray-200 active:scale-[0.98]"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex h-8 w-10 items-center justify-center rounded-full cursor-pointer border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.98]"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>

      <div className="mt-10 space-y-8">
        {isEditing ? (
          <EditablePriceRow
            label={t("consultationPrices.inClinic")}
            value={clinicPriceValue}
            onChange={setClinicPriceValue}
          />
        ) : (
          <PriceRow
            label={t("consultationPrices.inClinic")}
            price={inClinicPrice}
          />
        )}

        <div className="border-t border-gray-200" />

        {isEditing ? (
          <EditablePriceRow
            label={t("consultationPrices.online")}
            value={onlinePriceValue}
            onChange={setOnlinePriceValue}
          />
        ) : (
          <PriceRow
            label={t("consultationPrices.online")}
            price={onlineConsulPrice}
          />
        )}
      </div>
    </div>
  );
}

function EditablePriceRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full rounded-full border border-gray-200 px-7 py-2 text-sm font-semibold text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
      />
    </div>
  );
}