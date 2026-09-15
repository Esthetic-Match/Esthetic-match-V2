"use client";

import {
  CircleDollarSign,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect } from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

export type PublicProcedureViewData = {
  id: string;
  label: string;
  price: string | null;
  description: string | null;
  currency: string;
};

type PublicProcedureViewModalProps = {
  open: boolean;
  procedure: PublicProcedureViewData | null;
  onClose: () => void;
};

function formatPrice(
  value: string,
  currency: string,
  locale: string
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `${value} ${currency.toUpperCase()}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency:
        currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${value} ${currency.toUpperCase()}`;
  }
}

export default function PublicProcedureViewModal({
  open,
  procedure,
  onClose,
}: PublicProcedureViewModalProps) {
  const locale = useLocale();

  const t = useTranslations(
    "doctor.doctor.profile.procedureView"
  );

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open || !procedure) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17243A]/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#D8BD8D]/20 bg-white shadow-[0_30px_100px_rgba(20,31,50,0.30)]">
        {/* Decorative gold glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-[#F1E1C6]/40 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#283C5D]/10 bg-white text-[#283C5D]/55 shadow-sm transition hover:border-[#D8BD8D] hover:text-[#283C5D]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 pb-7 pt-8 text-center md:px-10 md:pb-8 md:pt-10">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EA] text-[#D8BD8D]">
            <Sparkles className="h-5 w-5" />
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D8BD8D]">
            {t("eyebrow")}
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl">
            {procedure.label}
          </h2>

          <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-[#D8BD8D] to-transparent" />
        </div>

        <div className="relative space-y-5 px-6 pb-8 md:px-10 md:pb-10">
          {/* Price */}
          <div className="rounded-2xl border border-[#283C5D]/8 bg-[#FAF9F7] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#D8BD8D] shadow-sm">
                <CircleDollarSign className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#283C5D]/45">
                  {t("price")}
                </p>

                {procedure.price ? (
                  <p className="mt-1 text-xl font-bold text-[#283C5D]">
                    {formatPrice(
                      procedure.price,
                      procedure.currency,
                      locale
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-medium text-[#283C5D]/55">
                    {t("priceOnRequest")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-[#283C5D]/8 bg-white p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F3EA] text-[#D8BD8D]">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#283C5D]/45">
                  {t("about")}
                </p>

                {procedure.description ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#283C5D]/70">
                    {procedure.description}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[#283C5D]/50">
                    {t("noDescription")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="px-3 text-center text-xs leading-5 text-[#283C5D]/40">
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}