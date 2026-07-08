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
  stripeConnectOnboardingComplete?: boolean | null;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void | Promise<void>;
};

export default function ConsultationPrices({
  inClinicPrice,
  onlineConsulPrice,
  onlineActive,
  stripeConnectOnboardingComplete,
  currency,
  onUpdateProfile,
}: ConsultationPricesProps) {
  const t = useTranslations("dashboard");

  const canActivateOnlineConsultation = Boolean(
    stripeConnectOnboardingComplete
  );

  const effectiveOnlineActive =
    canActivateOnlineConsultation && Boolean(onlineActive);

const [isEditing, setIsEditing] = useState(false);
const [clinicPriceValue, setClinicPriceValue] = useState("");
const [onlinePriceValue, setOnlinePriceValue] = useState("");
const [onlineActiveValue, setOnlineActiveValue] = useState(false);

function getClinicPriceDraft() {
  return inClinicPrice?.toString() ?? "";
}

function getOnlinePriceDraft() {
  return onlineConsulPrice?.toString() ?? "";
}

function handleEdit() {
  setClinicPriceValue(getClinicPriceDraft());
  setOnlinePriceValue(getOnlinePriceDraft());
  setOnlineActiveValue(effectiveOnlineActive);
  setIsEditing(true);
}

function handleCancel() {
  setClinicPriceValue(getClinicPriceDraft());
  setOnlinePriceValue(getOnlinePriceDraft());
  setOnlineActiveValue(effectiveOnlineActive);
  setIsEditing(false);
}

  async function handleSave() {
    await onUpdateProfile({
      inClinicPrice: clinicPriceValue ? Number(clinicPriceValue) : null,
      onlineConsulPrice: onlinePriceValue ? Number(onlinePriceValue) : null,

      // Important:
      // If Stripe onboarding is incomplete, force onlineActive to false.
      onlineActive: canActivateOnlineConsultation ? onlineActiveValue : false,
    });

    setIsEditing(false);
  }

  return (
    <div
      className={`rounded-3xl border p-6 shadow-lg transition md:p-8 ${
        canActivateOnlineConsultation
          ? "border-gray-300/10 bg-white"
          : "border-red-200 bg-red-50"
      }`}
    >
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
            onClick={handleEdit}
            className="flex h-8 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white active:scale-[0.98]"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>

      <div className="mt-10 space-y-8">

      {!canActivateOnlineConsultation ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/70 px-5 py-4">
          <p className="text-sm font-medium text-red-800">
            {t("consultationPrices.stripeOnboardingRequired")}
          </p>
          <p className="text-sm mt-4 font-medium text-red-800">
            {t("consultationPrices.Instructions")}
          </p>
        </div>
      ) : isEditing ? (
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
                {effectiveOnlineActive
                  ? t("consultationPrices.onlineActiveEnabled")
                  : t("consultationPrices.onlineActiveDisabled")}
              </p>
            </div>
                
            <StatusBadge
              active={effectiveOnlineActive}
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

        <div className="border-t border-gray-200" />

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
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onChange(!checked);
      }}
      className={`relative flex h-7 w-14 items-center rounded-full p-1 transition ${
        checked ? "bg-[#283C5D]" : "bg-gray-300"
      } ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer active:scale-[0.98]"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}