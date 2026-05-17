"use client";

import { useState } from "react";
import { Check, Pencil, WalletCards, X, LinkIcon } from "lucide-react";
import CardTitle from "@/components/dashboard/profile/UI/CardTitle";
import PriceRow from "@/components/dashboard/profile/UI/PriceRow";
import type { DoctorProfileData } from "../types";
import { useTranslations } from "next-intl";

type ConsultationPricesProps = {
  inClinicPrice?: number | null;
  onlineConsulPrice?: number | null;
  inClinicLink?: string | null;
  currency?: string | null;
  onUpdateProfile: (
    data: Partial<Omit<DoctorProfileData, "id" | "userId" | "user">>
  ) => void | Promise<void>;
};

export default function ConsultationPrices({
  inClinicPrice,
  onlineConsulPrice,
  inClinicLink,
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
  const [inClinicLinkValue, setInClinicLinkValue] = useState(
    inClinicLink || ""
  );
  const [errorMessage, setErrorMessage] = useState("");

  const hasInClinicLink = Boolean(inClinicLinkValue.trim());

  function handleCancel() {
    setClinicPriceValue(inClinicPrice?.toString() || "");
    setOnlinePriceValue(onlineConsulPrice?.toString() || "");
    setInClinicLinkValue(inClinicLink || "");
    setErrorMessage("");
    setIsEditing(false);
  }

  async function handleSave() {
    setErrorMessage("");

    if (!inClinicLinkValue.trim()) {
      setErrorMessage("Please add an in-clinic booking link before saving.");
      return;
    }

    await onUpdateProfile({
      inClinicPrice: clinicPriceValue ? Number(clinicPriceValue) : null,
      onlineConsulPrice: onlinePriceValue ? Number(onlinePriceValue) : null,
      inClinicLink: inClinicLinkValue.trim(),
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
          <EditableInClinicRow
            label={t("consultationPrices.inClinic")}
            priceValue={clinicPriceValue}
            onPriceChange={setClinicPriceValue}
            linkValue={inClinicLinkValue}
            onLinkChange={setInClinicLinkValue}
            hasError={!hasInClinicLink}
          />
        ) : (
          <div className="space-y-4">
            <PriceRow
              label={t("consultationPrices.inClinic")}
              price={inClinicPrice}
              currency={currency}
            />

            {inClinicLink ? (
              <a
                href={inClinicLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#d8bd8d]/60 px-4 py-2 text-xs font-semibold text-[#283C5D] transition hover:bg-[#d8bd8d]/10"
              >
                <LinkIcon size={14} />
                <span className="truncate">In-clinic booking link added</span>
              </a>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                Please add an in-clinic booking link.
              </div>
            )}
          </div>
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
            currency={currency}
          />
        )}

        {errorMessage ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function EditableInClinicRow({
  label,
  priceValue,
  linkValue,
  onPriceChange,
  onLinkChange,
  hasError,
}: {
  label: string;
  priceValue: string;
  linkValue: string;
  onPriceChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  hasError: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

      <div className="grid gap-3 md:grid-cols-[0.8fr_1.4fr]">
        <input
          type="number"
          min="0"
          value={priceValue}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-full border border-gray-200 px-7 py-2 text-sm font-semibold text-[#283C5D] outline-none transition focus:border-[#d8bd8d]"
        />

        <input
          type="url"
          value={linkValue}
          onChange={(e) => onLinkChange(e.target.value)}
          placeholder="Add in-clinic booking link"
          className={`w-full rounded-full border px-7 py-2 text-sm font-semibold text-[#283C5D] outline-none transition ${
            hasError
              ? "border-red-300 bg-red-50 placeholder:text-red-300 focus:border-red-400"
              : "border-gray-200 focus:border-[#d8bd8d]"
          }`}
        />
      </div>

      {hasError ? (
        <p className="mt-2 text-xs font-medium text-red-500">
          Required before saving consultation prices.
        </p>
      ) : null}
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