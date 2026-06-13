"use client";

import { LinkIcon, Share2 } from "lucide-react";
import CardTitle from "../UI/CardTitle";
import UpgradeButton from "../UI/UpgradeButton";
import SocialLockedRow from "../UI/SocialLockedRow";
import GoogleReviewsButton from "../UI/GoogleReviewsButton";
import { useTranslations } from "next-intl";

type SocialLinksProps = {
  paidPlan?: string | null;
  clinicName?: string | null;
  workLatitude?: number | null;
  workLongitude?: number | null;
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
};

export default function SocialLinks({
  paidPlan,
  clinicName,
  workLatitude,
  workLongitude,
  googlePlaceId,
  googleReviewCount,
  googleRating,
}: SocialLinksProps) {
  const t = useTranslations("dashboard");

  const isStandard = paidPlan === "standard";


return (
  <div className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
    <CardTitle icon={<Share2 size={22} />} title={t("social.title")} />

    <div className="mt-8">
      <GoogleReviewsButton
        clinicName={clinicName}
        workLatitude={workLatitude}
        workLongitude={workLongitude}
        googlePlaceId={googlePlaceId}
        googleReviewCount={googleReviewCount}
        googleRating={googleRating}
      />

      {!isStandard ? (
        <>
          <SocialLockedRow
            locked={true}
            label={t("social.instagram")}
            iconSrc="/icons/igIcon.svg"
          />

          <SocialLockedRow
            locked={true}
            label={t("social.tiktok")}
            iconSrc="/icons/tiktokIcon.svg"
          />

          <div className="mt-7 text-center">
            <p className="text-sm font-medium text-[#283C5D]">
              {t("social.hiddenTitle")}
            </p>

            <p className="mt-1 text-sm text-[#283C5D]/60">
              {t("social.hiddenDescription")}
            </p>

            <UpgradeButton />
          </div>
        </>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-[#FAF9F7] p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#283C5D]">
              <LinkIcon size={22} />
            </div>

            <p className="mt-4 text-sm font-semibold text-[#283C5D]">
              {t("social.copyTitle")}
            </p>

            <p className="mt-1 text-sm text-[#283C5D]/60">
              {t("social.copyDescription")}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);
}