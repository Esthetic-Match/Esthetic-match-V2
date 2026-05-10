import { LinkIcon, Share2 } from "lucide-react";
import CardTitle from "../UI/CardTitle";
import UpgradeButton from "../UI/UpgradeButton";
import SocialLockedRow from "../UI/SocialLockedRow";
import GoogleReviewsButton from "../UI/GoogleReviewsButton";
import { useTranslations } from "next-intl";

type SocialLinksProps = {
  socialMediaLink?: string | null;
  clinicName?: string | null;
  workAddress?: string | null;
  city?: string | null;
  country?: string | null;
  workLatitude?: number | null;
  workLongitude?: number | null;
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
};

export default function SocialLinks({
  socialMediaLink,
  clinicName,
  workLatitude,
  workLongitude,
  googlePlaceId,
  googleReviewCount,
  googleRating,
}: SocialLinksProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
      <CardTitle
        icon={<Share2 size={22} />}
        title={t("social.title")}
      />

      {socialMediaLink ? (
        <a
          href={socialMediaLink}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex w-full items-center justify-center rounded-full border border-[#d8bd8d]/60 px-6 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#d8bd8d]/10"
        >
          <LinkIcon size={15} className="mr-2" />
          {t("social.open")}
        </a>
      ) : (
        <div className="mt-8">
          <GoogleReviewsButton
            clinicName={clinicName}
            workLatitude={workLatitude}
            workLongitude={workLongitude}
            googlePlaceId={googlePlaceId}
            googleReviewCount={googleReviewCount}
            googleRating={googleRating}
          />

          <SocialLockedRow locked={true} label={t("social.instagram")} iconSrc="/icons/igIcon.svg" />
          <SocialLockedRow locked={true} label={t("social.tiktok")} iconSrc="/icons/tiktokIcon.svg" />

          <div className="mt-7 text-center">
            <p className="text-sm font-medium text-[#283C5D]">
              {t("social.hiddenTitle")}
            </p>
            <p className="mt-1 text-sm text-[#283C5D]/60">
              {t("social.hiddenDescription")}
            </p>

            <UpgradeButton />
          </div>
        </div>
      )}
    </div>
  );
}