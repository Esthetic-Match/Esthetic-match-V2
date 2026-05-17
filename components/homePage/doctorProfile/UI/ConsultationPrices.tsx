import { WalletCards, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StripeConsultationCheckOutButton from "@/components/homePage/UI/StripeConsultationCheckOutButton";

type ConsultationPricesProps = {
  doctorProfileId: string;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  inClinicLink: string | null;
  currency: string | null;
};

function getCurrencySymbol(currency?: string | null) {
  switch (currency?.toLowerCase()) {
    case "usd":
      return "$";
    case "eur":
      return "€";
    case "gbp":
      return "£";
    case "chf":
      return "CHF";
  }
}

function formatPrice(
  price: number | null,
  currency?: string | null
) {
  if (price === null || price === undefined || price <= 0) {
    return null;
  }

  const symbol = getCurrencySymbol(currency);

  if(!symbol) {
    return price.toString();
  }

  return `${symbol}${price}`;
}

async function hasBoughtInClinicConsultation(doctorProfileId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return false;
  }

  const access = await prisma.inClinicConsultationAccess.findFirst({
    where: {
      patientUserId: session.user.id,
      doctorProfileId,
      approvedToView: true,
      booking: {
        status: "paid",
        consultationType: "IN_CLINIC",
      },
    },
  });

  return Boolean(access);
}

function PriceRow({
  label,
  price,
  consultationType,
  doctorProfileId,
  currency,
}: {
  label: string;
  price: number | null;
  consultationType: "IN_CLINIC" | "ONLINE";
  doctorProfileId: string;
  currency: string | null;
}) {
  const formattedPrice = formatPrice(price, currency);

  if (!formattedPrice) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

        <p className="text-lg font-semibold text-[#283C5D]">
          {formattedPrice}
        </p>
      </div>

      <StripeConsultationCheckOutButton
        doctorProfileId={doctorProfileId}
        consultationType={consultationType}
        price={price}
        currency={currency}
      />
    </div>
  );
}

async function InClinicUnlockedRow({
  label,
  inClinicLink,
}: {
  label: string;
  inClinicLink: string;
}) {
  const t = await getTranslations("doctor.doctor.profile.consultationPrices");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-3 text-sm text-[#283C5D]/60">{label}</p>

        <p className="text-lg font-semibold text-[#283C5D]">
          {t("bookingLinkUnlocked")}
        </p>
      </div>

      <a
        href={inClinicLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-[#283C5D] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        {t("openBookingLink")}
      </a>
    </div>
  );
}

export default async function ConsultationPrices({
  doctorProfileId,
  inClinicPrice,
  onlineConsulPrice,
  inClinicLink,
  currency,
}: ConsultationPricesProps) {
  const t = await getTranslations("doctor.doctor.profile.consultationPrices");

  const hasInClinicLink = Boolean(inClinicLink?.trim());
  const hasInClinicPrice =
    inClinicPrice !== null && inClinicPrice !== undefined && inClinicPrice > 0;
  const hasOnlinePrice =
    onlineConsulPrice !== null &&
    onlineConsulPrice !== undefined &&
    onlineConsulPrice > 0;

  const shouldShowInClinic = hasInClinicLink && hasInClinicPrice;
  const shouldShowOnline = hasOnlinePrice;

  const hasAnyPrice = shouldShowInClinic || shouldShowOnline;

  const hasBoughtInClinic = shouldShowInClinic
    ? await hasBoughtInClinicConsultation(doctorProfileId)
    : false;

  if (!hasAnyPrice) {
    return (
      <article
        aria-labelledby="consultation-prices-title"
        className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
      >
        <div className="flex items-center gap-3">
          <WalletCards
            size={22}
            className="text-[#d8bd8d]"
            aria-hidden="true"
          />

          <h2
            id="consultation-prices-title"
            className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
          >
            {t("title")}
          </h2>
        </div>

        <div className="mt-8 rounded-3xl bg-[#FAF9F7] p-5">
          <p className="text-sm font-medium text-[#283C5D]/70">
            {t("no prices")}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      aria-labelledby="consultation-prices-title"
      className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
      <div className="flex items-center gap-3">
        <WalletCards
          size={22}
          className="text-[#d8bd8d]"
          aria-hidden="true"
        />

        <h2
          id="consultation-prices-title"
          className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
        >
          {t("title")}
        </h2>
      </div>

      <div className="mt-10 space-y-8">
        {shouldShowInClinic ? (
          hasBoughtInClinic && inClinicLink ? (
            <InClinicUnlockedRow
              label={t("inClinic")}
              inClinicLink={inClinicLink}
            />
          ) : (
            <PriceRow
              label={t("inClinic")}
              price={inClinicPrice}
              consultationType="IN_CLINIC"
              doctorProfileId={doctorProfileId}
              currency={currency}
            />
          )
        ) : null}

        {shouldShowInClinic && shouldShowOnline ? (
          <div className="border-t border-gray-200" />
        ) : null}

        {shouldShowOnline ? (
          <PriceRow
            label={t("online")}
            price={onlineConsulPrice}
            consultationType="ONLINE"
            doctorProfileId={doctorProfileId}
            currency={currency}
          />
        ) : null}
      </div>
    </article>
  );
}