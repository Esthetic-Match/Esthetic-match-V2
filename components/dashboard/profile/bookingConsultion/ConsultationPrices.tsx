"use client";

import { useState } from "react";
import { Pencil, WalletCards, X } from "lucide-react";
import CardTitle from "@/components/dashboard/profile/UI/CardTitle";
import PriceRow from "@/components/dashboard/profile/UI/PriceRow";
import type { DoctorProfileData } from "../types";
import { useTranslations } from "next-intl";

type ConsultationPricesProps = {
  inClinicPrice?: number | null;
  onlineConsulPrice?: number | null;
  onlineActive?: boolean | null;
  currency?: string | null;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void | Promise<void>;
};

export default function ConsultationPrices({
  inClinicPrice,
  onlineConsulPrice,
  onlineActive,
  currency,
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

  const [onlineActiveValue, setOnlineActiveValue] = useState(
    Boolean(onlineActive)
  );

  function handleCancel() {
    setClinicPriceValue(inClinicPrice?.toString() || "");
    setOnlinePriceValue(onlineConsulPrice?.toString() || "");
    setOnlineActiveValue(Boolean(onlineActive));
    setIsEditing(false);
  }

  async function handleSave() {
    await onUpdateProfile({
      inClinicPrice: clinicPriceValue ? Number(clinicPriceValue) : null,
      onlineConsulPrice: onlinePriceValue ? Number(onlinePriceValue) : null,
      onlineActive: onlineActiveValue,
    });

    setIsEditing(false);
  }

  return (
    <div className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle
          icon={<WalletCards size={22} />}
          title={t("consultationPrices.title")}
        />

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex h-8 w-24 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-[#283c5d] text-white transition hover:bg-[#283C5D]/80 active:scale-[0.98]"
            >
              <p>{t("common.save")}</p>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-red-500 transition hover:bg-gray-200 active:scale-[0.98]"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex h-8 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.98]"
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
            currency={currency}
          />
        )}

        <div className="border-t border-gray-200" />

        {isEditing ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#283C5D]">
                  {t("consultationPrices.onlineActive")}
                </p>
                <p className="mt-1 text-xs text-[#283C5D]/50">
                  {onlineActiveValue
                    ? t("consultationPrices.onlineActiveEnabled")
                    : t("consultationPrices.onlineActiveDisabled")}
                </p>
              </div>

              <ToggleSwitch
                checked={onlineActiveValue}
                onChange={setOnlineActiveValue}
              />
            </div>

            <EditablePriceRow
              label={t("consultationPrices.online")}
              value={onlinePriceValue}
              onChange={setOnlinePriceValue}
              disabled={!onlineActiveValue}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#283C5D]">
                  {t("consultationPrices.onlineActive")}
                </p>
                <p className="mt-1 text-xs text-[#283C5D]/50">
                  {onlineActive
                    ? t("consultationPrices.onlineActiveEnabled")
                    : t("consultationPrices.onlineActiveDisabled")}
                </p>
              </div>

              <StatusBadge
                active={Boolean(onlineActive)}
                activeLabel={t("consultationPrices.active")}
                inactiveLabel={t("consultationPrices.inactive")}
              />
            </div>

            <PriceRow
              label={t("consultationPrices.online")}
              price={onlineConsulPrice}
              currency={currency}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EditablePriceRow({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

      <input
        type="number"
        min="0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full rounded-full border border-gray-200 px-7 py-2 text-sm font-semibold text-[#283C5D] outline-none transition focus:border-[#d8bd8d] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-[#283C5D]/35"
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative flex h-7 w-12 cursor-pointer items-center rounded-full p-1 transition ${
        checked ? "bg-[#283C5D]" : "bg-gray-300"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "translate-x-3" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}